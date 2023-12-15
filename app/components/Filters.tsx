import React from 'react'
import type { EventJSON } from '~/data/Event'

type EventFilter = (
  event: EventJSON,
  newEvents: EventJSON[],
  existingEvents: EventJSON[],
) => boolean

export const FILTERS: Record<string, EventFilter> = {
  'New Only': (event, _newEvents, existingEvents) => {
    return !existingEvents.find((e) => e.id === event.id)
  }
}

export type AvailableFilter = keyof typeof FILTERS

export function Filters ({
  filters,
  toggleFilter
}: {
  filters: AvailableFilter[]
  toggleFilter: (key: AvailableFilter) => void
}) {
  return (
    <div>
      <h3> Filter: </h3>
      <ul style={{ display: 'flex', listStyle: 'none', paddingInlineStart: 0 }}>
        {Object.keys(FILTERS).map((filter) => (
          <li key={filter}>
            <input
              id={filter}
              type="checkbox"
              checked={filters.includes(filter)}
              onChange={() => {
                toggleFilter(filter)
              }}
            />
            <label>{filter}</label>
          </li>
        ))}
      </ul>
    </div>
  )
}
