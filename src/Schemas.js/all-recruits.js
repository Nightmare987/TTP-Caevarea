const { Schema, model } = require("mongoose");

let allRecruitsSchema = new Schema({
  RecruitID: String,
  RecruitName: String,
});

module.exports = model("all-recruits", allRecruitsSchema);
