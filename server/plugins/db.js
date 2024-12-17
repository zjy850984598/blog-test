module.exports = (app) => {
  const mongoose = require("mongoose");
  mongoose.connect("mongodb+srv://wjanhln:wjanhln520@cluster0.ef6mx.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });
  require("require-all")(__dirname + "/../models");
};
