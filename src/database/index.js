const mongoose  = require('mongoose');

mongoose.connect('mongodb+srv://vinicius:vinicius@cluster0-37erj.mongodb.net/noderest?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true

});
mongoose.Promise = global.Promise;

module.exports = mongoose;