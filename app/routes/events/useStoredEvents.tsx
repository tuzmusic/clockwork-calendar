import { type EventJSON } from '~/data/Event'
import { useEffect, useState } from 'react'

export function useStoredEvents (): EventJSON[] {
  const [storedEvents, setStoredEvents] = useState<EventJSON[]>([])

  useEffect(() => {
    const serverEventsStr = localStorage.getItem('serverEvents')
    if (!serverEventsStr) {
      console.error('no events stored yet')
      return
    }

    const serverEvents = JSON.parse(serverEventsStr) as EventJSON[]
    if (!serverEvents) {
      throw Error('could not parse stored string')
    }

    setStoredEvents(serverEvents)
    localStorage.removeItem('serverEvents')
  }, [])

  return storedEvents
}
