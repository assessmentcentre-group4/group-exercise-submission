let config = require('./config.js');

let skyscanner = require('skyscannerjs');

let Telegram = require('node-telegram-bot-api');

function telegram_init() {
  let telegramBot = new Telegram(config.telegram.token, {
    polling: true
  });

  telegramBot.sendMessage(config.telegram.chatid, 'Telegram notification start. ', {
    reply_markup: JSON.stringify({
      'keyboard': [
        [
          {
            text: 'Set my location',
            request_location: true
          },
          {
            text: '/myid'
          }
        ]
      ],
      'one_time_keyboard': true,
      'force_reply': true
  })});

  telegramBot.onText(/\/myid(.*)/, function(msg) {
    telegramBot.sendMessage(msg.from.id, 'Your chat id is: ' + msg.from.id);
  });
  // telegramBot.onText(/\/start(.*)/, function(msg) {
  //   if (msg.from.id.toString() !== notificationProviders.telegram.chatid) {
  //     telegramBot.sendMessage(msg.from.id, 'Not registered chatid. ');
  //   } else {
  //   }
  // });
  telegramBot.on('location', (msg) => {
    var loc = msg.location;
    console.log(loc);
  });

  console.log('Start listening ...');
}

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

// test_skyscanner();

telegram_init();
