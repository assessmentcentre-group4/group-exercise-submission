let config = require('./config.js');

let Telegram = require('node-telegram-bot-api');
let request = require('request');
let fs = require('fs');
let exec = require('child_process').exec;

let progress_count = {};

function handle_input(message) {
  fs.writeFile('test.txt', message, e => {if (e) console.log(e)});

  return new Promise(resolve => {
    setTimeout(() => {
      exec('cat test.txt', (err, stdout, stderr) => {
        console.log(stdout);
        resolve(stdout);
      })
    }, 1000);
  })
}

function get_reply(chatid, message) {
  progress_count[chatid]++;
  switch (progress_count[chatid]) {
    case 1: return Promise.resolve('Hello =D');
    case 2: return Promise.resolve('KA396 Wed 29 Mar 2017 15:00 HKT HKD8,300');
    case 3: return get_weather('Tokyo');
    case 4: return Promise.resolve('4 hours and 20 minutes');
    default: return Promise.resolve('Sorry, I don\'t understand T_T');
  }
}

function get_weather(location) {
  return new Promise(resolve => {
    const url = 'http://api.openweathermap.org/data/2.5/weather?appid=' + config.openweathermap.apikey + '&q=' + location;
    request(url, (err, res, body) => {
      let ret = JSON.parse(body);
      let msg = `The weather of ${ret.name} now is ${ret.weather[0].main}\nTemperature: ${Math.round((ret.main.temp - 273) * 10) / 10}°C`;
      resolve(msg);
    });
  });
}

function telegram_init() {
  let telegramBot = new Telegram(config.telegram.token, {
    polling: true
  });

  telegramBot.sendMessage(config.telegram.chatid, 'CX chatbot start. ',
  {
    // reply_markup: JSON.stringify({
    //   'keyboard': [
    //     [
    //       {
    //         text: 'Set my location',
    //         request_location: true
    //       },
    //       {
    //         text: '/myid'
    //       }
    //     ]
    //   ],
    //   'one_time_keyboard': true,
    //   'force_reply': true
    // })
  });

  telegramBot.onText(/\/hi/, msg => {
    // console.log('re')
    progress_count[msg.from.id] = 0;
  })

  telegramBot.onText(/\/myid(.*)/, function(msg) {
    telegramBot.sendMessage(msg.from.id, 'Your chat id is: ' + msg.from.id);
  });

  telegramBot.onText(/.*/, function(msg) {
    // console.log('recv')
    get_reply(msg.from.id, msg.text)
      .then(message => telegramBot.sendMessage(msg.from.id, message))
  });

  // telegramBot.onText(/\/start(.*)/, function(msg) {
  //   if (msg.from.id.toString() !== notificationProviders.telegram.chatid) {
  //     telegramBot.sendMessage(msg.from.id, 'Not registered chatid. ');
  //   } else {
  //   }
  // });

  // telegramBot.on('location', (msg) => {
  //   var loc = msg.location;
  //   console.log(loc);
  // });

  console.log('Start listening ...');
}

let skyscanner = require('skyscannerjs');
let test_skyscanner = () => {
  const api = new skyscanner.API(config.skyscanner.apikey);
  console.log(api);

  api.flights.livePrices.session({
    country: "UK",
    currency: "GBP",
    locale: "en-GB",
    locationSchema: "Iata",
    originplace: "EDI",
    destinationplace: "LHR",
    outbounddate: "2016-06-13",
    adults: 1
  }).then((response) => {
      // URL to poll the session.
      const location = response.headers.location;
  }).catch(console.error);
}

telegram_init();
