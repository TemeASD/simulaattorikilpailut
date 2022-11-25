const cal = require('./calendar.js');

cal.writeCalendarEventsToHTML().then(console.log('done')).catch(console.error);