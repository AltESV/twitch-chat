import { OpenAI } from "openai";
import { config } from "../config/config.js";

const openai = new OpenAI({ apiKey: config.openaiApiKey });

export async function generate(message) {
  try {
    const faqText = `FAQ:
        -Is Fana a non-profit? Fana Impact Foundation, Inc. is a US tax-exempt 501(c)(3) not-for-profit organization with the sole purpose of granting funds raised through designated Fana fundraising campaigns to various charitable organizations.
        -Where do the raffle entry payments go? Fana will donate 90% of "Net Proceeds" to the charitable organization or cause identified in the creator campaign.  The balance 10% covers Fana's technology and infrastructure costs in running the platform.  We do not deduct our salaries or central overheads from the Donations.  “Net Proceeds” means 100% of your Entry Fee, minus the costs associated with providing the prizes, the costs associated with the creator hosting the campaign, and the reasonable costs of marketing and operating the promotion.
        -What are Fana Do-Good Raffles? Fana's "do good raffles" allows creators to host raffles or prize draws within their communities, encouraging donations for various causes.
        -How can I set up a raffle on my Twitch stream? You can sign up on Fana's platform, select a cause or charity, and integrate the raffle system with your Twitch stream to start raising funds through interactive raffles.
        -Are there specific charities I can support? Yes, Fana have partnered with a roster of high-impact, trusted charities, that have raised billions and have tons of supporters.  Alternatively, you can also add your own preferred charities to the platform.
        -Which charities will my donation support? Your donation will support the cause chosen by the creator.
        -Are there any benefits for participating in these raffles? Besides supporting a good cause, you have the chance to win various prizes and be part of a community-driven initiative.
        -How do I know my donation is making a difference? Fana will track the impact that our community makes and will provide updates when available on the projects supported by the Do-Good raffles

        - What is Fana? Fana is the charity of charities! We bring vetted and high impact projects to Twitch streamers and their communities.
        - Why Fana and not another charity? We provide insight into where your money actually goes, provide regular content about your supported projects, and rotate through different projects each month!
        - Are there any other ways to support the charity or Fana other than through money? You can help us find other streamers who want to join our creators for good!
        - Will there be transparency on how much was raised today? Absolutely, we'll provide the streamer with a recap of total amounts raised and what it went towards a few days after the stream!
        -What is the Fana card? The Fana card is a UK-based debit card that automatically donates 1% of your spending to charities on your behalf. This initiative was the original reason for curating our list of charities and putting in the work to provide insight into their actions — we wanted to ensure that the funds generated by this product go to worthy causes. Fana streaming shares this roster of trusted charities and the curated knowledge and experience we've gathered, allowing viewers to contribute to the same causes. This creates a bigger combined impact and re-uses the research and work done to find the best possible charities. If you're in the UK, be sure to check it out!
`
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
