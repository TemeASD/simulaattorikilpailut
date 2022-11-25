const cal = require('./calendar.js');

cal.writeCalendarEventsToHTML().then(exit()).catch(console.error);