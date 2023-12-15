import { type EventJSON } from '~/data/Event'
import React from 'react'
import { type AvailableFilter, FILTERS } from '~/components/Filters'

export function useEventFilters ({ newEvents, existingEvents }: { newEvents: EventJSON[], existingEvents: EventJSON[] }) {
  const [filters, setFilters] = React.useState<AvailableFilter[]>(['New Only'])

  const toggleFilter = (key: AvailableFilter) => {
    const newFilters = filters?.includes(key) ? filters.filter(f => f !== key) : [...filters, key]
    setFilters(newFilters)
  }

  const filteredEvents = !filters.length
    ? newEvents
    : newEvents?.filter(event =>
      filters.reduce((yet, filter) => yet && FILTERS[filter](event, newEvents, existingEvents), true)
    )

  return { toggleFilter, filteredEvents, filters }
}
