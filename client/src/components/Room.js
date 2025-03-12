import React from "react";
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Carousel from 'react-bootstrap/Carousel';
import { Link } from 'react-router-dom';
import './Room.css'; 
import resources from "../resources";

function Room({ room, fromdate, todate }) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div className="row bs" style={{ backgroundColor: '#FFF' }}>
            <div className="col-md-4">
                <img src={room.imageurls[0]} className="smallimg" alt="Room" />
            </div>
            <div className="col-md-7">
                <h1>{room.name}</h1>
                <b>
                    <p>{resources.admin.capacity} : {room.maxcount}</p>
                    <p>{resources.admin.pricePerDay}: {room.rentperday}</p>
                    <p>{resources.admin.type}: {room.type === 'Delux' ? resources.admin.delux : resources.admin.standard}</p>


                </b>
                <div style={{ float: 'right' }}>
                    {(fromdate && todate) && (
                        <Link to={`/book/${room._id}/${fromdate}/${todate}`}>
                            <button className="btn btn-primary mr-2">{resources.rooms.book}</button>
                        </Link>
                    )}
                    <button className="btn btn-primary" onClick={handleShow}>{resources.rooms.details}</button>
                </div>
            </div>
            <Modal show={show} onHide={handleClose} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>{room.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Carousel>
                        {room.imageurls.map((url, index) => {
                            return (
                                <Carousel.Item key={index}>
                                    <img className="d-block w-100 bigimg" src={url} alt={`Room image ${index + 1}`} />
                                </Carousel.Item>
                            );
                        })}
                    </Carousel>
                    <div className="room-description">
                        {room.description}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        {resources.rooms.close}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Room;
