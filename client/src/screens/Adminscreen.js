import React, { useState, useEffect } from "react";
import { Tabs } from 'antd';
import axios from "axios";
import Loader from '../components/Loader';
import Error from '../components/Error';
import Swal from 'sweetalert2';
import Reports from '../components/Reports';
import CheckAvailability from '../components/CheckAvailability'; 
import resources from "../resources";

function Adminscreen() {

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

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = '/home';
        }
    }, []);

    const items = [
        { key: "1", label: resources.admin.reservations, children: <Bookings /> },
        { key: "2", label: resources.admin.rooms, children: <Rooms /> },
        { key: "3", label: resources.admin.addRoom, children: <AddRoom /> },
        { key: "4", label: resources.admin.users, children: <Users /> },
        { key: "5", label: resources.admin.reports, children: <Reports /> }
    ];

    return (
        <div className="mt-3 ml-3 mr-3 bs" style={{ backgroundColor: '#FFF7EF' }}>
            <h2 style={{ fontFamily: "Poppins" }}><b>{resources.admin.adminPage}</b></h2>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
}

export default Adminscreen;

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/bookings/getallbookings');
                setBookings(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
                setError(error);
                setLoading(false);
            }
        };

        fetchData();

        return () => {};
    }, []);

    return (
        <div className="row">
            <div className="col-md-12">
                <h1>Rezervări</h1>
                {loading && <Loader />}
                <table className="table table-bordered table-dark">
                    <thead className="bs">
                        <tr>
                            <th>{resources.admin.bookingId}</th>
                            <th>{resources.admin.userId}</th>
                            <th>{resources.admin.room}</th>
                            <th>{resources.admin.room}</th>
                            <th>{resources.admin.to}</th>
                            <th>{resources.admin.status}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>{booking._id}</td>
                                    <td>{booking.userid}</td>
                                    <td>{booking.room}</td>
                                    <td>{booking.fromdate}</td>
                                    <td>{booking.todate}</td>
                                    <td>{booking.status}</td>
                                </tr>
                            ))
                        ) : (
                            !loading && <tr><td colSpan="6">Nu există rezervări.</td></tr>
                        )}
                    </tbody>
                </table>
                {!loading && bookings.length ? (
                    <div>
                        <h1>{bookings.length} {resources.admin.totalBookings}</h1>
                    </div>
                ) : error ? (
                    <Error message= {resources.admin.reservationsError} />
                ) : null}
            </div>
        </div>
    );
}



function Rooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/rooms/getallrooms');
                setRooms(response.data);
                setLoading(false);
            } catch (error) {
                console.error(resources.admin.failedToFetchRooms, error);
                setError(error);
                setLoading(false);
            }
        };

        fetchData();

        return () => {};
    }, []);

    const deactivateRoom = async (roomid) => {
        try {
            setLoading(true);
            await axios.post('/api/rooms/deactivateroom', { roomid });
            setLoading(false);
            Swal.fire(resources.admin.success , resources.admin.roomDeactivated, 'success').then(() => {
                window.location.reload();
            });
        } catch (error) {
            setLoading(false);
            Swal.fire('Error', resources.admin.somethingWentWrong, 'error');
        }
    };

    const activateRoom = async (roomid) => {
        try {
            setLoading(true);
            await axios.post('/api/rooms/activateroom', { roomid });
            setLoading(false);
            Swal.fire(resources.admin.success , resources.admin.roomActivated, 'success').then(() => {
                window.location.reload();
            });
        } catch (error) {
            setLoading(false);
            Swal.fire('Error', resources.admin.somethingWentWrong, 'error');
        }
    };

    return (
        <div className="row">
            <div className="col-md-12">
                <h1>Camere</h1>
                {loading && <Loader />}
                <table className="table table-bordered table-dark">
                    <thead className="bs">
                        <tr style={{ color: '#A4695D'}}>
                            <th>{resources.admin.roomId}</th>
                            <th>{resources.admin.roomName}</th>
                            <th>{resources.admin.type}</th>
                            <th>{resources.admin.pricePerDay}</th>
                            <th>{resources.admin.capacity}</th>
                            <th>{resources.admin.status}</th>
                            <th>{resources.admin.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <tr key={room._id}>
                                    <td>{room._id}</td>
                                    <td>{room.name}</td>
                                    <td>{room.type === 'Delux' ? resources.admin.delux : resources.admin.standard}</td>
                                    <td>{room.rentperday}</td>
                                    <td>{room.maxcount}</td>
                                    <td>
                                        <span className={`badge ${room.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                            {room.status === 'active' ?  resources.admin.active : resources.admin.inactive}
                                        </span>
                                    </td>
                                    <td>
                                        {room.status === 'active' ? (
                                            <button className="btn btn-danger" onClick={() => deactivateRoom(room._id)}>
                                                Dezactivează
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary" onClick={() => activateRoom(room._id)}>
                                                Activează
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && <tr><td colSpan="7">{resources.admin.noRooms}</td></tr>
                        )}
                    </tbody>
                </table>
                {!loading && rooms.length ? (
                    <div>
                        <h1>{rooms.length} {resources.admin.totalRooms}</h1>
                    </div>
                ) : error ? (
                    <Error message= {resources.admin.couldntLoadRooms} />
                ) : null}
                <CheckAvailability /> {}
            </div>
        </div>
    );
}

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/users/getallusers");
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error( resources.admin.failedToFetchUsers, error);
                setError(error);
                setLoading(false);
            }
        };

        fetchData();

        return () => {};
    }, []);

    return (
        <div className="col-md-12">
            <h1>{resources.admin.users}</h1>
            {loading ? <Loader /> : error ? (
                <Error message= {resources.admin.couldntLoadUsers} />
            ) : users.length > 0 ? (
                <table className="table table-dark table-bordered">
                    <thead>
                        <tr>
                            <th>{resources.admin.userId}</th>
                            <th>{resources.admin.name}</th>
                            <th>{resources.admin.mail}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user._id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <h1>{resources.admin.noUsers}</h1>
            )}
        </div>
    );
}

function AddRoom() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [rentperday, setRentperday] = useState('');
    const [maxcount, setMaxcount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Delux');
    const [imageurl1, setImageurl1] = useState('');
    const [imageurl2, setImageurl2] = useState('');
    const [imageurl3, setImageurl3] = useState('');

    const [rentperdayError, setRentperdayError] = useState('');
    const [maxcountError, setMaxcountError] = useState('');

    const handleRentperdayChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setRentperday(value);
            setRentperdayError('');
        } else {
            setRentperdayError(resources.admin.rentPerDayError);
        }
    };

    const handleMaxcountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setMaxcount(value);
            setMaxcountError('');
        } else {
            setMaxcountError(resources.admin.maxcountError);
        }
    };

    async function addRoom() {
        if (!rentperday || !maxcount) {
            if (!rentperday) setRentperdayError(resources.admin.priceError);
            if (!maxcount) setMaxcountError(resources.admin.capacityError);
            return;
        }

        const newroom = {
            name,
            rentperday,
            maxcount,
            description,
            type,
            imageurls: [imageurl1, imageurl2, imageurl3]
        };

        try {
            setLoading(true);
            const result = (await axios.post('/api/rooms/addroom', newroom)).data;
            console.log(result);
            setLoading(false);
            Swal.fire(resources.admin.congrats, resources.admin.roomAdded, 'success').then(result => {
                window.location.href = '/home';
            });
        } catch (error) {
            console.log(error);
            setLoading(false);
            Swal.fire(resources.admin.oops, resources.admin.somethingWentWrong, 'error');
        }
    }

    return (
        <div className="row">
            <div className="col-md-5">
                {loading && <Loader />}
                <input type="text" className="form-control" placeholder= {resources.admin.roomName} value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" className="form-control" placeholder= {resources.admin.pricePerDay} value={rentperday} onChange={handleRentperdayChange} />
                {rentperdayError && <div className="text-danger">{rentperdayError}</div>}
                <input type="text" className="form-control" placeholder= {resources.admin.pricePerDay} value={maxcount} onChange={handleMaxcountChange} />
                {maxcountError && <div className="text-danger">{maxcountError}</div>}
                <textarea className="form-control textarea-control" placeholder= {resources.admin.description} value={description} onChange={(e) => setDescription(e.target.value)} rows="4"></textarea>
            </div>
            <div className="col-md-5">
                <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Delux">{resources.admin.delux}</option>
                    <option value="Non-Delux">{resources.admin.standard}</option>
                </select>
                <input type="text" className="form-control" placeholder= {resources.admin.urlImage} value={imageurl1} onChange={(e) => setImageurl1(e.target.value)} />
                <input type="text" className="form-control" placeholder= {resources.admin.urlImage} value={imageurl2} onChange={(e) => setImageurl2(e.target.value)} />
                <input type="text" className="form-control" placeholder= {resources.admin.urlImage} value={imageurl3} onChange={(e) => setImageurl3(e.target.value)} />
                <div>
                    <button className="btn btn-primary mt-2" onClick={addRoom}>Adaugă camera</button>
                </div>
            </div>
        </div>
    );
}

