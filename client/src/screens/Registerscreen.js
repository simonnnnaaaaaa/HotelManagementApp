import React, { useState , useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Error from '../components/Error';
import Succes from '../components/Succes';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import resources from "../resources";

function Registerscreen() {

    useEffect(() => {
        document.body.style.backgroundImage = "url('/signup.png')";
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

    const [name, setname] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [cpassword, setcpassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSucces] = useState(null);

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowCPassword = () => {
        setShowCPassword(!showCPassword);
    };

    async function register() {
        if (name === '') {
            setError(resources.login.emptyName);
            return;
        }

        if (!validateEmail(email)) {
            setError(resources.login.invalidMail);
            return;
        }

        if (password.length < 6) {
            setError(resources.login.shortPassword);
            return;
        }

        try {
            const emailCheckResponse = await axios.post('/api/users/checkemail', { email });
            if (emailCheckResponse.data.exists) {
                setError(resources.login.usedMail);
                return;
            }
        } catch (error) {
            console.error(resources.login.mailVerificationError, error);
            setError(resources.login.mailError);
            return;
        }

        if (password === cpassword) {
            const user = {
                name,
                email,
                password,
                cpassword
            };

            try {
                setLoading(true);
                const result = (await axios.post('/api/users/register', user)).data;
                setLoading(false);
                setSucces(true);

                setname('');
                setemail('');
                setpassword('');
                setcpassword('');
            } catch (error) {
                console.log(error);
                setLoading(false);
                setError(resources.login.signUpError);
            }
        } else {
            setError(resources.login.passwordsNotMatching);
        }
    }

    return (
        <div>
            {loading && <Loader />}
            {error && <Error message={error} />}
            <div className='row justify-content-center mt-5'>
                <div className='col-md-5 mt-5'>
                    {success && <Succes message={resources.login.signUpSuccessfully} />}
                    <div className='bs'>
                        <h2>{resources.login.signUp}</h2>
                        <input
                            type="text"
                            className='form-control'
                            placeholder={resources.admin.name}
                            value={name}
                            onChange={(e) => setname(e.target.value)}
                        />
                        <input
                            type="text"
                            className='form-control'
                            placeholder={resources.admin.mail}
                            value={email}
                            onChange={(e) => setemail(e.target.value)}
                        />
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className='form-control'
                                placeholder={resources.login.password}
                                value={password}
                                onChange={(e) => setpassword(e.target.value)}
                            />
                            <span className="password-toggle-icon" onClick={toggleShowPassword}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="password-input-container">
                            <input
                                type={showCPassword ? "text" : "password"}
                                className='form-control'
                                placeholder={resources.login.confirmPassword}
                                value={cpassword}
                                onChange={(e) => setcpassword(e.target.value)}
                            />
                            <span className="password-toggle-icon" onClick={toggleShowCPassword}>
                                {showCPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        <div className="text-center">
                            <button className='btn btn-primary mt-3' onClick={register}>Înregistrare</button>
                        </div>
                        <div className="text-center mt-2">
                           {resources.login.haveAccount} <Link to="/login">{resources.login.connectHere}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Registerscreen;
