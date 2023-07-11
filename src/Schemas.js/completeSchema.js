const { model, Schema } = require("mongoose");

let completeSchema = new Schema({
    Something: String,
    Recruits: Array,
});

module.exports = model("completeSchema", completeSchema);