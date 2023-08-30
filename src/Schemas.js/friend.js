const { Schema, model } = require("mongoose");

let friendSchema = new Schema({
  UserID: String,
  UserName: String,
  Code: String,
});

module.exports = model("friend-codes", friendSchema);
