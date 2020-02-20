const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BulkStages = new Schema({
    name: {
        type: String,
        required: true
    },
    level:{
        type: Number
    }
});
module.exports = mongoose.model("tblbulkstages", BulkStages);
