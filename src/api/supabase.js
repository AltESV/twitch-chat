import { config } from "../config/config.js";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

export async function addChannelToDB(channelName) {
  const { data, error } = await supabase
    .from("channels")
    .upsert([{ channel_name: channelName, is_active: true }], {
      onConflict: "channel_name",
    });

  if (error) console.error("Error adding channel to database:", error);
  else console.log("Channel added to database:", data);
}

export async function getActiveChannels() {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("Error retrieving channels:", error);
    return [];
  }
  return data.map((channel) => channel.channel_name);
}
