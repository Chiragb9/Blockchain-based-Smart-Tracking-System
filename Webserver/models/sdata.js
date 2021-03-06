const mongoose = require("mongoose");

const sensordataSchema = new mongoose.Schema({
    temperature: {
        type: String,
        required: true
    },
    transactionHash:{
        type: String,
        required: true
    },
    updatedate: {
        type: Date,
        default: Date.now(),
        required: false
    }
});

const data = mongoose.model("sensordata", sensordataSchema);

module.exports = data;