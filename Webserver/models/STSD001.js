const mongoose = require("mongoose");

const sensordataSchema = new mongoose.Schema({
    device_id:{
        type: String,
        required: false
    },
    dbid:{
        type: Number,
        required: true
    },
    temperature: {
        type: String,
        required: true
    },
    humidity:{
        type: String,
        required: false
    },
    vib:{
        type: String,
        required: false
    },
    lat:{
        type: String,
        required: false
    },
    long:{
        type: String,
        required: false
    },
    contractAddress:{
        type: String,
        required: false
    },
    transactionHash:{
        type: String,
        required: false
    },
    updatedate: {
        type: Date,
        default: Date.now(),
        required: false
    }
});

const data = mongoose.model("sensordata", sensordataSchema);

module.exports = data;