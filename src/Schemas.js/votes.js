const { model, Schema } = require("mongoose");

let vote = new Schema({
  Guild: String,
  Msg: String,
  Nominee: String,
  Upmembers: Array,
  Downmembers: Array,
  Upvote: Number,
  Downvote: Number,
  Owner: String,
});

module.exports = model("vote", vote);
