import tmi from "tmi.js";
import { config } from "./config/config.js";
import { generate } from "./api/openai.js";
import { addChannelToDB, getActiveChannels } from "./api/supabase.js";
import { refreshAccessToken } from "./utils/tokenHandler.js";

let client;

function initializeClient(token, channels) {
  const opts = {
    options: { debug: true },
    identity: {
      username: config.botUserName,
      password: `oauth:${token}`,
    },
    channels,
  };

  client = new tmi.Client(opts);

  client.on("message", onMessageHandler);
  client.on("connected", onConnectedHandler);
  client.on("join", (channel, username, self) => {
    if (self) {
      console.log(`Successfully joined channel: ${channel}`);
      addChannelToDB(channel);
    }
  });

  client.connect().catch(console.error);
}

refreshAccessToken().then((tokens) => {
  getActiveChannels().then((channels) => {
    if (tokens && channels.length > 0) {
      initializeClient(tokens.accessToken, channels);
    }
  });
});

setInterval(() => {
  refreshAccessToken().then((tokens) => {
    getActiveChannels().then((channels) => {
      if (tokens && channels.length > 0) {
        console.log("Automatically refreshed Access Token.");
        initializeClient(tokens.accessToken, channels);
      }
    });
  });
}, 3 * 3600 * 1000);

async function onMessageHandler(channel, tags, msg, self) {
  if (self) return;

  const command = msg.trim().split(" ")[0];
  const args = msg.trim().substring(command.length).trim();

  if (command === "!fana") {
    if (args.length === 0) {
      client.say(
        channel,
        "Fana is a charity 🌈 that supports a different project each month which you can see here 👉 https://www.fanaverse.io/projects"
      );
      console.log(`* Executed !fana with static response in ${channel}`);
    } else {
      try {
        const response = await generate(`!fana ${args}`);
        client.say(channel, response);
        console.log(
          `* Executed !fana command with AI-generated response for: ${args} in ${channel}`
        );
      } catch (error) {
        console.error("Error generating response:", error);
        client.say(channel, "Oops! Something went wrong. Try again?");
      }
    }
  } else if (command === "!joinbot") {
    if (tags.username === channel.slice(1) || tags.mod) {
      addChannel(args);
      console.log(`Received join request from ${tags.username} for ${args}`);
    }
  }
}

function addChannel(channelName) {
  if (!client.getChannels().includes("#" + channelName)) {
    client.join(channelName);
    console.log(`Bot added to channel: ${channelName}`);
    addChannelToDB("#" + channelName);
  } else {
    console.log(`Bot is already a member of: ${channelName}`);
  }
}

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
