import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { oauth2Client } from '~/auth0.server'

export const loader: LoaderFunction = async () => {
  const scopes = ['https://www.googleapis.com/auth/calendar',
    // "https://www.googleapis.com/auth/gmail.addons.current.message.action",
    'https://www.googleapis.com/auth/gmail.readonly'
  ]

  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes.join(' ')
  })

  return redirect(authorizeUrl)
}

export default function Login () {
  return <h1>Logging in...</h1>
}
