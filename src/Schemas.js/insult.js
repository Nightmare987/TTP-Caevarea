const { Schema, model } = require("mongoose");

let insultSchema = new Schema({
  UserID: String,
  Insult: String,
});

module.exports = model("insult", insultSchema);
