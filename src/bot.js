import tmi from "tmi.js";
import { config } from "./config/config.js";
import axios from "axios";
import { generate } from "./api/openai.js";
import { addChannelToDB, getActiveChannels } from "./api/supabase.js";

let client;

//token refresh handler
async function refreshAccessToken(refreshToken) {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);

  try {
    const response = await axios.post(config.refreshUrl, params);
    const { access_token, expires_in, refresh_token } = response.data;
    console.log(
      `New Access Token: ${access_token} which expires in ${expires_in} seconds`
    );
    return {
      accessToken: access_token,
      expiresIn: expires_in,
      refreshToken: refresh_token,
    };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}

refreshAccessToken(config.twitchRefreshToken).then((tokens) => {
  if (tokens) {
    config.twitchAccessToken = tokens.accessToken;
    config.twitchRefreshToken = tokens.refreshToken;
    initializeClient(tokens.accessToken);
  }
});

setInterval(() => {
  refreshAccessToken(confi.twitchRefreshToken).then((tokens) => {
    if (tokens) {
      console.log("Automatically refreshed Access Token.");
      config.twitchAccessToken = tokens.accessToken;
      config.twitchRefreshToken = tokens.refreshToken;
      initializeClient(tokens.accessToken);
    }
  });
}, 3 * 3600 * 1000);

function initializeClient(token, channels) {
  const opts = {
    options: { debug: true },
    identity: {
      username: config.botUserName,
      password: `oauth:${token}`,
    },
    channels,
  };

  //client
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

getActiveChannels().then((channels) => {
  if (channels.length > 0) {
    initializeClient(config.twitchAccessToken, channels);
  } else {
    console.log("No active channels found. Ensure your database is populated.");
  }
});

function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
