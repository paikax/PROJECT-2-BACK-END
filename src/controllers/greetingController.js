const Greeting = require('../models/Greeting');

exports.getGreeting = async (req, res) => {
  try {
    const message = await Greeting.findOne();
    res.send(message);
  } catch (err) {
    res.status(500).send('Error fetching greeting');
  }
};
