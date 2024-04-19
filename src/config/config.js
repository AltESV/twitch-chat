import dotenv from 'dotenv';
dotenv.config();

export const config = {
    botUserName: process.env.BOT_USERNAME,
    twitchAccessToken: process.env.TWITCH_ACCESS_TOKEN,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    twitchRefreshToken: process.env.TWITCH_REFRESH_TOKEN,
    refreshUrl: process.env.REFRESH_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY
}