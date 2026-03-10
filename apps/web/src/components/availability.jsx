import * as React from "react"
import { Clock, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import tunnel from "tunnel-rat"
import { nanoid } from "nanoid"

// --- Utils ---

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const formatDisplayTime = (time, useAmPm) => {
  if (!useAmPm) return time
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  // Drop :00 to save space
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

const generateId = () => nanoid()

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/**
 * Merges adjacent (contiguous) time spans on the same day.
 * Adjacent means one span's end_time equals another's start_time.
 * The merged span keeps the id of the earliest span.
 */
const mergeAdjacentSpans = spans => {
  if (spans.length === 0) return spans

  const byDay = new Map()
  spans.forEach(span => {
    const daySpans = byDay.get(span.week_day) || []
    daySpans.push(span)
    byDay.set(span.week_day, daySpans)
  })

  const merged = []

  byDay.forEach(daySpans => {
    const sorted = [...daySpans].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))

    let current = sorted[0]

    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i]

      if (current.end_time === next.start_time) {
        current = {
          ...current,
          end_time: next.end_time,
        }
      } else {
        merged.push(current)
        current = next
      }
    }

    merged.push(current)
  })

  return merged
}

// --- Hooks ---

function useCalendarCreation({
  containerRef,
  timeIncrements,
  startTime,
  endTime,
  events,
  disabledEvents = [],
  onCreate,
  colIndex,
  isDayDisabled = false
}) {
  const [isCreating, setIsCreating] = React.useState(false)
  const [creationStart, setCreationStart] = React.useState(null)
  const [currentMouseY, setCurrentMouseY] = React.useState(null)

  const totalMinutes = (endTime - startTime) * 60
  const startOffset = startTime * 60

  const sortedConstraints = React.useMemo(() => {
    return [...events, ...disabledEvents].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
  }, [events, disabledEvents])

  const getMinutesFromY = (y) => {
    if (!containerRef.current) return 0
    const rect = containerRef.current.getBoundingClientRect()
    const relativeY = y - rect.top
    const percentage = Math.max(0, Math.min(1, relativeY / rect.height))
    const minutes = percentage * totalMinutes + startOffset
    return Math.round(minutes / timeIncrements) * timeIncrements;
  }

  const handlePointerDown = (e) => {
    if (isDayDisabled) return
    if (e.target !== e.currentTarget) return
    e.preventDefault()

    containerRef.current?.setPointerCapture(e.pointerId)

    const startMins = getMinutesFromY(e.clientY)

    const isOverlapping = sortedConstraints.some(ev => {
      const s = timeToMinutes(ev.start_time)
      const end = timeToMinutes(ev.end_time)
      return startMins >= s && startMins < end
    })
    if (isOverlapping) return

    const prevEvent = sortedConstraints.filter(ev => timeToMinutes(ev.end_time) <= startMins).pop()
    const nextEvent = sortedConstraints.find(ev => timeToMinutes(ev.start_time) >= startMins)

    const minStartMins = prevEvent ? timeToMinutes(prevEvent.end_time) : startOffset
    const maxEndMins = nextEvent ? timeToMinutes(nextEvent.start_time) : endTime * 60

    setCreationStart(startMins)
    setCurrentMouseY(startMins)
    setIsCreating(true)

    const handlePointerMove = (ev) => {
      const currentMins = getMinutesFromY(ev.clientY)
      const clampedMins = Math.max(minStartMins, Math.min(currentMins, maxEndMins))
      setCurrentMouseY(clampedMins)
    }

    const handlePointerUp = (ev) => {
      const currentMins = getMinutesFromY(ev.clientY)

      let finalStart = Math.min(startMins, currentMins)
      let finalEnd = Math.max(startMins, currentMins)

      finalStart = Math.max(minStartMins, finalStart)
      finalEnd = Math.min(maxEndMins, finalEnd)

      if (finalEnd - finalStart < timeIncrements) {
        finalEnd = Math.min(finalStart + timeIncrements, maxEndMins)
      }

      if (finalEnd - finalStart <= timeIncrements) {
        const oneHourEnd = finalStart + 60
        finalEnd = Math.min(oneHourEnd, maxEndMins)
      }

      if (finalEnd > finalStart) {
        onCreate(colIndex, finalStart, finalEnd)
      }

      setIsCreating(false)
      setCreationStart(null)
      setCurrentMouseY(null)

      containerRef.current?.releasePointerCapture(ev.pointerId)

      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  return {
    isCreating,
    creationStart,
    currentMouseY,
    totalMinutes,
    startOffset,
    sortedConstraints,
    handlePointerDown,
  }
}

// --- Components ---

const AvailabilityDragContext = React.createContext(null)

export function Availability({
  value = [],
  onValueChange,
  disabled = [],
  days = [0, 1, 2, 3, 4, 5, 6],
  showAllDays = true,
  timeIncrements = 30,
  startTime = 7,
  endTime = 23,
  useAmPm = false,
  mergeAdjacent = true,
  slotClassName = "bg-muted",
  className
}) {
  const [internalValue, setInternalValue] = React.useState(value)

  const dragPreviewTunnel = React.useMemo(() => tunnel(), [])
  const [activeId, setActiveId] = React.useState(null)
  const [overDayIndex, setOverDayIndex] = React.useState(null)
  const [deltaY, setDeltaY] = React.useState(0)
  const [isDropValid, setIsDropValid] = React.useState(true)

  const mainContainerRef = React.useRef(null)

  const renderedDays = React.useMemo(() => {
    if (showAllDays) {
      return [0, 1, 2, 3, 4, 5, 6]
    }
    return days
  }, [days, showAllDays])

  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const updateValue = (newValue, shouldMerge = false) => {
    const finalValue = shouldMerge && mergeAdjacent ? mergeAdjacentSpans(newValue) : newValue
    setInternalValue(finalValue)
    onValueChange?.(finalValue)
  }

  const handleResize = (id, newStart, newEnd, isComplete = false) => {
    const newValue = internalValue.map(span => {
      if (span.id === id) {
        return { ...span, start_time: newStart, end_time: newEnd }
      }
      return span
    })
    updateValue(newValue, isComplete)
  }

  const handleCreate = (dayIndex, startMinutes, endMinutes) => {
    const newSpan = {
      id: generateId(),
      week_day: dayIndex,
      start_time: minutesToTime(startMinutes),
      end_time: minutesToTime(endMinutes),
      active: true,
    }
    updateValue([...internalValue, newSpan], true)
  }

  const handleDelete = (id) => {
    updateValue(internalValue.filter(s => s.id !== id), true)
  }

  const handleMove = (id, newStart, newEnd, newDayIndex) => {
    const newValue = internalValue.map(span => {
      if (span.id === id) {
        return { ...span, start_time: newStart, end_time: newEnd, week_day: newDayIndex }
      }
      return span
    })
    updateValue(newValue, true)
  }

  const validatePlacement = (span, targetDayIndex, deltaY, containerHeight) => {
    const totalMinutes = (endTime - startTime) * 60
    const pixelsPerMinute = containerHeight / totalMinutes
    const deltaMinutesRaw = deltaY / pixelsPerMinute
    const deltaMinutes = Math.round(deltaMinutesRaw / timeIncrements) * timeIncrements

    const originalStart = timeToMinutes(span.start_time)
    const duration = timeToMinutes(span.end_time) - originalStart

    const newStart = originalStart + deltaMinutes
    const newEnd = newStart + duration

    const dayStartMins = startTime * 60
    const dayEndMins = endTime * 60

    if (newStart < dayStartMins || newEnd > dayEndMins) {
      return { isValid: false, newStart, duration }
    }

    if (!days.includes(targetDayIndex)) {
      return { isValid: false, newStart, duration }
    }

    const dayEvents = internalValue.filter(e => e.week_day === targetDayIndex && e.id !== span.id)
    const hasEventOverlap = dayEvents.some(e => {
      const eStart = timeToMinutes(e.start_time)
      const eEnd = timeToMinutes(e.end_time)
      return newStart < eEnd && newEnd > eStart
    })

    if (hasEventOverlap) {
      return { isValid: false, newStart, duration }
    }

    const dayDisabled = disabled.filter(e => e.week_day === targetDayIndex)
    const hasDisabledOverlap = dayDisabled.some(e => {
      const eStart = timeToMinutes(e.start_time)
      const eEnd = timeToMinutes(e.end_time)
      return newStart < eEnd && newEnd > eStart
    })

    if (hasDisabledOverlap) {
      return { isValid: false, newStart, duration }
    }

    return { isValid: true, newStart, duration }
  }

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }))

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    setDeltaY(0)
    setOverDayIndex(null)
    setIsDropValid(true)
  }

  const handleDragMove = (event) => {
    setDeltaY(event.delta.y)
    checkValidity(event.active.id, event.over?.id, event.delta.y)
  }

  const handleDragOver = (event) => {
    if (event.over) {
      const dayIndex = parseInt(event.over.id.toString().replace("day-", ""), 10)
      if (!isNaN(dayIndex)) {
        setOverDayIndex(dayIndex)
      }
    } else {
      setOverDayIndex(null)
    }
    checkValidity(event.active.id, event.over?.id, event.delta.y)
  }

  const checkValidity = (activeId, overId, currentDeltaY) => {
    if (!mainContainerRef.current || !overId) {
      setIsDropValid(false)
      return
    }

    const span = internalValue.find(s => s.id === activeId)
    if (!span) return

    const targetDayIndex = parseInt(overId.toString().replace("day-", ""), 10)
    if (isNaN(targetDayIndex)) {
      setIsDropValid(false)
      return
    }

    const result = validatePlacement(span, targetDayIndex, currentDeltaY, mainContainerRef.current.clientHeight)
    setIsDropValid(result.isValid)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverDayIndex(null)
    setDeltaY(0)
    setIsDropValid(true)
  }

  const handleDragEnd = (event) => {
    const { active, delta, over } = event
    setActiveId(null)
    setOverDayIndex(null)
    setDeltaY(0)
    setIsDropValid(true)

    const span = internalValue.find(s => s.id === active.id)
    if (!span || !mainContainerRef.current || !over) return

    const targetDayIndex = parseInt(over.id.toString().replace("day-", ""), 10)
    if (isNaN(targetDayIndex)) return

    const { isValid, newStart, duration } = validatePlacement(span, targetDayIndex, delta.y, mainContainerRef.current.clientHeight)

    if (!isValid) return

    const newEndVal = newStart + duration
    handleMove(span.id, minutesToTime(newStart), minutesToTime(newEndVal), targetDayIndex)
  }

  const activeSpan = React.useMemo(
    () => internalValue.find(s => s.id === activeId) || null,
    [activeId, internalValue]
  )

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>
      <AvailabilityDragContext.Provider
        value={{
          dragPreviewTunnel,
          activeId,
          activeSpan,
          overDayIndex,
          deltaY,
          timeIncrements,
          isDropValid,
        }}>
        <div
          suppressHydrationWarning
          className={cn(
            "flex h-[600px] w-full flex-col overflow-hidden rounded-md border bg-background select-none touch-none",
            className
          )}>
          {/* Header */}
          <div className="flex w-full border-b bg-muted/40">
            <div
              className="w-14 flex-shrink-0 border-r p-2 text-xs font-medium text-muted-foreground" />
            <div className="flex flex-1">
              {renderedDays.map(dayIndex => {
                const isActive = days.includes(dayIndex)
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      "flex-1 border-r px-1 py-3 text-center text-sm font-medium last:border-r-0",
                      !isActive && "bg-muted/30 text-muted-foreground"
                    )}>
                    <span className="hidden sm:inline">{DAYS[dayIndex]}</span>
                    <span className="sm:hidden">{SHORT_DAYS[dayIndex]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-y-auto relative" ref={mainContainerRef}>
            {/* Time Labels */}
            <div className="w-14 flex-shrink-0 border-r bg-muted/10 flex flex-col">
              {Array.from({ length: endTime - startTime }).map((_, i) => {
                const hour = startTime + i
                return (
                  <div
                    key={hour}
                    className="flex-1 border-b border-dashed border-muted-foreground/20 relative flex items-center justify-start pl-1.5">
                    <span className="text-[10px] text-muted-foreground leading-none">{formatDisplayTime(`${hour}:00`, useAmPm)}</span>
                  </div>
                );
              })}
            </div>

            {/* Days Grid */}
            <div className="flex flex-1 relative">
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {Array.from({ length: endTime - startTime }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-b border-dashed border-foreground/10 dark:border-muted/60 w-full relative" />
                ))}
              </div>

              {renderedDays.map((dayIndex, i) => {
                const isActive = days.includes(dayIndex)

                return (
                  <DayColumn
                    key={dayIndex}
                    dayIndex={dayIndex}
                    colIndex={i}
                    startTime={startTime}
                    endTime={endTime}
                    timeIncrements={timeIncrements}
                    events={internalValue.filter(e => e.week_day === dayIndex)}
                    disabledEvents={disabled.filter(e => e.week_day === dayIndex)}
                    onCreate={handleCreate}
                    onResize={handleResize}
                    onDelete={handleDelete}
                    useAmPm={useAmPm}
                    isDayDisabled={!isActive}
                    slotClassName={slotClassName} />
                );
              })}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeSpan && (
              <div className="w-full h-full cursor-grabbing relative opacity-80">
                <dragPreviewTunnel.Out />
              </div>
            )}
          </DragOverlay>
        </div>
      </AvailabilityDragContext.Provider>
    </DndContext>
  );
}

