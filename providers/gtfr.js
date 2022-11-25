/**
 * GTFR events here
 */

const calendar = require('../calendar.js');
const helpers = require('../helpers/helpers.js');
const axios = require("axios");
const cheerio = require('cheerio');
const url = "https://gtfr.fi/kisalista/"
async function parseGTFR() {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  let events = [];
  $('.kisalista tbody tr').each((i, el) => {
    let event = {
      "summary": "Testing Calendar Event Creation",
      "location": "",
      "description": "",
      "start": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      "end": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      'attendees': [
        { 'email': 'gtfr@example.com' },
      ],
    }
    let previousElement = $(el).prev();
    let prevEldates = dateParser($(previousElement).find('td:nth-child(1)').text());
    let dates = dateParser($(el).find('td:nth-child(1)').text());
    let link = $(el).find('td:nth-child(2)').find('a').attr('href')

    event.location = $(el).find('td:nth-child(3)').text();
    event.summary = $(el).find('td:nth-child(2)').find('a').find('strong').text()
    event.description = `${$(el).find('td:nth-child(2)').text().replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/g, ' ')}
<br>Katso lisätietoja: <a href="${link}">GTFR:n verkkosivuilta</a>`
    event.start.dateTime = dates.starttime;
    event.end.dateTime = dates.endtime;

    let previousEventStartDay = new Date(prevEldates.starttime).toDateString();
    let currentEventStartDay = new Date(event.start.dateTime).toDateString();
    if (previousEventStartDay !== currentEventStartDay) {
      events.push(event)
    } else {
    }
  })
  return events;
}

/**
 * @param {string} date for example keskiviikko 23.11.2022 - 23:30
 * @return {object} {starttime: "date.toISOString()", endtime: "date.toISOString()"}
*/
function dateParser(date) {
  if (date === undefined) { return { starttime: new Date(Date.now()).toISOString() } }
  if (date.split(" ")[1] === undefined) { return { starttime: new Date(Date.now()).toISOString() } }
  let splitDate = date.split(" ");
  let day = helpers.padZero(splitDate[1].split(".")[0]);
  let month = helpers.padZero(splitDate[1].split(".")[1]);
  let year = helpers.padZero(splitDate[1].split(".")[2]);
  let hours = helpers.padZero(splitDate[3].split(":")[0]);
  let minutes = helpers.padZero(splitDate[3].split(":")[1]);
  let starttime = `${year}-${month}-${day}T${hours}:${minutes}:00+02:00`;
  let enddate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00+02:00`)
  //lets assume that the event takes four hours, and fix it later
  let tzdifFix = enddate.valueOf() + Math.abs(enddate.getTimezoneOffset() * 60 * 1000)
  let assumeFourHourLength = tzdifFix.valueOf() + 240 * 60 * 1000;
  let fuckedUpTime = new Date(assumeFourHourLength);
  let endtime = fuckedUpTime.toISOString().slice(0, -8)
  endtime = `${endtime}:00+02:00`
  return { starttime, endtime }
}

parseGTFR().then(async (events) => {
  let queue = await calendar.createEventQueue(events);
  calendar.createEvents(queue);
})