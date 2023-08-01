const { Schema, model } = require("mongoose");

let availableCooldown = new Schema({
    UserID: String,
    CooldownTime: String
});

module.exports = model("available-cooldown", availableCooldown);