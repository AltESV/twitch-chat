import axios from "axios";
import { config } from "../config/config.js";
import { supabase } from "../api/supabase.js";

export async function refreshAccessToken() {
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("*")
    .single();

    if (error) console.error("Error adding token to database:", error);

  const refreshToken = data.refresh_token;

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);

  try {
    const response = await axios.post(config.refreshUrl, params);
    const { access_token, expires_in, refresh_token } = response.data;
    const { error: updateError } = await supabase
      .from("oauth_tokens")
      .update({
        access_token: access_token,
        refresh_token: refresh_token,
        expires_in: expires_in,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (updateError) throw updateError;
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
