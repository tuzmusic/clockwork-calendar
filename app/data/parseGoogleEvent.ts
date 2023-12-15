import type { EventJSON } from "~/data/Event";
import dayjs from "dayjs";

export function parseGoogleEvent(event: any): EventJSON {
  return {
    startTime: event.start!.dateTime as string,
    endTime: event.end!.dateTime as string,
    description: event.description as string,
    location: event.location as string,
    title: event.summary as string,
    isNew: false,
    id: dayjs(event.start!.dateTime as string).format("YYYYMMDD")
  }
}

export function constructGoogleEvent(event: EventJSON) {
  return {
    summary: event.title,
    location: event.location,
    description: event.description,
    start: {
      dateTime: dayjs(event.startTime).toISOString()
    },
    end: {
      dateTime: dayjs(event.endTime).toISOString()
    }
  }
}
