/**
 * Maps an availability slot (date + HH:mm strings) to concrete instants for the API.
 * Handles slots that cross local midnight (e.g. 23:00–00:00).
 */

function timeStrToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map((x) => parseInt(x, 10))
  return h * 60 + m
}

/**
 * Combines a "YYYY-MM-DD" date key and a "HH:mm" time string into a local Date.
 * Uses local date components (not UTC) so the resulting Date matches the calendar
 * cell the user clicked, regardless of timezone.
 */
function combineDateAndTime(dateKey, timeStr) {
  const [y, m, d] = dateKey.split("-").map((x) => parseInt(x, 10))
  const [h, min] = timeStr.split(":").map((x) => parseInt(x, 10))
  return new Date(y, m - 1, d, h, min, 0, 0)
}

/**
 * @param {object} slot — shape from Availability: date ("YYYY-MM-DD"), start_time, end_time, duration, etc.
 * @param {number} expireMins — minutes before starts_at when listing expires
 * @returns {{ starts_at: Date, ends_at: Date, listing_expires_at: Date }}
 */
export function getOpeningTimestamps(slot, expireMins) {
  if (!slot.date) {
    throw new Error("Slot is missing a date.")
  }

  const startM = timeStrToMinutes(slot.start_time)
  const endM = timeStrToMinutes(slot.end_time)

  if (endM === startM) {
    throw new Error("Each slot must have a positive duration (end time after start time).")
  }

  const starts_at = combineDateAndTime(slot.date, slot.start_time)
  let ends_at = combineDateAndTime(slot.date, slot.end_time)

  // Slot crosses midnight (e.g. 23:00–00:00) — push end to next day
  if (endM <= startM) {
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