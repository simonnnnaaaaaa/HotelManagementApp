import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from "axios";
import Loader from '../components/Loader';
import Error from '../components/Error';
import moment from 'moment';
import StripeCheckout from 'react-stripe-checkout';
import Swal from 'sweetalert2'
import resources from "../resources";

function Bookingscreen() {

    useEffect(() => {
        document.body.style.backgroundImage = "url('/a.png')";
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed'; 

        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.backgroundAttachment = '';
        };
    }, []);

    const { roomid, fromdate, todate } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [room, setRoom] = useState();
   
    const [totaldays, setTotaldays] = useState();
    const [totalamount, setTotalamount] = useState();

    useEffect(() => {
        (async () => {

            if (!localStorage.getItem('currentUser')) {
                window.location.href = '/login';
            }

            try {
                setLoading(true);
                const response = await axios.post('/api/rooms/getroombyid', { roomid });
                setRoom(response.data);
            } catch (error) {
                console.error( resources.booking.failedToFetchRoomDetails, error);
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, [roomid]);

    useEffect(() => {
        if (room && fromdate && todate) {
            const fromMoment = moment(fromdate);
            const toMoment = moment(todate);
            const days = toMoment.diff(fromMoment, 'days');
            setTotaldays(days);
            if (days >= 0) {
                setTotalamount(days * room.rentperday);
            }
        }
    }, [room, fromdate, todate]);

    async function onToken(token) {
        
        const bookingDetails = {
            room: room,
            userid: JSON.parse(localStorage.getItem('currentUser'))._id,
            fromdate,
            todate,
            totalamount,
            totaldays,
            token
        };

        try {

            setLoading(true);

            const response = await axios.post('/api/bookings/bookroom', bookingDetails);
            console.log(resources.booking.bookingSuccesful, response.data);

            setLoading(false);

            Swal.fire(resources.admin.congrats, resources.booking.roomBooked, 'success').then(result => {
                window.location.href='/profile'
            })
        } catch (error) {
            console.error(resources.booking.bookingFailed, error.response ? error.response.data : error.message);
            setError(error);
            setLoading(false);
            Swal.fire(resources.admin.oops, resources.admin.somethingWentWrong, 'error')
        }
    }

    return (
        <div className='m-5' >
            {loading ? <Loader /> : error ? <Error /> : room && (
                <div className='row justify-content-center mt-5 bs' style={{ backgroundColor: '#FFF7EF'}}>
                    <div className='col-md-5'>
                        <h1>{room.name}</h1>
                        <img src={room.imageurls[0]} alt={room.name} className='bigimg' />
                    </div>
                    <div className='col-md-5'>
                        <div style={{ textAlign: 'right' }}>
                            <h1>Detalii Rezervare</h1>
                            <hr />
                            <b>
                                <p>{resources.booking.user} : {JSON.parse(localStorage.getItem('currentUser')).name}</p>
                                <p>{resources.booking.checkIn} : {moment(fromdate).format('DD-MM-YYYY')}</p>
                                <p>{resources.booking.checkOut} : {moment(todate).format('DD-MM-YYYY')}</p>
                                <p>{resources.admin.capacity} : {room.maxcount}</p>
                            </b>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <b>
                                <h1>Valoare</h1>
                                <hr />
                                {totaldays !== undefined && (
                                    <div>
                                        <p>{resources.booking.numberOfNights} : {totaldays}</p>
                                        <p>{resources.booking.pricePerNight} : {room.rentperday}</p>
                                        <p>{resources.booking.totalValue} : {totalamount} RON</p>
                                    </div>
                                )}
                            </b>
                        </div>
                        <div style={{ float: 'right', fontWeight: 'bold' }}>
                            <StripeCheckout
                                amount={totalamount * 100}
                                token={onToken}
                                currency='RON'
                                stripeKey='pk_test_51P8OVWJitcPhSBozJa7sNuK30KPUNY49Ex9S9jjOeLRQtQ3weD9sp0GveV24kiqzWfqARfIIxserOsLadV2ozAnl006B41exU3'
                            >
                                <button className='btn btn-primary' >{resources.booking.toPayment}</button>
                            </StripeCheckout>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Bookingscreen;