function DayColumn({
  dayIndex,
  colIndex,
  startTime,
  endTime,
  timeIncrements,
  events,
  disabledEvents = [],
  onCreate,
  onResize,
  onDelete,
  useAmPm,
  isDayDisabled = false,
  slotClassName = "bg-muted"
}) {
  const containerRef = React.useRef(null)

  const context = React.useContext(AvailabilityDragContext)

  const { setNodeRef } = useDroppable({
    id: `day-${dayIndex}`,
    disabled: isDayDisabled,
  })

  const mergedRef = (node) => {
    containerRef.current = node
    setNodeRef(node)
  }

  const { isCreating, creationStart, currentMouseY, totalMinutes, startOffset, sortedConstraints, handlePointerDown } =
    useCalendarCreation({
      containerRef,
      timeIncrements,
      startTime,
      endTime,
      events,
      disabledEvents,
      onCreate,
      colIndex,
      isDayDisabled,
    })

  const showGhost = context?.activeId && context.overDayIndex === dayIndex && containerRef.current && !isDayDisabled

  const ghostStyle = React.useMemo(() => {
    if (!showGhost || !context?.activeSpan || !containerRef.current) return null

    const span = context.activeSpan
    const containerHeight = containerRef.current.clientHeight
    const pixelsPerMinute = containerHeight / totalMinutes

    const deltaMinutesRaw = context.deltaY / pixelsPerMinute
    const deltaMinutes = Math.round(deltaMinutesRaw / timeIncrements) * timeIncrements

    const originalStart = timeToMinutes(span.start_time)
    const duration = timeToMinutes(span.end_time) - originalStart

    const newStart = originalStart + deltaMinutes

    return {
      top: `${((newStart - startOffset) / totalMinutes) * 100}%`,
      height: `${(duration / totalMinutes) * 100}%`,
    }
  }, [
    context?.activeId,
    context?.deltaY,
    context?.activeSpan,
    context?.overDayIndex,
    timeIncrements,
    totalMinutes,
    startOffset,
    showGhost,
  ])

  return (
    <div
      ref={mergedRef}
      className={cn(
        "flex-1 relative border-r last:border-r-0 touch-none",
        isDayDisabled && "bg-muted/30",
        context?.activeId && "z-10"
      )}
      onPointerDown={handlePointerDown}>
      {/* Full Day Disabled Overlay */}
      {isDayDisabled && (
        <div
          className="absolute inset-0 bg-muted/10 pointer-events-none z-20"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(128,128,128,0.15) 5px, rgba(128,128,128,0.15) 10px)`,
          }} />
      )}
      {/* Disabled Regions */}
      {disabledEvents.map((disabled, i) => {
        const startMins = timeToMinutes(disabled.start_time)
        const endMins = timeToMinutes(disabled.end_time)
        const duration = endMins - startMins

        return (
          <div
            key={`disabled-${i}`}
            className="absolute left-0 right-0 bg-muted/40 bg-stripes-muted pointer-events-none z-0"
            style={{
              top: `${((startMins - startOffset) / totalMinutes) * 100}%`,
              height: `${(duration / totalMinutes) * 100}%`,
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(128,128,128,0.15) 5px, rgba(128,128,128,0.15) 10px)`,
            }} />
        );
      })}
      {/* Ghost Element */}
      {ghostStyle && (
        <div
          className={cn(
            "absolute left-1 right-1 rounded-md border z-0 pointer-events-none transition-all duration-100 ease-out",
            context?.isDropValid ? "bg-foreground/20 border-foreground/30" : "bg-destructive/20 border-destructive/50"
          )}
          style={ghostStyle} />
      )}
      {events.map((event) => {
        const otherConstraints = sortedConstraints.filter(e => e.id !== event.id)

        const eventStart = timeToMinutes(event.start_time)
        const eventEnd = timeToMinutes(event.end_time)

        const prevItem = otherConstraints.filter(e => timeToMinutes(e.end_time) <= eventStart).pop()
        const nextItem = otherConstraints.find(e => timeToMinutes(e.start_time) >= eventEnd)

        const minStart = prevItem ? timeToMinutes(prevItem.end_time) : startOffset
        const maxEnd = nextItem ? timeToMinutes(nextItem.start_time) : endTime * 60

        const isDragging = context?.activeId === event.id

        return (
          <DraggableTimeSpan
            key={event.id}
            span={event}
            startTime={startTime}
            endTime={endTime}
            minStart={minStart}
            maxEnd={maxEnd}
            onResize={onResize}
            onDelete={onDelete}
            useAmPm={useAmPm}
            timeIncrements={timeIncrements}
            containerRef={containerRef}
            isDragging={isDragging}
            isLocked={isDayDisabled}
            slotClassName={slotClassName} />
        );
      })}
      {isCreating && creationStart !== null && currentMouseY !== null && (
        <div
          className="absolute left-0 right-0 mx-1 rounded bg-primary/30 border border-primary z-20 pointer-events-none"
          style={{
            top: `${((Math.min(creationStart, currentMouseY) - startOffset) / totalMinutes) * 100}%`,
            height: `${(Math.abs(currentMouseY - creationStart) / totalMinutes) * 100}%`,
          }} />
      )}
    </div>
  );
}

