import React from 'react'
import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { createEvent, getEvents } from '~/data/google-api.server'
import { selectedCalendarCookie } from '~/cookies.server'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { parseGoogleEvent } from '~/data/parseGoogleEvent'
import { OrigEventUI } from '~/components/origEventUI'
import type { EventJSON } from '~/data/Event'
import { checkToken } from '~/auth0.server'
import { Filters } from '~/components/Filters'
import { useStoredEvents } from '~/routes/events/useStoredEvents'
import { useEventFilters } from '~/routes/events/useEventFilters'

export async function loader (args: LoaderArgs) {
  const { request } = args
  await checkToken(request)

  const cookieHeader = request.headers.get('Cookie')

  const calendarId = await selectedCalendarCookie.parse(cookieHeader)
  if (!calendarId) throw redirect('/select-calendar')

  const data = await getEvents(calendarId, cookieHeader)
  const googleEvents = data?.data?.items ?? []

  return json({ calendarEvents: googleEvents.map(parseGoogleEvent) })
}

export async function action (args: ActionArgs) {
  const { request } = args
  const cookieHeader = request.headers.get('Cookie')

  const formData = await request.formData()
  const event: EventJSON = Object.fromEntries(formData) as unknown as EventJSON
  console.log({ event })
  const calendarId = await selectedCalendarCookie.parse(cookieHeader)
  const result = await createEvent(
    event,
    calendarId,
    request.headers.get('Cookie')
  )

  return { data: event, result }
}

const gridListStyle = {
  display: 'grid',
  fontFamily: 'sans-serif',
  listStyle: 'none',
  margin: 'auto',
  padding: 0,
  lineHeight: 1.25
}

export default function EventsPage () {
  const loaderData = useLoaderData<typeof loader>()
  const { calendarEvents } = loaderData
  const emailEvents = useStoredEvents()

  const { toggleFilter, filteredEvents, filters } = useEventFilters({
    newEvents: emailEvents,
    existingEvents: calendarEvents
  })

  const { Form, submit, data } = useFetcher()

  if (data) console.log(data)

  return (
    <Form>
      <Filters filters={filters} toggleFilter={toggleFilter} />

      <ol style={gridListStyle}>
        {filteredEvents?.map((emailEvent, i) => {
          const existingEvent = calendarEvents.find(
            (e) => e.id === emailEvent.id
          )

          return (
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
              key={emailEvent.id}
            >
              <div>
                {!i && <h3>Email Events</h3>}
                <OrigEventUI event={emailEvent} />
              </div>
              <div>
                {!i && <h3>Calendar Events</h3>}
                {existingEvent
                  ? (
                  <OrigEventUI event={existingEvent} />
                    )
                  : (
                  <button
                    type={'button'}
                    onClick={() => {
                      submit(emailEvent, { method: 'post', action: '/events' })
                    }}
                  >
                    Save
                  </button>
                    )}
              </div>
            </div>
          )
        })}
      </ol>
    </Form>
  )
}
