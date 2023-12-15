import { json, type LoaderArgs } from '@remix-run/node'
import { checkToken } from '~/auth0.server'
import { getEmail } from '~/data/google-api.server'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { ScheduleParser } from '~/ScheduleParser'
import { useEffect } from 'react'

export async function loader (args: LoaderArgs) {
  const { request } = args
  const cookieHeader = request.headers.get('Cookie')

  await checkToken(request)
  const emailHtml = await getEmail(cookieHeader)

  const scheduleParser = new ScheduleParser(emailHtml)
  const events = scheduleParser.parse()

  return json(events)
}

export default function Email () {
  const serverEvents = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  useEffect(() => {
    if (serverEvents) {
      localStorage.setItem('serverEvents', JSON.stringify(serverEvents))
      navigate('/events')
    }
  }, [serverEvents])
}
