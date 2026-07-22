
require("dotenv").config();
const axios = require("axios");
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/ninjabot-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/ninjabot-ping - Tests the latency of the bot
/ninjabot-catfact - Get a cat fact
/ninjabot-joke - Get a fun joke
/ninjabot-nasapic - Get NASA's Astronomy Picture of the Day`
  });
});

app.command("/ninjabot-catfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${response.data.fact}` });
  } catch (err) {
    await respond({ text: "Failed to fetch a cat fact." });
  }
});

app.command("/ninjabot-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/ninjabot-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});

app.command("/ninjabot-nasapic", async ({ ack, respond }) => {
  await ack();

  try {
    const apiKey = process.env.NASA_API_KEY;
    const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);

    const { title, explanation, url, media_type } = response.data;

    if (media_type === "image") {
      await respond({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${title}*\n\n${explanation}`
            }
          },
          {
            type: "image",
            image_url: url,
            alt_text: title
          }
        ]
      });
    } else {

      await respond({
        text: `*${title}*\n\n${explanation}\n\nWatch video here: ${url}`
      });
    }
  } catch (err) {
    console.error("NASA APOD Error:", err.response?.data || err.message);
    await respond({ text: "Failed to fetch NASA Picture of the Day." });
  }
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();