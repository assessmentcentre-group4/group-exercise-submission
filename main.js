let config = require('./config.js');

let Telegram = require('node-telegram-bot-api');
let request = require('request');
let fs = require('fs');

function get_reply(chatid, message) {
  fs.writeFile('test.txt', message, e => {if (e) console.log(e)});
  return get_weather('Tokyo');
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

  telegramBot.onText(/\/myid(.*)/, function(msg) {
    telegramBot.sendMessage(msg.from.id, 'Your chat id is: ' + msg.from.id);
  });

  telegramBot.onText(/.*/, function(msg) {
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

telegram_init();
