import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Room from '../components/Room';
import Loader from '../components/Loader';
import Error from '../components/Error';
import moment from 'moment';
import { DatePicker } from 'antd';
import resources from "../resources";

const { RangePicker } = DatePicker;

function Homescreen() {

    useEffect(() => {
        document.body.style.backgroundImage = "url('/hp.png')";
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


    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromdate, setFromdate] = useState();
    const [todate, setTodate] = useState();
    const [duplicaterooms, setduplicaterooms] = useState([]);
    const [searchkey, setsearchkey] = useState('');
    const [type, settype] = useState('all');
    const [capacity, setCapacity] = useState(1);
    const [sortOrder, setSortOrder] = useState('default');

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('/api/rooms/getallrooms');
                if (response.status === 200) {
                    const activeRooms = response.data.filter(room => room.status === 'active');
                    setRooms(activeRooms);
                    setduplicaterooms(activeRooms);
                } else {
                    throw new Error(resources.admin.failedToFetchRooms);
                }
            } catch (error) {
                console.error(resources.admin.failedToFetchRooms, error);
                setError(error);
            }
            setLoading(false);
        };

        fetchRooms();
    }, []);

    useEffect(() => {
        if (sortOrder !== 'default') {
            sortRoomsByPrice(sortOrder);
        }
    }, [sortOrder, rooms]);

    useEffect(() => {
        if (searchkey === '') {
            setRooms(duplicaterooms);
        }
    }, [searchkey, duplicaterooms]);

    function filterByDate(dates) {
        if (dates && dates.length === 2 && dates[0] && dates[1]) {
            const startDate = moment(dates[0].format('DD-MM-YYYY'), 'DD-MM-YYYY');
            const endDate = moment(dates[1].format('DD-MM-YYYY'), 'DD-MM-YYYY');

            setFromdate(startDate);
            setTodate(endDate);

            var temprooms = [];
            var availability = false;

            for (const room of duplicaterooms) {
                if (room.currentbookings.length > 0) {
                    availability = true;
                    for (const booking of room.currentbookings) {
                        const bookingFromDate = moment(booking.fromdate, 'DD-MM-YYYY');
                        const bookingToDate = moment(booking.todate, 'DD-MM-YYYY');

                        if (startDate.isBetween(bookingFromDate, bookingToDate, null, '[]') ||
                            endDate.isBetween(bookingFromDate, bookingToDate, null, '[]') ||
                            bookingFromDate.isBetween(startDate, endDate, null, '[]') ||
                            bookingToDate.isBetween(startDate, endDate, null, '[]')) {
                            availability = false;
                            break;
                        }
                    }
                }

                if (availability || room.currentbookings.length === 0) {
                    temprooms.push(room);
                }
            }

            setRooms(temprooms);
        }
    }

    function filterBySearch() {
        if (searchkey.trim() === '') {
            setRooms(duplicaterooms);
        } else {
            const temprooms = duplicaterooms.filter(room => room.name.toLowerCase().includes(searchkey.toLowerCase()));
            setRooms(temprooms);
        }
    }

    function filterByType(e) {
        settype(e);

        if (e !== 'all') {
            const temprooms = duplicaterooms.filter(room => room.type.toLowerCase() === e.toLowerCase());
            setRooms(temprooms);
        } else {
            setRooms(duplicaterooms);
        }
    }

    function filterByCapacity(e) {
        const selectedCapacity = parseInt(e.target.value, 10);
        if (selectedCapacity >= 1) {
            setCapacity(selectedCapacity);
            const temprooms = duplicaterooms.filter(room => room.maxcount >= selectedCapacity);
            setRooms(temprooms);
        }
    }

    function sortRoomsByPrice(order) {
        const sortedRooms = [...rooms].sort((a, b) => {
            if (order === 'ascending') {
                return a.rentperday - b.rentperday;
            } else if (order === 'descending') {
                return b.rentperday - a.rentperday;
            }
            return 0;
        });
        setRooms(sortedRooms);
    }

    function disabledDate(current) {
        return current && current < moment().startOf('day');
    }

    return (
        <div className='container'  >
            <div className='row mt-5 bs' style={{ backgroundColor: '#FFF' }}>
                <div className='col-md-3' style={{ backgroundColor: '#fff' }}>
                    <RangePicker format='DD-MM-YYYY' onChange={filterByDate} disabledDate={disabledDate} />
                </div>

                <div className='col-md-3'>
                    <input type='text' className='form-control' placeholder={resources.home.roomSearch} value={searchkey} onChange={(e) => { setsearchkey(e.target.value); filterBySearch(); }} />
                </div>

                <div className='col-md-3' >
                    <select className='form-control' value={type} onChange={(e) => { filterByType(e.target.value); }}>
                        <option value="all">{resources.home.roomType}</option>
                        <option value="delux">{resources.admin.delux}</option>
                        <option value="non-delux">{resources.admin.delux}</option>
                    </select>
                </div>

                <div className='col-md-3'>
                    <input type='number' className='form-control' placeholder={resources.home.maxCapacity} min="1" step="1" value={capacity} onChange={filterByCapacity} />
                </div>
            </div>

            <div className='row justify-content-start mt-2'>
                <div className='col-md-3'>
                    <select className='sortare' value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="default">{resources.admin.sort}</option>
                        <option value="ascending">{resources.home.ascending}</option>
                        <option value="descending">{resources.home.descending}</option>
                    </select>
                </div>
            </div>

            <div className='row justify-content-center mt-2'>
                {loading ? (
                    <h1><Loader /></h1>
                ) : (
                    rooms.map(room => (
                        <div key={room._id} className="col-md-9 mt-2">
                            <Room room={room} fromdate={fromdate ? fromdate : ''} todate={todate ? todate : ''} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Homescreen;
