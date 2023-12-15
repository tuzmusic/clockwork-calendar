import { googleTokensCookie } from '~/cookies.server'
import { oauth2Client } from '~/auth0.server'
import { google } from 'googleapis'
import dayjs from 'dayjs'
import type { EventJSON } from '~/data/Event'
import { constructGoogleEvent } from '~/data/parseGoogleEvent'

export async function getCalendarList (cookieHeader: string | null) {
  const auth = (await googleTokensCookie.parse(cookieHeader)) || {}
  oauth2Client.setCredentials(auth)

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
  })

  try {
    return await calendar.calendarList.list()
  } catch (e) {
    console.log(e)
  }
}

export async function getCalendar (
  calendarId: string,
  cookieHeader: string | null
) {
  const auth = (await googleTokensCookie.parse(cookieHeader)) || {}
  oauth2Client.setCredentials(auth)

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
  })

  try {
    return await calendar.calendars.get({ calendarId })
  } catch (e) {
    console.log(e)
  }
}

export async function getEvents (
  calendarId: string,
  cookieHeader: string | null
) {
  const auth = (await googleTokensCookie.parse(cookieHeader)) || {}
  oauth2Client.setCredentials(auth)

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
  })

  try {
    return await calendar.events.list({
      calendarId,
      singleEvents: true,
      q: 'Clockwork Gig',
      orderBy: 'startTime',
      timeMin: dayjs().toISOString()
    })
  } catch (e) {
    console.log(e)
  }
}

export async function createEvent (
  event: EventJSON,
  calendarId: string,
  cookieHeader: string | null
) {
  const auth = (await googleTokensCookie.parse(cookieHeader)) || {}
  oauth2Client.setCredentials(auth)

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client
  })

  try {
    const googleEvent = constructGoogleEvent(event)
    return await calendar.events.insert({ calendarId, requestBody: googleEvent })
  } catch (e) {
    console.log(e)
  }
}

export async function getEmail (cookieHeader: string | null) {
  const auth = (await googleTokensCookie.parse(cookieHeader)) || {}
  oauth2Client.setCredentials(auth)

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  try {
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      q: 'Clockwork schedule in:unread'
    })

    const firstMessage = messagesResponse.data.messages?.[0]
    if (!firstMessage?.id) throw Error('firstMessage undefined')

    const message = await gmail.users.messages.get({
      id: firstMessage.id,
      userId: 'me'
    })

    const html = atob(message.data.payload?.body?.data ?? '')

    return html
  } catch (e) {
    console.log(e)
    throw e
  }
}
