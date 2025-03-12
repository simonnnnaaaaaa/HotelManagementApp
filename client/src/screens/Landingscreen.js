import React from "react";
import { Link } from "react-router-dom";
import './Landingscreen.css'; 
import resources from "../resources";

function Landingscreen() {
    return (
        <div className="row landing justify-content-center">
            <div className="col-md-8 my-auto text-center">
                <h2 style={{color: 'white', fontSize:'130px'}}>{resources.landing.SereneStay}</h2>
                <h1 style={{color: 'white'}}>{resources.landing.subtitle}</h1>

                <Link to='/home'>
                    <button className="btn landingbtn" style={{color:'black', backgroundColor:'white'}}>{resources.landing.saIncepem}</button>
                </Link>

            </div>
        </div>
    )
}

export default Landingscreen;
