const mongoose = require("mongoose");
const Schema = mongoose.Schema ;

const Bulk = new Schema({

    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tblvendors"
    },


    process: [
        {
            processLevel : {
                type: Number
            },
            processStage:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "tblbulkstages"
            },
            length:{
                type: Number
            },
            ppm:{
                type: Number
            },
            totalCost: {
                type: Number
            },
            expenseList:[
                {
                    expense:{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "tblexpenses"
                    },
                    cost: {
                        type: Number
                    }          
                }    
            ],
        }
    ],

    processStage:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tblbulkstages"
    }
    // initialBulk:{
    //     type:{
    //         bulkLength: {
    //             type: Number
    //         } ,
    //         PPM: {
    //             type: Number
    //         } , 
    //         vendor: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: "tblvendors"
    //         }
    //     }
    // },

    // deyingBulk:{
    //     type:{
    //         deyingExpense: {
    //             type: Number,
    //         },
    //         deyingShortage: {
    //             type: Number
    //         },
    //         transportSendingExpense:{
    //             type: Number
    //         },
    //         transportReceivingExpense:{
    //             type: Number
    //         }
    //     }
    // },

    // packaging: {
    //     type: {
    //         cutPieces: {
    //             type:{
    //                 length: {
    //                     type: Number
    //                 },
    //                 price: {
    //                     type: Number
    //                 }
    //             }
    //         },
    //         finishedPieces: {
    //             type: {
    //                 length: {
    //                     type: Number 
    //                 }
    //             }
    //         }
    //     }
    // },
    
})

module.exports = mongoose.model( "tblbulks", Bulk );