function DraggableTimeSpan({
  span,
  startTime,
  endTime,
  minStart,
  maxEnd,
  onResize,
  onDelete,
  useAmPm,
  timeIncrements,
  containerRef,
  isDragging,
  isLocked = false,
  slotClassName = "bg-muted"
}) {
  const context = React.useContext(AvailabilityDragContext)
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: span.id,
    data: span,
    disabled: isLocked,
  })

  const startMinutes = timeToMinutes(span.start_time)
  const endMinutes = timeToMinutes(span.end_time)
  const totalMinutes = (endTime - startTime) * 60
  const startOffset = startTime * 60
  const durationMinutes = endMinutes - startMinutes

  const style = {
    top: `${((startMinutes - startOffset) / totalMinutes) * 100}%`,
    height: `${(durationMinutes / totalMinutes) * 100}%`,
    opacity: isDragging ? 0 : isLocked ? 0.6 : 1,
  }

  const handleResizeStart = (e, edge) => {
    if (isLocked) return
    e.stopPropagation()
    e.preventDefault()

    const target = e.target
    target.setPointerCapture(e.pointerId)

    const initialY = e.clientY
    const initialStart = startMinutes
    const initialEnd = endMinutes

    const handlePointerMove = (ev) => {
      if (!containerRef.current) return

      const containerHeight = containerRef.current.clientHeight
      const pixelsPerMinute = containerHeight / totalMinutes
      const deltaY = ev.clientY - initialY
      const deltaMinutes = Math.round(deltaY / pixelsPerMinute / timeIncrements) * timeIncrements

      if (deltaMinutes === 0) return

      let newStart = initialStart
      let newEnd = initialEnd

      if (edge === "top") {
        newStart += deltaMinutes
        if (newStart < minStart) newStart = minStart
        if (newStart >= newEnd - timeIncrements) newStart = newEnd - timeIncrements
      } else {
        newEnd += deltaMinutes
        if (newEnd > maxEnd) newEnd = maxEnd
        if (newEnd <= newStart + timeIncrements) newEnd = newStart + timeIncrements
      }

      onResize(span.id, minutesToTime(newStart), minutesToTime(newEnd), false)
    }

    const handlePointerUp = (ev) => {
      target.releasePointerCapture(ev.pointerId)

      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight
        const pixelsPerMinute = containerHeight / totalMinutes
        const deltaY = ev.clientY - initialY
        const deltaMinutes = Math.round(deltaY / pixelsPerMinute / timeIncrements) * timeIncrements

        let newStart = initialStart
        let newEnd = initialEnd

        if (edge === "top") {
          newStart += deltaMinutes
          if (newStart < minStart) newStart = minStart
          if (newStart >= newEnd - timeIncrements) newStart = newEnd - timeIncrements
        } else {
          newEnd += deltaMinutes
          if (newEnd > maxEnd) newEnd = maxEnd
          if (newEnd <= newStart + timeIncrements) newEnd = newStart + timeIncrements
        }

        onResize(span.id, minutesToTime(newStart), minutesToTime(newEnd), true)
      }

      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  const canResize = !isLocked
  const canDelete = !isLocked

  const content = (
    <>
      {/* Resize Handle Top */}
      {canResize && (
        <div
          className="absolute top-0 left-0 right-0 h-4 -mt-2 cursor-row-resize z-10"
          onPointerDown={e => handleResizeStart(e, "top")} />
      )}
      <div
        className="absolute top-0 left-1 right-1 h-1 bg-transparent group-hover:bg-foreground/20 rounded-t-sm" />

      {/* Drag Handle Area */}
      <div
        className={cn(
          "absolute inset-0 top-2 bottom-2 z-0",
          canResize ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
        {...listeners}
        {...attributes} />

      <TimeSpanCard
        span={span}
        useAmPm={useAmPm}
        duration={durationMinutes / 60}
        isLocked={isLocked} />

      {/* Resize Handle Bottom */}
      {canResize && (
        <div
          className="absolute bottom-0 left-0 right-0 h-4 -mb-2 cursor-row-resize z-10"
          onPointerDown={e => handleResizeStart(e, "bottom")} />
      )}
      <div
        className="absolute bottom-0 left-1 right-1 h-1 bg-transparent group-hover:bg-foreground/20 rounded-b-sm" />
    </>
  )

  // The inner slot element (shared between context menu wrapper and non-context-menu)
  const slotElement = (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "absolute left-1 right-1 rounded border p-3 shadow-sm text-xs group overflow-hidden touch-none",
        slotClassName,
        isDragging && "opacity-0",
        isLocked && "border-dashed opacity-60 cursor-default bg-muted/50"
      )}>
      {content}
    </div>
  )

  return (
    <>
      {/* Wrap in ContextMenu for delete action (desktop: right-click, mobile: long-press) */}
      {canDelete ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            {slotElement}
          </ContextMenuTrigger>
          <ContextMenuContent className="w-40">
            <ContextMenuItem
              variant="destructive"
              onSelect={() => onDelete(span.id)}
            >
              Delete slot
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        slotElement
      )}

      {/* Tunnel visual content to overlay if dragging */}
      {isDragging && context && (
        <context.dragPreviewTunnel.In>
          <div
            className={cn(
              "absolute left-0 right-0 rounded-md border p-3 shadow-lg text-xs overflow-hidden h-full w-full",
              context.isDropValid ? "border-foreground/50 bg-foreground/10" : "border-destructive/50 bg-destructive/20"
            )}>
            <div
              className="absolute top-0 left-1 right-1 h-1 bg-transparent group-hover:bg-foreground/20 rounded-t-sm" />
            <TimeSpanCard
              span={span}
              useAmPm={useAmPm}
              duration={durationMinutes / 60} />
            <div
              className="absolute bottom-0 left-1 right-1 h-1 bg-transparent group-hover:bg-foreground/20 rounded-b-sm" />
          </div>
        </context.dragPreviewTunnel.In>
      )}
    </>
  );
}

function TimeSpanCard({
  span,
  useAmPm,
  duration,
  isLocked = false,
}) {
  const calculatedDuration = duration || (timeToMinutes(span.end_time) - timeToMinutes(span.start_time)) / 60

  return (
    <div
      className="h-full flex flex-col relative items-between text-foreground timespan-inner-area pointer-events-none">
      <div className="flex flex-col gap-0.5 text-inherit">
        <p className="font-semibold leading-none">{formatDisplayTime(span.start_time, useAmPm)}</p>
        {/* Only show duration when the slot is tall enough (2h+) */}
        {calculatedDuration >= 2 && (
          <div className="flex items-center gap-0.5">
            <Clock className="h-2 w-2" />{" "}
            <p className="text-[10px] opacity-80">{calculatedDuration.toFixed(1).replace(".0", "")}h</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-auto text-inherit">
        {isLocked && <Settings className="h-3 w-3 opacity-50" />}
        <p className="font-semibold leading-none !text-inherit">{formatDisplayTime(span.end_time, useAmPm)}</p>
      </div>
    </div>
  );
}