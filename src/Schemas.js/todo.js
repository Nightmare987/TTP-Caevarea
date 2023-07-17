const { Schema, model } = require("mongoose");

let todoSchema = new Schema({
    UserID: String,
    Content: Array
});

module.exports = model("todoSchema", todoSchema);