require('dotenv/config');

const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.Promise = global.Promise;

module.exports = mongoose;