const { Schema, model } = require("mongoose");

let eventSchema = new Schema({
  MessageID: String,
  EventName: String,
  EventDate: String,
  ChannelID: String,
  Owner: String,
  Size: Number,
  PartRole: String,
  SubRole: String,
  Participants: Array,
  Subs: Array,
});

module.exports = model("events", eventSchema);
