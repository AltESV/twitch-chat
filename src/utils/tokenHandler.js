import axios from "axios";
import { config } from "../config/config.js";

export async function refreshAccessToken(refreshToken) {
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
