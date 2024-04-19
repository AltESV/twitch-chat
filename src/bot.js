import tmi from 'tmi.js';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';  
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


//AUTH 
let client;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_URL = 'https://id.twitch.tv/oauth2/token';

async function refreshAccessToken(refreshToken) {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    try {
        const response = await axios.post(REFRESH_URL, params);
        const { access_token, expires_in, refresh_token } = response.data;
        console.log(`New Access Token: ${access_token} which expires in ${expires_in} seconds`);
        return { accessToken: access_token, expiresIn: expires_in, refreshToken: refresh_token };
    } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
    }
}

refreshAccessToken(process.env.TWITCH_REFRESH_TOKEN).then(tokens => {
    if (tokens) {
        process.env.TWITCH_ACCESS_TOKEN = tokens.accessToken;
        process.env.TWITCH_REFRESH_TOKEN = tokens.refreshToken;
        initializeClient(tokens.accessToken);  
    }
});

setInterval(() => {
    refreshAccessToken(process.env.TWITCH_REFRESH_TOKEN).then(tokens => {
        if (tokens) {
            console.log('Automatically refreshed Access Token.');
            process.env.TWITCH_ACCESS_TOKEN = tokens.accessToken;
            process.env.TWITCH_REFRESH_TOKEN = tokens.refreshToken;
            initializeClient(tokens.accessToken);  
        }
    });
}, 3 * 3600 * 1000);  

function initializeClient(token, channels) {
    const opts = {
        options: { debug: true },
        identity: {
            username: process.env.BOT_USERNAME,
            password: `oauth:${token}`
        },
        channels  
    };


//CHAT
    client = new tmi.Client(opts);

    client.on('message', onMessageHandler);
    client.on('connected', onConnectedHandler);
    client.on('join', (channel, username, self) => {
        if (self) {
            console.log(`Successfully joined channel: ${channel}`);
            addChannelToDB(channel);  
        }
    });

    client.connect().catch(console.error);
}

async function generate(message) {
    try {
        const faqText = `FAQ:
        - What is Fana? Fana is the charity of charities! We bring vetted and high impact projects to Twitch streamers and their communities.
        - What charity is being supported? In April in support of Earth Day, Fana is supporting projects providing clean water in Ethiopia, Madagascar, and Sierra Leone.
        - What's the goal? The goal is to raise $1000 for the project.
        - Why Fana and not another charity? We provide insight into where your money actually goes, provide regular content about your supported projects, and rotate through different projects each month!
        - Is this charity registered and tax-exempt? Yes! Fana Impact Foundation, Inc. is a registered 501(c)(3) non-profit in the United States.
        - Are there any other ways to support the charity or Fana other than through money? You can help us find other streamers who want to join our creators for good!
        - Will there be transparency on how much was raised today? Absolutely, we'll provide the streamer with a recap of total amounts raised and what it went towards a few days after the stream!
        - What are your costs or fees? We are a US registered charity and operate with transparency! Our directors and employees are all volunteers and are unpaid.  We do have a technology fee of approximately 10% of our revenues that go to Fana Technologies who provides financial, operational, and technology services for us.  We then have standard operating expenses such as marketing costs and donation processing costs from PayPal and Stripe.`;

        const completion = await openai.chat.completions.create({
            messages: [{
                role: "system", content:
                    `You are the fana twitch chatbot that provides information exclusively about https://impact.fanaverse.io/. You also use ${faqText} to answer questions.`
            }, { role: "user", content: message }],
            model: "gpt-3.5-turbo",
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI Error:", error);
        return "Error generating response. Please try again.";
    }
}

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
    if (!client.getChannels().includes('#' + channelName)) {  
        client.join(channelName);
        console.log(`Bot added to channel: ${channelName}`);
        addChannelToDB('#'+ channelName);  
    } else {
        console.log(`Bot is already a member of: ${channelName}`);
    }
}


async function addChannelToDB(channelName) {
    const { data, error } = await supabase
        .from('channels')
        .upsert([{ channel_name: channelName, is_active: true }], {
            onConflict: "channel_name"
        });

    if (error) console.error('Error adding channel to database:', error);
    else console.log('Channel added to database:', data);
}

async function getActiveChannels() {
    const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error retrieving channels:', error);
        return [];
    }
    return data.map(channel => channel.channel_name);
}

getActiveChannels().then(channels => {
    if (channels.length > 0) {
        initializeClient(process.env.TWITCH_ACCESS_TOKEN, channels);
    } else {
        console.log('No active channels found. Ensure your database is populated.');
    }
});

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}
