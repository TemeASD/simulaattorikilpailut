const fs = require('fs').promises;
const fs_sync = require('fs');
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'config.json');
const config = require('./config.json');
let stripJs = require('strip-js');

exports.writeCalendarEventsToHTML = async () => {
  const html = fs_sync.readFileSync('./views/index.html', { encoding: 'utf8', flag: 'r' });
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const { calendar } = require('googleapis/build/src/apis/calendar');
  const events = await authorize().then(listEvents).catch(console.error);
  events.forEach(event => {
    event = sanitizeEvent(event);
    const dateOptions = { hour12: false, month: "2-digit", day: "2-digit", year: "numeric" };
    const timeOptions = { hour12: false, hour: "numeric", minute: "numeric" }
    const startdate = new Date(event.start.dateTime);
    const enddate = new Date(event.end.dateTime);
    const textDate = startdate.toLocaleString("fi-FI", { weekday: 'long' });
    const isoDate = new Intl.DateTimeFormat("fi-FI", dateOptions).format(startdate);
    const isoStartTime = new Intl.DateTimeFormat("fi-FI", timeOptions).format(startdate);
    const isoEndTime = new Intl.DateTimeFormat("fi-FI", timeOptions).format(enddate);
    const organizer = event.attendees[0].email.split("@")[0];
    let row = `<tr>
                <td label="Päivä:" class="bold">${textDate}<span class="small"> ${isoDate}</span></td>
                <td label="Järjestäjä:" class="bold">${organizer}</td>
                <td label="Kisa:" class="bold">${event.summary}</td>
                <td label="Aika:" class="bold" >
                  <time datetime="${startdate}">${isoStartTime}</time> - 
                  <time datetime="${enddate}">${isoEndTime}</time> 
                  <span class="small">Europe/Helsinki</span></td>
                <td label="Alusta:" class="bold">${event.location}</td>
                <td label="Lisätiedot:" class="desc">${event.description}</td>
              </tr>`;

    $('tbody').append(row);
  });
  fs_sync.writeFileSync("./dist/html/index.html", $.root().html(), { encoding: 'utf8', flag: 'w' });
}
/**
 * Sanitize calendar event fields with stripjs
 */
function sanitizeEvent(event) {
  event.summary = stripJs(event.summary);
  event.description = stripJs(event.description);
  event.location = stripJs(event.location);
  return event;
}
/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next weeks events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: config.installed.calendar_id,
    timeMin: new Date().toISOString(),
    maxResults: 99,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log(events)
  return events;
}

//lists calendars
async function listCalendars(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.calendarList.list();
  const calendars = res.data.items;
  if (!calendars || calendars.length === 0) {
    console.log('No calendars found.');
    return;
  }
  console.log('Calendars:');
  calendars.map((calendar, i) => {
    console.log(`${calendar.id} - ${calendar}`);
  });
}

/**
 * Used for creating a list of events that you want to create
 * Doesn't create duplicate events, checks are based on event.summary and event.start.dateTime of old and new events
 * @param {
 *'summary': 'Race Event Name',
 *'location': 'Game Platform',
 *'description': 'Description of Race Event',
 *'start': {
 *  'dateTime': '2015-05-28T09:00:00+02:00',
 *  'timeZone': 'Europe/Helsinki',
 *},
 *'end': {
  *  'dateTime': '2015-05-28T09:00:00+02:00',
  *  'timeZone': 'Europe/Helsinki',
 *},
 *'attendees': [
 *  {'email': 'organizer name@example.com'},
 *],
 *},
 *} @returns { Promise<void> }} 
 */
exports.createEventQueue = async (newEvents) => {
  let uniqueEvents = await authorize().then(async (auth) => {
    events = [];
    const calendar = google.calendar({ version: 'v3', auth });
    const res = await calendar.events.list({
      calendarId: config.installed.calendar_id,
      timeMin: newEvents[0].start.dateTime,
      timeMax: newEvents[newEvents.length - 1].end.dateTime,
      maxResults: 9999,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const oldEvents = res.data.items;
    console.log(oldEvents.length)
    console.log(newEvents.length)

    for (let newEvent of newEvents) {
      let notUnique;
      for (let oldEvent of oldEvents) {
        let oldEventStartDay = new Date(oldEvent.start.dateTime).toDateString();
        let newEventStartDay = new Date(newEvent.start.dateTime).toDateString();
        if (oldEventStartDay === newEventStartDay && oldEvent.summary === newEvent.summary) {
          notUnique = true
        }
      }
      if (notUnique) {
        notUnique = false
      } else {
        events.push(newEvent)
      }
    }
    return events;
  });
  return uniqueEvents;
}

/**
 * Takes array of events, then creates a single one every three second
 * Gets around Googles pesky rate limit
 * @param {*} events 
 */
exports.createEvents = (events) => {
  authorize().then(async (auth) => {
    for (let i = 0; i <= events.length; i++) {
      setTimeout(() => {
        createEvent(events[i], auth);
      }, 3000 * i)
    }
  });
}

function createEvent(event, auth) {
  console.log('creating event')
  const calendar = google.calendar({ version: 'v3', auth });
  calendar.events.insert({
    auth: auth,
    calendarId: config.installed.calendar_id,
    resource: event,
  });
}