import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import Error from '../components/Error';
import { Tag } from 'antd';
import moment from 'moment';
import resources from "../resources";

function BookingHistory() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();

    useEffect(() => {
        async function fetchBookings() {
            try {
                setLoading(true);
                const response = await axios.post('/api/bookings/getbookingsbyuserid', { userid: user._id });
                const previousBookings = response.data.filter(booking => moment(booking.todate, 'DD-MM-YYYY').isBefore(moment()) && booking.status === 'booked');
                setBookings(previousBookings);
            } catch (error) {
                console.error(resources.admin.failedToFetchBookings, error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (user && user._id) {
            fetchBookings();
        }
    }, [user._id]);

    return (
        <div>
            {loading ? <Loader /> : error ? <Error message={resources.profile.canNotLoadBookings} /> : (
                bookings.length > 0 ? (
                    bookings.map(booking => (
                        <div className='bs' key={booking._id}>
                            <h1>{booking.room}</h1>
                            <p><b>{resources.profile.bookingId}</b> : {booking._id}</p>
                            <p><b>{resources.booking.checkIn}</b> : {booking.fromdate}</p>
                            <p><b>{resources.booking.checkOut}</b> : {booking.todate}</p>
                            <p><b>{resources.profile.total}</b> : {booking.totalamount} {resources.profile.ron}</p>
                            <p><b>{resources.admin.status}</b> : <Tag color='green'>{resources.profile.confirmed}</Tag></p>
                        </div>
                    ))
                ) : (
                    <p>{resources.booking.noPreviousBookings}</p>
                )
            )}
        </div>
    );
}

export default BookingHistory;
