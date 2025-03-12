import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './CheckAvailability.css';
import Loader from '../components/Loader';
import Error from '../components/Error';
import resources from "../resources";

function CheckAvailability() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('/api/rooms/getallrooms');
                setRooms(response.data);
            } catch (error) {
                console.error(resources.admin.failedToFetchRooms, error);
                setError(error);
            }
        };

        fetchRooms();
    }, []);

    const checkAvailability = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/bookings/checkavailability', { roomId: selectedRoom });
            console.log(resources.booking.rawData, response.data); 

            const formattedData = response.data.map(booking => {
                const fromdate = new Date(booking.fromdate);
                const todate = new Date(booking.todate);

                if (isNaN(fromdate.getTime()) || isNaN(todate.getTime())) {
                    console.error(resources.booking.invalidDateValue, booking); 
                }

                return {
                    ...booking,
                    fromdate,
                    todate
                };
            });

            setAvailability(formattedData);
            setLoading(false);
        } catch (error) {
            console.error(resources.booking.failedToCheckAvailability, error);
            setError(error);
            setLoading(false);
        }
    };

    const blockDates = async () => {
        setLoading(true);
        setError(null);
        try {
            const userid = JSON.parse(localStorage.getItem("currentUser"))._id;
            await axios.post('/api/bookings/blockdates', { roomId: selectedRoom, fromdate: startDate, todate: endDate, userid });
            checkAvailability();
            setLoading(false);
        } catch (error) {
            console.error(resources.booking.failedToBlockDates, error);
            setError(error);
            setLoading(false);
        }
    };

    const isDayBlocked = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return date < today || availability.some(booking => {
            return date >= booking.fromdate && date <= booking.todate;
        });
    };

    return (
        <div className="mt-3">
            <h3>Verifică disponibilitatea camerei</h3>
            <div className="form-group">
                <label htmlFor="roomSelect">{resources.booking.select}</label>
                <select id="roomSelect" className="form-control" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                    <option value="">{resources.booking.selectRoom}</option>
                    {rooms.map(room => (
                        <option key={room._id} value={room._id}>{room.name}</option>
                    ))}
                </select>
            </div>
            <button className="btn btn-primary mt-2" onClick={checkAvailability}>Verifică disponibilitatea</button>
            {loading && <Loader />}
            {error && <Error message={resources.booking.errorChecking} />}
            {!loading && (
                <>
                    {availability.length > 0 && (
                        <div className="mt-3">
                            <DatePicker
                                inline
                                selected={startDate}
                                onChange={dates => {
                                    const [start, end] = dates;
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                highlightDates={[{ "react-datepicker__day--highlighted-custom-1": availability.map(booking => ({ start: new Date(booking.fromdate), end: new Date(booking.todate) })) }]}
                                dayClassName={date => isDayBlocked(date) ? "blocked" : undefined}
                            />
                        </div>
                    )}
                    {startDate && endDate && (
                        <div className="mt-3">
                            <button className="btn btn-success" onClick={blockDates}>{resources.booking.blockDates}</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CheckAvailability;
