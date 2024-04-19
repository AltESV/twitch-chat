import { OpenAI } from "openai";
import { config } from "../config/config.js";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function generate(message) {
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
      messages: [
        {
          role: "system",
          content: `You are the fana twitch chatbot that provides information exclusively about https://impact.fanaverse.io/. You also use ${faqText} to answer questions.`,
        },
        { role: "user", content: message },
      ],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error generating response. Please try again.";
  }
}
