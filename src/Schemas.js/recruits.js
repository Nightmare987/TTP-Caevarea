const { model, Schema } = require("mongoose");

let recruitsSchema = new Schema({
  RecruitID: String,
  RecruitName: String,
  BeginDate: String,
  Tryouts: Array,
});

module.exports = model("recruits", recruitsSchema);