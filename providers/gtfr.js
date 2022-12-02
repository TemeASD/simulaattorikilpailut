/**
 * GTFR events here
 */

const calendar = require('../calendar.js');
const helpers = require('../helpers/helpers.js');
const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://gtfr.fi/kisalista/';
async function parseGTFR() {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const events = [];
  $('.kisalista tbody tr').each((i, el) => {
    const event = {
      'summary': 'Testing Calendar Event Creation',
      'location': '',
      'description': '',
      'start': { 'dateTime': '', 'timeZone': 'Europe/Helsinki' },
      'end': { 'dateTime': '', 'timeZone': 'Europe/Helsinki' },
      'attendees': [
        { 'email': 'gtfr@example.com' },
      ],
    };
    const previousElement = $(el).prev();
    const prevEldates = dateParser($(previousElement).find('td:nth-child(1)').text());
    const dates = dateParser($(el).find('td:nth-child(1)').text());
    const link = $(el).find('td:nth-child(2)').find('a').attr('href');

    event.location = $(el).find('td:nth-child(3)').text();
    event.summary = $(el).find('td:nth-child(2)').find('a').find('strong').text();
    event.description = `${$(el).find('td:nth-child(2)').text().replace(/(\r\n|\n|\r)/gm, '').replace(/\s{2,}/g, ' ')}
<br>Katso lisätietoja: <a href="${link}">GTFR:n verkkosivuilta</a>`;
    event.start.dateTime = dates.starttime;
    event.end.dateTime = dates.endtime;

    const previousEventStartDay = new Date(prevEldates.starttime).toDateString();
    const currentEventStartDay = new Date(event.start.dateTime).toDateString();
    if (previousEventStartDay !== currentEventStartDay) {
      events.push(event);
    } else {
    }
  });
  return events;
}

/**
 * @param {string} date for example keskiviikko 23.11.2022 - 23:30
 * @return {object} {starttime: 'date.toISOString()', endtime: 'date.toISOString()'}
*/
function dateParser(date) {
  if (date === undefined) return { starttime: new Date(Date.now()).toISOString() };
  if (date.split(' ')[1] === undefined) return { starttime: new Date(Date.now()).toISOString() };
  const splitDate = date.split(' ');
  const day = helpers.padZero(splitDate[1].split('.')[0]);
  const month = helpers.padZero(splitDate[1].split('.')[1]);
  const year = helpers.padZero(splitDate[1].split('.')[2]);
  const hours = helpers.padZero(splitDate[3].split(':')[0]);
  const minutes = helpers.padZero(splitDate[3].split(':')[1]);
  const starttime = `${year}-${month}-${day}T${hours}:${minutes}:00+02:00`;
  const enddate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00+02:00`);
  //lets assume that the event takes four hours, and fix it later
  const tzdifFix = enddate.valueOf() + Math.abs(enddate.getTimezoneOffset() * 60 * 1000);
  const assumeFourHourLength = tzdifFix.valueOf() + 240 * 60 * 1000;
  const fuckedUpTime = new Date(assumeFourHourLength);
  let endtime = fuckedUpTime.toISOString().slice(0, -8);
  endtime = `${endtime}:00+02:00`;
  return { starttime, endtime };
}

parseGTFR(url).then(async events => {
  const queue = await calendar.createEventQueue(events);
  calendar.createEvents(queue);
});