/**
 * Fisra events here
 */
const calendar = require('../calendar.js');
const helpers = require('../helpers/helpers.js');
const axios = require("axios");
const cheerio = require('cheerio');
const { exit } = require('process');
const args = process.argv.slice(2);
const url = (args[0] != undefined) ? args[0] : "https://simracing.fi/kaudet/133/kilpailut";
let simulator = (args[1] != undefined) ? args[1] : "ACC";
const org = (args[2] != undefined) ? args[2] : "FiSRA";
simulator = simulator.replace("_", " ");
if (args[0] === undefined) {
  console.log("Usage: node providers/simracingfi.js <url> <simulator> <org>");
  exit()
}
async function parseFISRA(url, simulator) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  let seasonName = $('h4 small').text();
  let events = [];
  $('#kilpailukalenteri tbody tr').each((i, el) => {
    let event = {
      "summary": "Testing Calendar Event Creation",
      "location": "",
      "description": "",
      "start": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      "end": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      'attendees': [
        { 'email': `${org}@example.com` },
      ],
    }
    let dates = dateParser(
      $(el).find('td:nth-child(2)').attr('title'),
      $(el).find('td:nth-child(4)').text()
    );
    let link = $(el).find('td:nth-child(1)').find('a').attr('href')

    event.location = simulator;
    event.summary = `${seasonName} - ${$(el).find('td:nth-child(3)').text()}`;
    event.description = `Sarja: ${seasonName} - Rata: ${$(el).find('td:nth-child(3)').text()}
 <br><a href="${link}">Linkki kilpailutapahtumaan simracing.fi palvelussa</a>`
    event.start.dateTime = dates.starttime;
    event.end.dateTime = dates.endtime;
    events.push(event)
  })
  return events;
}
/**
 * @param {string} date for example 5.10.2022 klo 20:00
 * @param {string} length length of race, for example 60 minutes
 * @return {object} {starttime: "date.toISOString()", endtime: "date.toISOString()"}
*/
function dateParser(date, length) {
  //dates
  let splitDate = date.split(" ");
  let day = helpers.padZero(splitDate[0].split(".")[0]);
  let month = helpers.padZero(splitDate[0].split(".")[1]);
  let year = helpers.padZero(splitDate[0].split(".")[2]);
  let hours = helpers.padZero(splitDate[2].split(":")[0]);
  let minutes = helpers.padZero(splitDate[2].split(":")[1]);
  //length
  let racelength = length.split(" ")[0];
  let starttime = `${year}-${month}-${day}T${hours}:${minutes}:00+02:00`;
  let enddate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00+02:00`)
  let tzdifFix = enddate.valueOf() + Math.abs(enddate.getTimezoneOffset() * 60 * 1000)
  let raceendtime = new Date(tzdifFix.valueOf() + racelength * 60 * 1000);
  let endtime = raceendtime.toISOString().slice(0, -8)
  endtime = `${endtime}:00+02:00`
  return { starttime, endtime }
}

parseFISRA(url, simulator).then(async (events) => {
  let queue = await calendar.createEventQueue(events);
  calendar.createEvents(queue);
})