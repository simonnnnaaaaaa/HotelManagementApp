const express = require("express");
const router = express.Router();
const Booking = require("../models/booking")
const moment = require("moment")
const Room = require("../models/room")

const User = require("../models/user"); 
const { sendBookingConfirmation } = require('./emailService'); 


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { v4: uuidv4 } = require('uuid');

router.post("/bookroom", async (req, res) => {
    const { room, userid, fromdate, todate, totalamount, totaldays, token } = req.body;
    const formattedFromDate = moment(fromdate).format('DD-MM-YYYY');
    const formattedToDate = moment(todate).format('DD-MM-YYYY');
    
    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });
        const idempotencyKey = uuidv4();
        const payment = await stripe.charges.create({
            amount: totalamount * 100, 
            currency: 'ron',
            customer: customer.id,
            receipt_email: token.email,
        }, {
            idempotencyKey: idempotencyKey
        });

        if (payment) {
            const newbooking = new Booking({
                room: room.name,
                roomid: room._id,
                userid,
                fromdate : formattedFromDate,
                todate : formattedToDate,
                totalamount,
                totaldays,
                transactionId: payment.id
            });
            const booking = await newbooking.save();
            const roomToUpdate = await Room.findOne({ _id: room._id });
            roomToUpdate.currentbookings.push({
                bookingid: booking._id,
                fromdate: formattedFromDate,
                todate: formattedToDate,
                userid: userid,
                status: booking.status
            });
            await roomToUpdate.save();
           
             const user = await User.findById(userid);
             if (user) {
                 console.log("Trimitere email către:", user.email); 
                 sendBookingConfirmation(user.email, { 
                     room,
                     fromdate,
                     todate,
                     price: totalamount / totaldays
                 });
             }  else {
                console.log("Utilizatorul nu a fost găsit pentru ID-ul:", userid);
            }
             
           
            res.send({ message: 'Payment successful, room is booked', booking: booking });
        }
    } catch (error) {
        console.error("Error processing payment/booking:", error);
        res.status(500).send({ error: error.message });
    }
});

router.post("/getbookingsbyuserid", async(req, res) => {
    const userid = req.body.userid

    try {
        const bookings = await Booking.find({userid : userid}) 
        res.send(bookings)
    } catch (error) {
        return res.status(400).json({ error });
    }
});


router.post("/cancelbooking", async(req, res) => {
    const {bookingid, roomid} = req.body
    try {
        const bookingitem = await Booking.findOne({_id : bookingid})
        
        bookingitem.status = 'cancelled'

        await bookingitem.save()

        const room = await Room.findOne({_id : roomid})

        const bookings = room.currentbookings

        const temp = bookings.filter(booking => booking.bookingid.toString()!==bookingid)

        room.currentbookings = temp

        await room.save()

        res.send("Rezervarea a fost anulată cu succes")
    } catch (error) {
        return res.status(400).json({error});
    }

})

router.get("/getallbookings", async(req, res) => {

    try {
        const bookings = await Booking.find()
        res.send(bookings)
    } catch (error) {
        return res.status(400).json({ error });
    }
});

router.get("/reports/booked", async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'booked' }).populate('roomid');
        const reportData = bookings.reduce((acc, booking) => {
            const roomName = booking.room;
            if (!acc[roomName]) {
                acc[roomName] = 0;
            }
            acc[roomName]++;
            return acc;
        }, {});

        const data = Object.keys(reportData).map(roomName => ({
            name: roomName,
            value: reportData[roomName]
        }));

        res.json(data);
    } catch (error) {
        console.error('Error fetching booked report:', error);
        res.status(500).send('Server error');
    }
});


router.get("/reports/bookings-by-month", async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').format('DD-MM-YYYY');
        const endDate = moment(startDate, 'DD-MM-YYYY').endOf('month').format('DD-MM-YYYY');

        const bookings = await Booking.find({
            fromdate: { $gte: startDate, $lte: endDate }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
});




router.post("/checkavailability", async (req, res) => {
    const { roomId } = req.body;

    try {
        const bookings = await Booking.find({ roomid: roomId, status: 'booked' });
        const formattedBookings = bookings.map(booking => {
            const fromdate = moment(booking.fromdate, 'DD-MM-YYYY').toDate();
            const todate = moment(booking.todate, 'DD-MM-YYYY').toDate();

            console.log('Formatted fromdate:', fromdate); 
            console.log('Formatted todate:', todate); 

            return {
                ...booking._doc,
                fromdate: fromdate.toISOString(),
                todate: todate.toISOString()
            };
        });

        console.log('Formatted bookings for frontend:', formattedBookings);

        res.send(formattedBookings);
    } catch (error) {
        console.error('Failed to check availability:', error);
        res.status(500).json({ message: 'Failed to check availability' });
    }
});

router.post("/blockdates", async (req, res) => {
    const { roomId, fromdate, todate, userid } = req.body;

    const formattedFromDate = moment(fromdate).format('DD-MM-YYYY');
    const formattedToDate = moment(todate).format('DD-MM-YYYY');

    console.log("Formatted fromdate:", formattedFromDate); 
    console.log("Formatted todate:", formattedToDate); 

    const newBooking = new Booking({
        room: roomId,
        roomid: roomId,
        userid: userid,
        fromdate: formattedFromDate,
        todate: formattedToDate,
        totalamount: 0,
        totaldays: moment(formattedToDate).diff(moment(formattedFromDate), 'days') + 1,
        transactionid: 'cash',
        status: 'blocked'
    });

    try {
        await newBooking.save();
        res.send('Dates blocked successfully');
    } catch (error) {
        console.error('Failed to block dates:', error);
        res.status(500).json({ message: 'Failed to block dates' });
    }
});






module.exports = router;





