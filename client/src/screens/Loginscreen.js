import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import Loader from '../components/Loader';
import Error from '../components/Error';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import resources from "../resources";

function Loginscreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.body.style.backgroundImage = "url('/login.png')";
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

    async function loginUser() {
        const user = { email, password };
        try {
            setLoading(true);
            const result = await axios.post('/api/users/login', user);
            console.log(resources.login.result, result.data);
            setLoading(false);
            localStorage.setItem('currentUser', JSON.stringify(result.data));
            window.location.href = '/home';
        } catch (error) {
            console.log(error);
            setLoading(false);
            setError(true);
        }
    }
    

    return (
        <div>
            {loading && <Loader />}
            <div className="row justify-content-center mt-5">
                <div className="col-md-5 mt-5">
                    {error && <Error message={resources.login.invalidData} />}
                    <div className="bs">
                        <h2>{resources.login.connect}</h2>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder={resources.admin.mail}
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                        <div className="password-container mt-3">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control password-input" 
                                placeholder={resources.login.password} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="text-center">
                            <button 
                                className="btn btn-primary mt-3" 
                                onClick={loginUser}
                            >
                                {resources.login.connect}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            {resources.login.noAccount} <Link to="/register">{resources.login.registerHere}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Loginscreen;
