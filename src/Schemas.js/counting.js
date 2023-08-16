const { Schema, model } = require("mongoose");

let counting = new Schema({
  Guild: String,
  Number: Number,
  LastUser: String,
});

module.exports = model("counting", counting);
