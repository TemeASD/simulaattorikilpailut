/**
 * Fisra events here
 */
const calendar = require('../calendar.js');
const helpers = require('../helpers/helpers.js');
const axios = require("axios");
const url = "https://simracing.fi/api/calendar";

async function parseFISRA(url) {
  const { data } = await axios.get(url);
  let events = [];
  data.forEach(el => {
    let email = el.organisername.replaceAll(' ', '_').replaceAll('.', '');
    let event = {
      "summary": "Testing Calendar Event Creation",
      "location": "",
      "description": "",
      "start": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      "end": { "dateTime": "", "timeZone": "Europe/Helsinki", },
      'attendees': [
        { 'email': `${email}@example.com` },
      ],
    }
    let dates = dateParser(el.racedate);
    let link = el.raceurl;

    event.location = helpers.simNameNormalizer(el.simname);
    event.summary = `${el.seasonname}`;
    if (el.racename.length > 3) {
      event.description = `Sarja: ${el.seasonname} - ${el.racename} - Rata: ${el.trackname}
<br><a href="${link}">Linkki kilpailutapahtumaan simracing.fi palvelussa</a>`
    } else {
      event.description = `Sarja: ${el.seasonname} - Rata: ${el.trackname} 
<br><a href="${link}">Linkki kilpailutapahtumaan simracing.fi palvelussa</a>`
    }
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
function dateParser(date) {
  //dates
  let splitDate = date.split(" ");
  let day = helpers.padZero(splitDate[0].split("-")[2]);
  let month = helpers.padZero(splitDate[0].split("-")[1]);
  let year = helpers.padZero(splitDate[0].split("-")[0]);
  let hours = helpers.padZero(splitDate[1].split(":")[0]);
  let minutes = helpers.padZero(splitDate[1].split(":")[1]);
  let starttime = `${year}-${month}-${day}T${hours}:${minutes}:00+02:00`;
  let enddate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00+02:00`)
  let tzdifFix = enddate.valueOf() + Math.abs(enddate.getTimezoneOffset() * 60 * 1000)
  //assume three hours for every race
  let raceendtime = new Date(tzdifFix.valueOf() + 180 * 60 * 1000);
  let endtime = raceendtime.toISOString().slice(0, -8)
  endtime = `${endtime}:00+02:00`
  return { starttime, endtime }
}

parseFISRA(url).then(async (events) => {
  let queue = await calendar.createEventQueue(events);
  calendar.createEvents(queue);
})
