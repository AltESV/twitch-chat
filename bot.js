const tmi = require('tmi.js');
require('dotenv').config();
const OpenAI = require('openai');

//OPENAI INTEGRATION
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generate(message) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are the fana twitch chatbot that provides information exclusively about https://impact.fanaverse.io/" }, { role: "user", content: message }],
            model: "gpt-3.5-turbo",
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Ran into the following error: ", error);
        return "Error generating response. Please try again.";
    }
}

//TMI.JS INTEGRATION

const prefix = '!fana';

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

// async function onMessageHandler(target, context, msg, self, channel, tags) {
    
async function onMessageHandler(channel, tags, msg, self) {
    if (self) return;

    const command = msg.trim();

    if(command.startsWith(prefix)) {
        const args = command.slice(prefix.length).trim(); 

        if (args.length === 0) {
            client.say(channel, "Fana is a charity 🌈 that supports a different project each month which you can see here 👉 https://www.fanaverse.io/projects");
            console.log(`* Executed !fana with static response`);
        } else {
            const response = await generate(`!fana ${args}`); 
            client.say(channel, response);
            console.log(`* Executed !fana command with AI-generated response for: ${args}`);
        }
    } else {
        console.log('Command does not match !fana');
    }
    }

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}
