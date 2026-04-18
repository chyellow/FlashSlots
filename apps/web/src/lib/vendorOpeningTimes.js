/**
 * Maps an availability slot (week day + HH:mm strings) to concrete instants for the API.
 * Handles slots that cross local midnight (e.g. 23:00–00:00).
 */

function timeStrToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map((x) => parseInt(x, 10))
  return h * 60 + m
}

export function getNextDateForDay(dayIndex, timeStr) {
  const now = new Date()
  const result = new Date(now)

  result.setDate(now.getDate() + ((dayIndex + 7 - now.getDay()) % 7))

  const [hours, minutes] = timeStr.split(":")
  result.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)

  if (result < now) {
    result.setDate(result.getDate() + 7)
  }

  return result
}

/**
 * @param {object} slot — shape from Availability: week_day, start_time, end_time, duration, etc.
 * @param {number} expireMins — minutes before starts_at when listing expires
 * @returns {{ starts_at: Date, ends_at: Date, listing_expires_at: Date }}
 */
export function getOpeningTimestamps(slot, expireMins) {
  const startM = timeStrToMinutes(slot.start_time)
  const endM = timeStrToMinutes(slot.end_time)

  if (endM === startM) {
    throw new Error("Each slot must have a positive duration (end time after start time).")
  }

  let starts_at = getNextDateForDay(slot.week_day, slot.start_time)
  let ends_at = getNextDateForDay(slot.week_day, slot.end_time)

  if (endM < startM) {
    ends_at = new Date(ends_at.getTime() + 24 * 60 * 60 * 1000)
  } else if (ends_at <= starts_at) {
    ends_at = new Date(ends_at.getTime() + 24 * 60 * 60 * 1000)
  }

  const listing_expires_at = new Date(starts_at.getTime() - expireMins * 60000)

  return { starts_at, ends_at, listing_expires_at }
}

/**
 * Posts openings one at a time. On first failure, best-effort deletes openings
 * created in this batch so the user does not end up with a half-published set.
 *
 * @param {object[]} slots
 * @param {typeof import("./queries/openings").postOpening} postOpening
 * @param {typeof import("./queries/openings").deleteOpening} deleteOpening
 */
export async function publishOpeningSlotsWithRollback(slots, postOpening, deleteOpening) {
  const createdIds = []

  try {
    for (const slot of slots) {
      const raw = slot.duration != null && slot.duration !== "" ? parseInt(slot.duration, 10) : 30
      const expireMins = Number.isFinite(raw) && raw >= 0 ? raw : 30

      const { starts_at, ends_at, listing_expires_at } = getOpeningTimestamps(slot, expireMins)

      const price = parseFloat(slot.price)
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Each slot must have a valid price.")
      }

      const created = await postOpening({
        title: slot.employee || "Available Appointment",
        staff_name: slot.name || null,
        starts_at: starts_at.toISOString(),
        ends_at: ends_at.toISOString(),
        listed_price: price,
        payment_option: "BOTH",
        listing_expires_at: listing_expires_at.toISOString(),
      })

      if (created && typeof created.opening_id === "number") {
        createdIds.push(created.opening_id)
      }
    }
  } catch (err) {
    for (const id of [...createdIds].reverse()) {
      try {
        await deleteOpening(id)
      } catch {
        /* best-effort rollback */
      }
    }
    throw err
  }
}
