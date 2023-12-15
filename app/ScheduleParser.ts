import type { Cheerio, Element } from 'cheerio'
import * as cheerio from 'cheerio'
import type { EventJSON } from '~/data/Event'
import { Event } from '~/data/Event'

const userFirstName = 'Jonathan'

const FIRST_MONTH_ROW_INDEX = 4
const EVENT_CELLS_COUNT = 5

export enum Month {
  January = 'January',
  February = 'February',
  March = 'March',
  April = 'April',
  May = 'May',
  June = 'June',
  July = 'July',
  August = 'August',
  September = 'September',
  October = 'October',
  November = 'November',
  December = 'December',
}

function isMonth (str: string): str is Month {
  return Object.values(Month).includes(str as Month)
}

function getTimesFromString (text: string) {
  const times = text.split('\n')[1]
  const [start] = times.split('-')
  const [hours, minutes] = start.split(':').map(Number)
  return { hours, minutes }
}

function getTextFromLines (text: string) {
  return text.trim().replace(/\n\s*/g, ' ')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function rowsFromPastedBrowserHtml ($: cheerio.CheerioAPI) {
  return $('body > div > div > table:nth-of-type(2)')
    // need add'l find because a too-long selector causes line breaks which messes up typescript
    .find('tr:nth-child(3) table table > tbody > tr')
}

function rowsFromFetchedEmailBody ($: cheerio.CheerioAPI) {
  return $('body > table > tbody').find('tr')
}

export class ScheduleParser {
  public events: EventJSON[] = []

  constructor (private readonly html: string) {
  }

  private readonly current = {
    month: '' as Month | '',
    year: 0,
    event: null as Event | null
  }

  static errors = {
    couldntFindDate:
      'Should have found a number in the "date" cell of an event header, but did not',
    noEventStarted: (source: string) => `Event is null (${source})`
  } as const

  private checkEvent (source: string) {
    if (this.current.event === null) {
      throw ScheduleParser.errors.noEventStarted(source)
    }
  }

  private parseCeremony (text: string) {
    if (!text.includes(userFirstName)) return
    const { event } = this.current
    if (!event) throw ScheduleParser.errors.noEventStarted('parseCeremony')

    event.hasCeremony = true
    event.descriptionLines.push(getTextFromLines(text))

    const { hours, minutes } = getTimesFromString(text)

    event.startTime = event.startTime
      .set('hours', hours + 12)
      .set('minutes', minutes)
      // ceremony listed start time is the actual start time, but we start playing 30m before
      .subtract(30, 'm')
  }

  private parseCocktailHour (text: string) {
    if (!text.includes(userFirstName)) return
    const { event } = this.current
    if (!event) throw ScheduleParser.errors.noEventStarted('parseCocktailHour')

    event.hasCocktails = true
    event.descriptionLines.push(getTextFromLines(text))

    // if we're already playing the ceremony then the start times don't matter
    if (event.hasCeremony) return

    const { hours, minutes } = getTimesFromString(text)

    event.startTime = event.startTime
      .set('hours', hours + 12)
      .set('minutes', minutes)
  }

  // If a row is a month header, sets the current month and year.
  // Returns whether the row is a month header
  private parsePossibleMonthHeader (row: Cheerio<Element>) {
    if (row.children().length !== 1) return false
    const [month, yearStr] = row
      .text()
      .split(', ')
      .map((s) => s.trim())
    if (!yearStr || !isMonth(month)) return false
    const year = Number(yearStr)
    if (!year) return false
    this.current.month = month
    this.current.year = year
    return true
  }

  private parsePossibleEventHeader (row: Cheerio<Element>) {
    const tds = row.children('td')
    if (tds.length !== EVENT_CELLS_COUNT) return false

    // todo: i THINK these two if statements are related
    //  but the logic is a bit too much for me at the moment
    //  (see existing error inside "case 3")
    //  (also this first if case logic might be wrong)
    if (this.current.event === null && this.events.length) {
      throw 'Reached a new event and expected a completed event, but no "current" Event found'
    }

    // we've reached a new event, so add the current event
    if (this.current.event) {
      this.events.push(this.current.event.toJson())
      this.current.event = null
    }

    const event = new Event()
    event.title = 'Clockwork Gig'

    event.isNew = !!row.html()?.includes('FF0000')

    const [DATE, TIME, LOCATION] = [1, 3, 4] // td indices
    tds.each((tdIndex, el) => {
      const td = cheerio.load(el)('td')
      switch (tdIndex) {
        case 0:
        case 2:
          break
        case DATE: {
          const date = Number(td.text().trim())
          if (!date) throw ScheduleParser.errors.couldntFindDate

          event.dateParts.date = date
          event.dateParts.month = this.current.month
          event.dateParts.year = this.current.year
          break
        }
        case TIME: {
          const [startTime, endTime] = td.text().trim().split('-')
          if (!event) {
            throw ScheduleParser.errors.noEventStarted('case TIME')
          }
          if (!endTime) {
            throw 'TODO error' // todo
          }

          event.dateParts.startTime = startTime
          event.dateParts.endTime = endTime
          break
        }
        case LOCATION:
          event.location = td.text().split(/\s\s+/) // split by large blocks of space (remove "CEC" leader)
            .filter(Boolean) // remove in-between spaces
            .pop()?.trim() ?? // get last element
            'COULD NOT PARSE LOCATION'
          break
      }
    })

    event.startTime = event.setDateTime(event.dateParts.startTime)
    event.endTime = event.setDateTime(event.dateParts.endTime)

    this.current.event = event
    return true
  }

  private parseOtherInfo (row: Cheerio<Element>) {
    this.checkEvent('parseOtherInfo')

    const rowText = row.text().trim()
    if (rowText.startsWith('Ceremony')) {
      this.parseCeremony(rowText)
      return true
    } else if (rowText.startsWith('Cocktail')) {
      this.parseCocktailHour(rowText)
      return true
    }
    return false
  }

  public parse () {
    const $ = cheerio.load(this.html)
    const allScheduleRows = rowsFromFetchedEmailBody($)

    allScheduleRows.each((rowIndex, el) => {
      if (rowIndex < FIRST_MONTH_ROW_INDEX) return true
      const row = $(el)

      if (this.parsePossibleMonthHeader(row)) return true
      if (this.parsePossibleEventHeader(row)) return true
      if (this.parseOtherInfo(row)) return true
    })

    // add the last event (since the loop adds at the start)
    if (this.current.event) {
      this.events.push(this.current.event.toJson())
    }

    return this.events
  }
}

/*
cheerio.load(this.html)('body > div > div > table:nth-of-type(2)').find('tr:nth-child(3) table table > tbody > tr')
* */
