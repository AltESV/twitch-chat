const tmi = require('tmi.js');
require('dotenv').config();

const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

function onMessageHandler (target, context, msg, self) {
  if (self) { return; } 

  const commandName = msg.trim();
    
//FEATURE DICE-ROLL
  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
    }
    
//FEATURE FANA-FAQ
if (commandName === 'what is fana?') {
    const answer = 'Fana is a charity 🌈that supports a different project each month which you can see here 👉https://www.fanaverse.io/projects';
    client.say(target, `${answer}`);
    console.log(`* Executed ${commandName} command`);
} else {
    console.log(`* Unknown command ${commandName}`);
}

//FEATURE FANA-FAQ
if (commandName === 'How much money are you going to raise?') {
    const answer = '1 million 🚀';
    client.say(target, `${answer}`);
    console.log(`* Executed ${commandName} command`);
} else {
    console.log(`* Unknown command ${commandName}`);
}
    
}

//METHODS
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

//CONNECT HANDLER
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
