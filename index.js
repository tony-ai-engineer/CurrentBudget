'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  console.log(event);
  if ((event.type !== 'message' || event.message.type !== 'text') && (event.type !== 'message' || event.message.type !== 'sticker')) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const fs = require('fs');

  if (event.message.type === 'text' && event.message.text.startsWith('設定')) {
    // const balance = JSON.parse(fs.readFileSync('balance.json', 'utf8'));
    const newBalance = event.message.text.slice(2);
    fs.writeFileSync('balance.json', JSON.stringify({"balance": newBalance}), 'utf8');

    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{type: 'text', text: "設定成功，剩餘預算為：" + newBalance.toString()}],
    });
  }

  const curBalance = JSON.parse(fs.readFileSync('balance.json', 'utf8'));

  // Get today's date
  const today = new Date();

  // Create a date for May 10 of the current year
  const targetDate = new Date(today.getFullYear(), 4, 10); // Month is 0-indexed (4 = May)

  // Check if the target date has already passed this year
  if (today > targetDate) {
      // If May 10 this year has passed, set the target to May 10 of the next year
      targetDate.setFullYear(today.getFullYear() + 1);
  }

  // Calculate the difference in milliseconds
  const difference = targetDate - today;

  // Convert milliseconds to days
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: "至5/10每天預算剩 " + (curBalance.balance / days).toFixed(1).toString() + " 元" }],
  });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});