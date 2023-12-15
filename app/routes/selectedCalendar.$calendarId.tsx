import type { LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { selectedCalendarCookie } from '~/cookies.server'

export async function loader (args: LoaderArgs) {
  const { params } = args
  const { calendarId } = params as { calendarId: string }

  return redirect('/email', {
    headers: {
      'Set-Cookie': await selectedCalendarCookie.serialize(calendarId)
    }
  })
}
