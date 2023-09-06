const { Schema, model } = require("mongoose");

let friendSchema = new Schema({
  UserID: String,
  Code: String,
});

module.exports = model("friend-codes", friendSchema);
