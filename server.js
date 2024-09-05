
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const port = 3000;


app.use(bodyParser.json());


const faq = {
  "What is your name?": "I am a chatbot created by Zynex Solutions.",
  "What services do you offer?": "We provide web development and digital marketing services.",
  "How can I contact support?": "You can contact support via email at support@zynexsolutions.com.",
  "What is the cost of your services?": "Our pricing varies depending on the services you need. Contact us for more details.",
  "Where are you located?": "We are located in Chennai, India."
};


app.post('/ask', (req, res) => {
  const question = req.body.question;


  const answer = faq[question];

  if (answer) {
    res.status(200).json({ question, answer });
  } else {
    res.status(404).json({ message: "Sorry, I don't have an answer for that question." });
  }
});


app.listen(port, () => {
  console.log(`Chatbot API is running on http://localhost:${port}`);
});
