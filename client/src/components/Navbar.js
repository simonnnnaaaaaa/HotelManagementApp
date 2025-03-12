import React from 'react'
import resources from "../resources";

function Navbar() {
    const user = JSON.parse(localStorage.getItem('currentUser'))

    function logout() {
        localStorage.removeItem('currentUser')
        window.location.href = '/login'
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg">
                <a className="navbar-brand ml-5" href="/home">{resources.landing.SereneStay}</a>

                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" ><i className="fa-solid fa-bars" style={{ color: 'white' }}></i></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mr-5">
                        {user ? (<><div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false">
                                <i className="fa fa-user mr-1"></i>{user.name}
                            </button>
                            <div className="dropdown-menu">
                                <a className="dropdown-item" href="/profile">
                                    {resources.profile.myProfile}
                                </a>
                                <a className="dropdown-item" href="#" onClick={logout}>Deconectare</a>
                            </div>
                        </div></>) : (<>

                            <li className="nav-item active">
                                <a className="nav-link" href="/register">
                                    {resources.login.signUp}
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/login">
                                    {resources.login.logIn}
                                </a>
                            </li>

                        </>)}

                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default Navbar