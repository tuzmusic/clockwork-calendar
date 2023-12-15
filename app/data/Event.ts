import dayjs from 'dayjs'

export type EventJSON = ReturnType<typeof Event.prototype.toJson>

export class Event {
  // todo: make members private, expose public setters
  public dateParts = {
    date: 0,
    month: '',
    year: 0,
    startTime: '',
    endTime: ''
  }

  public title = ''
  public location = ''
  public descriptionLines: string[] = []
  public startTime!: dayjs.Dayjs
  public endTime!: dayjs.Dayjs

  public hasCeremony = false
  public hasCocktails = false
  public isNew = false

  public toJson () {
    const { startTime, endTime, isNew, description, id, title, location } =
      this
    return {
      startTime: startTime.toString(),
      endTime: endTime.toString(),
      isNew,
      description,
      id,
      title,
      location
    }
  }

  public get description () {
    return this.descriptionLines.join('\n')
  }

  public get id () {
    return this.startTime.format('YYYYMMDD')
  }

  public setDateTime (time: string, convertToPm = true) {
    const { date, month, year } = this.dateParts
    const newDateTime = dayjs(`${month} ${date} ${year} ${time}`)
    return newDateTime.add(convertToPm ? 12 : 0, 'h')
  }

  public toString () {
    const { title, location, descriptionLines, dateParts } = this
    const { date, endTime, startTime, year, month } = dateParts
    return `${title} @ ${location}. ${month} ${date}, ${year}. ${startTime}-${endTime}\n${descriptionLines.join('\n')}`
  }
}
