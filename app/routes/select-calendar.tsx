import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { getCalendarList } from '~/data/google-api.server'
import { Link, useLoaderData } from '@remix-run/react'

export async function loader ({ request }: LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie')
  const list = await getCalendarList(cookieHeader)
  return json(list?.data.items ?? [])
}

const Index = () => {
  const calendars = useLoaderData<typeof loader>()
  return <>
    <h1>Select Calendar</h1>
    <ul>
      {calendars.map(cal => <li key={cal.id}>
        <a href={`/selectedCalendar/${cal.id}`}>
          {cal.summaryOverride ?? cal.summary}
        </a>
      </li>)}
    </ul>
    <div><Link to={'/login'}>Login</Link></div>
    <div><Link to={'/email'}>Email</Link></div>
  </>
}

export default Index
