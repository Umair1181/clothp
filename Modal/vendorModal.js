const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Vendor = new Schema({
    name: {
        type: String,
        required  : true
    },
    contact: {
        type: String,
    }
})

module.exports = mongoose.model( "tblvendors", Vendor );