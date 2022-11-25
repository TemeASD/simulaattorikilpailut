/**
 * Simple example on how to create a new provider
 * 1. Get the data from somewhere, cheerio and axios dependencies already
 * 2. Parse the data to an array of events
 * 3. Call calendar.createEventQueue(events) to create a list of unique events
 * 4. Call calendar.createEvents(queue) to create the events
 */

/**
 * Example events here
 */
const calendar = require('../calendar.js');
const axios = require("axios");
const args = process.argv.slice(2);
const url = args[0]
const simulator = "Testing";
const org = "Testing"

/**
  * @param {string} url url to fetch data from
  * @param {string} simulator simulator name
  * @return {array} array of events
*/
async function parseExample(url, simulator) {
  const data = await axios.get(url);
  data.events.forEach(event => {
    let template = {
      "summary": "Testing Calendar Event Creation",
      "location": "",
      "description": "",
      "start": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      "end": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      'attendees': [
        { 'email': `${org}@example.com` },
      ],
    }
    let dates = dateParser(event.racedate)
    let link = `https://trellet.net/tulospalvelu/kausi/${data.data.season.id}`
    template.location = simulator;
    template.summary = `${event.name}`;
    template.description = `Ajat ovat suuntaa-antavia. <br>Sarja: ${seasonName}
   <br><a href="${link}">Linkki Trellet.netin tulospalveluun</a><br><a href="https://www.twitch.tv/simracingfi/">Kilpailulähetykset alkavat n. 20:15.</a> `
    template.start.dateTime = dates.starttime;
    template.end.dateTime = dates.endtime;
    template.push(event)
  })
  return events;
}

/**
 * @param {string} date for example 5.10.2022 klo 20:00
 * @return {object} {starttime: "date.toISOString()", endtime: "date.toISOString()"}
*/
function dateParser(date) {
  let starttime = `${date.substring(0, 10)}T19:00:00+02:00`;
  let endtime = `${date.substring(0, 10)}T23:00:00+02:00`;
  return { starttime, endtime }
}
/**
 * Call the function and create the events
 */
parseExample(url, simulator).then(async (events) => {
  //queue here is used to make sure that the events are unique
  let queue = await calendar.createEventQueue(events);
  //create events from the queue
  calendar.createEvents(queue);
})