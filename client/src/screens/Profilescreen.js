import React, { useEffect, useState } from 'react';
import { Tabs, Tag, Select } from 'antd';
import axios from 'axios';
import Loader from '../components/Loader';
import Error from '../components/Error';
import Swal from 'sweetalert2';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import resources from "../resources";
import BookingHistory from '../components/BookingHistory'; 

const { Option } = Select;

function Profilescreen() {

    useEffect(() => {
        document.body.style.backgroundImage = "url('/profile.png')";
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


    const user = JSON.parse(localStorage.getItem("currentUser"));
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            window.location.href = '/login';
        }
    }, [user]);

    const getInitialTab = () => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') === 'rezervari' ? '2' : '1';
    }

    const tabItems = [
        {
            label: 'Profil',
            key: '1',
            children: (
                <div className="profile-container" >
                    <div className="profile-card">
                        <h2>Profilul meu</h2>
                        <p><span>{resources.admin.name}:</span> {user?.name}</p>
                        <p><span>{resources.admin.mail}:</span> {user?.email}</p>
                        <p><span>{resources.admin.admin}:</span> {user?.isAdmin ? resources.profile.yes : resources.profile.no}</p>
                    </div>
                    <div className="history-card">
                        <h2>{resources.profile.history}</h2>
                        <BookingHistory />
                    </div>
                </div>
            )
        },
        {
            label: resources.profile.bookings,
            key: '2',
            children: <MyBookings />
        }
    ];

    return (
        <div className='ml-3 mt-3'>
            <Tabs defaultActiveKey={getInitialTab()} items={tabItems} />
        </div>
    );
}

export default Profilescreen;

export function MyBookings() {
    const user = JSON.parse(localStorage.getItem("currentUser"))
    const [bookings, setbookings] = useState([])
    const [filteredBookings, setFilteredBookings] = useState([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchBookings() {
            try {
                setLoading(true);
                const response = await axios.post('/api/bookings/getbookingsbyuserid', { userid: user._id });
                console.log(response.data);
                setbookings(response.data);
                setFilteredBookings(response.data);
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

    useEffect(() => {
        filterBookings(filter);
    }, [filter, bookings]);

    const handleFilterChange = (value) => {
        setFilter(value);
    };

    const filterBookings = (filter) => {
        const currentDate = moment();
        let filtered = bookings;
        if (filter === 'previous') {
            filtered = bookings.filter(booking => moment(booking.todate, 'DD-MM-YYYY').isBefore(currentDate) && booking.status === 'booked');
        } else if (filter === 'future') {
            filtered = bookings.filter(booking => moment(booking.fromdate, 'DD-MM-YYYY').isAfter(currentDate) && booking.status === 'booked');
        } else if (filter === 'cancelled') {
            filtered = bookings.filter(booking => booking.status === 'cancelled');
        }
        setFilteredBookings(filtered);
    };

    async function cancelBooking(bookingid, roomid, fromdate) {
        const currentDate = moment();
        const checkInDate = moment(fromdate, 'DD-MM-YYYY');
        const daysUntilCheckIn = checkInDate.diff(currentDate, 'days');

        if (daysUntilCheckIn < 5) {
            Swal.fire(resources.profile.canNotCancel, resources.profile.tooLate, 'error');
            return;
        }

        try {
            setLoading(true);
            const result = await (await axios.post("/api/bookings/cancelbooking", { bookingid, roomid })).data;
            console.log(result);
            setLoading(false);
            Swal.fire(resources.admin.congrats, resources.profile.bookingCanceled, 'success').then(result => {
                window.location.reload();
            });
        } catch (error) {
            console.log(error);
            setLoading(false);
            Swal.fire(resources.admin.oops, resources.admin.somethingWentWrong, 'error');
        }
    }

    return (
        <div className='booking-row'>
            <Select defaultValue="all" style={{ width: 200 }} onChange={handleFilterChange}>
                <Option value="all">{resources.profile.allReservations}</Option>
                <Option value="previous">{resources.profile.previousBookings}</Option>
                <Option value="future">{resources.profile.futureBookings}</Option>
                <Option value="cancelled">{resources.profile.canceledBookings}</Option>
            </Select>
            <div className='row'>
                <div className='col-md-6'>
                    {loading ? <Loader /> : error ? <Error message={resources.profile.canNotLoadBookings} /> : (
                        filteredBookings.map(booking => (
                            <div className='bs' key={booking._id}>
                                <h1>{booking.room}</h1>
                                <p><b></b>{resources.profile.bookingId} : {booking._id}</p>
                                <p><b>{resources.booking.checkIn}</b> : {booking.fromdate}</p>
                                <p><b>{resources.booking.checkOut}</b> : {booking.todate}</p>
                                <p><b>{resources.booking.total}</b> : {booking.totalamount} {resources.profile.ron}</p>

                                {booking.status !== 'cancelled' && (
                                    <div style={{ float: "right" }}>
                                        <button className='btn btn-primary' onClick={() => (cancelBooking(booking._id, booking.roomid, booking.fromdate))}>{resources.profile.cancel}</button>
                                    </div>
                                )}

                                <p><b>{resources.admin.status}</b> : {booking.status === 'booked' ? (<Tag color='green'>{resources.profile.confirmed}</Tag>) : (<Tag color='red'>{resources.profile.canceled}</Tag>)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
