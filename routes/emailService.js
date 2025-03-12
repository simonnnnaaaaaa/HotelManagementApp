const nodemailer = require('nodemailer');
require("dotenv").config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

});

const sendBookingConfirmation = (recipient, bookingDetails) => {
    console.log('Detalii rezervare pentru email:', bookingDetails); 
    
    const mailOptions = {
        from: 'SereneStay@gmail.com',
        to: recipient,
        subject: 'Confirmare rezervare Serene Stay',
        text: `Bună ziua,

        Rezervarea dvs. a fost confirmată cu succes.
        
        Detalii rezervare:
        - Camera: ${bookingDetails.room.name}
        - De la: ${bookingDetails.fromdate}
        - Până la: ${bookingDetails.todate}
        - Pret pe noapte: ${bookingDetails.price}

        Vă mulțumim pentru alegerea făcută!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Eroare la trimiterea emailului:', error);
        } else {
            console.log('Email trimis:', info.response);
        }
    });
};

module.exports = { sendBookingConfirmation };
