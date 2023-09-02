const { Schema, model } = require("mongoose");

let availableCooldown = new Schema({
    UserID: String,
    UserName: String,
    CooldownTime: String
});

module.exports = model("available-cooldown", availableCooldown);