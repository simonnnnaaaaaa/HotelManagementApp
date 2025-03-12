const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({

    room : {
        type: String, require: true
    },
    roomid : {
        type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true
    },
    userid: {
        type: String, require: true
    },
    fromdate : {
        type: String, require: true
    },
    todate: {
        type: String, require: true
    },
    totalamount : {
        type: Number, require: true
    },
    totaldays : {
        type: Number, require: true
    },
    transactionid : {
        type: String, require: true
    },
    status : {
        type: String, require: true, default  :'booked'
    }



}, {
    timestamps : true
})

const bookingmodel = mongoose.model('bookings', bookingSchema);

module.exports = bookingmodel;





