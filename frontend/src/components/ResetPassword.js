import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const oldPasswordRef = useRef();
    const passwordRef = useRef();
    const passwordConfRef = useRef();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:8080/users/logged/' + token);
        const data = await res.json();
        if (!data.UserID) toast.error(`Autentificare expirată!`);
        else {
            setUser(data);
        }
    }

    useEffect(() => {
        fetchUser()
    },[]);

    const resetHandler = (e) => {
        if (e) {
            e.preventDefault();
            if(passwordRef.current.value?.length < 4 ||  passwordConfRef.current.value?.length < 4){
                toast.error("Introduceți parolă de minim 4 caractere!")
                return
            }
            if(!passwordRef.current.value == passwordConfRef.current.value){
                toast.error("Parolele nu coincid!")
                return
            }
            onReset()
        }

    };

    const onReset = () => {
        fetch('http://localhost:8080/users/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Username: user.Username,
                Password: passwordRef.current.value,
                oldPassword: oldPasswordRef.current.value
            }),
        })
            .then((response) => {
                if (response.ok) {
                    toast.success('Actualizare parolă reușită!');
                }  return response.json();
            })
            .then((data) => {
                if(data.error) toast.error(data.error)
                if (data.message && data.token) {
                    setIsLoggedIn(true)
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.user.Role)
                }
            })
            .catch((e) => toast.error("Actualizare eșuată!"))
    };

    return (
        <div className="gradient-form">
            <Row className='login-form'>
                <Col col='6' className="login-col shadow-lg mb-5">
                    <div className="d-flex flex-column">
                        <div className="text-center">
                            <img src="https://mrauto360.com/images/navbar-image1.png"
                                style={{ width: '85px', height: '85px' }} alt="logo" />
                            <p>Resetare parolă</p>
                        </div>
                        <input className='mb-2 form-control' placeholder='Parolă veche' ref={oldPasswordRef} id='form1' type='password' />
                        <input className='mb-2 form-control' placeholder='Parolă nouă' ref={passwordRef} id='form2' type='password' />
                        <input className='mb-2 form-control' placeholder='Confirmă parolă' ref={passwordConfRef} id='form3' type='password' />
                        <div className="text-center pt-1 mb-5 pb-1">
                            <button onClick={(e) => resetHandler(e)} className="gradient-custom m-3" style={{ width: '25%' }}>Schimbă</button>
                        </div>
                    </div>
                </Col>
                <Col col='6' className="mb-5 login-text" >
                    <div style={{ borderRadius: '1.5%' }} className="d-flex flex-column  justify-content-center gradient-custom h-100 mb-4">
                        <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                            <h4 class="mb-4">Resetare parolă</h4>
                            <p class="small mb-0">În caz că ți-ai uitat vechea ta parolă, o poți actualiza rapid chiar de aici.
                            Asigură-te că ai acces la e-mail-ul cu care ai înregistrat contul în aplicație.
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default ResetPassword
