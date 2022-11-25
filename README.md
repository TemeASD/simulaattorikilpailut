This is the build service for Simulaattorikilpailut.fi. The HTML page that gets CD'd into [simulaattorikilpailut.fi](https://simulaattorikilpailut.fi) lives in ~~another castle~~ private repository. 

# What it does

**Builds:**

- Eats a Google Calendar
- Constructs HTML document from `/views/index.html` and the Calendar
- Puts it in `/dist/html`

**Parses multiple different websites and APIs:**

- Eats a webpage or an API
- Constructs a list of events to be put into a Google Calendar
- Puts them into a linked Google Calendar one by one

## Development Environment (Local)

So for some reason you want to use this code for your own purposes? Please go right ahead. 

### System Requirements

:bulb: Before you begin, make sure you have the following installed:

- [Node.js v16 or above](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git/)
- Mental health

### Getting Started With Development

#### Building a provider

_Provider_ is the thingamabob that puts the calendar events into the calendar system from some website/API. 

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/TemeASD/simulaattorikilpailut
cd cd simulaattorikilpailut
npm install
```

2. Read the Google Calendar quick start for NodeJS 

[https://developers.google.com/calendar/api/quickstart/nodejs](https://developers.google.com/calendar/api/quickstart/nodejs)

3. Create some config files

All the code relating to the Calendar API was taken from [here](https://developers.google.com/calendar/api/quickstart/nodejs)

* `config.json` for Google Calendar. Steps can be found from document above. 
* `token.json` for authenticating with Google Services. Steps can be found from document above. 

4. You may begin! 

[./example/example.js](./example/example.js) contains an example on how you can build your own provider. Currently the system works as follows

1. Create a file with the provider as the name
2. Create the parser and construct an array of events according to the "template" in [./example/example.js](./example/example.js)
3. Call `calendar.createEventQueue()` function with the array as parameter. The function returns bog standard js array of objects and not a fancy queue as the name suggests
4. Use the return value as a parameter to call `calendar.createEvents()`. It will push the events into the calendar

#### Improving the UX

* All the current assets live in the `dist/html` folder, and you can edit the CSS and JavaScript files there. 
* If you want to make modifications for the HTML, you need to modify the [./views/index.html](./views/index.html) file. 
* The `calendar.js` script will use that as a template to create the final HTML document.
* If you want to modify the table structure, you will also need to modify the structure in the [calendar.js](calendar.js) function `writeCalendarEventsToHTML()`
* Ps. its a mess, have fun. And a glass of whiskey. 

### That's it. 

You can hopefully manage to read through the absolute garbage code