import type { LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { googleTokensCookie } from '~/cookies.server'

export async function loader ({ request }: LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie')
  const credentials = await googleTokensCookie.parse(cookieHeader)
  if (credentials) {
    return redirect('/select-calendar')
  }
  return new Response(null, { status: 200 })
}

export default function Index () {
  return <a href={'/login'}>Login</a>
}
