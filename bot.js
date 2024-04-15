const tmi = require('tmi.js');
require('dotenv').config();
const OpenAI = require('openai');

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

const opts = {
    options: { debug: true },
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_TOKEN
    },
    channels: ['fanaimpactbot']  
};

const client = new tmi.Client(opts);

client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('join', (channel, username, self) => {
    if (self) {
        console.log(`Successfully joined channel: ${channel}`);
    }
});

client.connect();

async function onMessageHandler(channel, tags, msg, self) {
    if (self) return;

    const command = msg.trim().split(' ')[0];
    const args = msg.trim().substring(command.length).trim();

    if (command === '!fana') {
        if (args.length === 0) {
            client.say(channel, "Fana is a charity 🌈 that supports a different project each month which you can see here 👉 https://www.fanaverse.io/projects");
            console.log(`* Executed !fana with static response in ${channel}`);
        } else {
            try {
                const response = await generate(`!fana ${args}`);
                client.say(channel, response);
                console.log(`* Executed !fana command with AI-generated response for: ${args} in ${channel}`);
            } catch (error) {
                console.error("Error generating response:", error);
                client.say(channel, "Oops! Something went wrong. Try again?");
            }
        }
    } else if (command === '!joinbot') {
        if (tags.username === channel.slice(1) || tags.mod) {  
            addChannel(args);  
            console.log(`Received join request from ${tags.username} for ${args}`);
        }
    }
}

function addChannel(channelName) {
    if (!client.opts.channels.includes(channelName)) {
        client.join(channelName);
        console.log(`Bot added to channel: ${channelName}`);
    } else {
        console.log(`Bot is already a member of: ${channelName}`);
    }
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}
