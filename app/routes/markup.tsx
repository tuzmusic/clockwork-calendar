import type { ActionArgs } from '@remix-run/node'
import { ScheduleParser } from '~/ScheduleParser'
import { email092423 } from '~/tests/fixtures/email-092423'
import { useActionData, useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

export async function action (args: ActionArgs) {
  const { request } = args
  const formData = await request.formData()
  const markup = formData.get('markup') as string

  try {
    return new ScheduleParser(markup).parse()
  } catch (e) {
    throw new Response(null, {
      status: 500,
      statusText: JSON.stringify(e, null, 2)
    })
  }
}

export default function Markup () {
  const serverEvents = useActionData<typeof action>()
  const navigate = useNavigate()

  useEffect(() => {
    if (serverEvents) {
      localStorage.setItem('serverEvents', JSON.stringify(serverEvents))
      navigate('/events')
    }
  }, [serverEvents])

  return (
    <form
      method="post"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 16
      }}>
      <h2>Enter email html</h2>
      <textarea defaultValue={email092423} name="markup" id="markup" cols={100} rows={20} />
      <button type="submit">Submit</button>
    </form>
  )
}
