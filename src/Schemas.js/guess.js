const { Schema, model } = require("mongoose");

let guessSchema = new Schema({
  UserID: String,
  Points: Number,
  Maxes: Number,
  Wins: Number,
  Gained: Number,
  Loses: Number,
  Lost: Number,
});

module.exports = model("guess", guessSchema);
