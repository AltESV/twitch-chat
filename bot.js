const tmi = require('tmi.js');
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generate(message) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: message }],
            model: "gpt-3.5-turbo",
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Ran into the following error: ", error);
        return "Error generating response. Please try again.";
    }
}

const opts = {
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: [process.env.CHANNEL_NAME]
};

const client = new tmi.client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

client.connect();

async function onMessageHandler(target, context, msg, self) {
    if (self) return;

    const commandName = msg.trim();

    if (commandName === '!dice') {
        const num = rollDice();
        client.say(target, `You rolled a ${num}`);
        console.log(`* Executed ${commandName} command`);
    } else if (commandName === 'what is fana?') {
        const answer = 'Fana is a charity 🌈 that supports a different project each month which you can see here 👉 https://www.fanaverse.io/projects';
        client.say(target, answer);
        console.log(`* Executed ${commandName} command`);
    } else if (commandName === '!fana') {
        const answer = await generate('what is fana the charity');
        client.say(target, answer);
        console.log(`* Executed ${commandName} command`);
    } else {
        console.log(`* Unknown command ${commandName}`);
    }
}

function rollDice() {
    const sides = 6;
    return Math.floor(Math.random() * sides) + 1;
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}
