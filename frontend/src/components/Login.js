import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import 'react-toastify/dist/ReactToastify.css';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from 'yup';

const Login = () => {
    const navigate = useNavigate();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
 const validationSchema = Yup.object({
    Email: Yup.string().email('Adresa de email este invalidă').required('Câmpul este obligatoriu'),
    Password: Yup.string().required('Câmpul este obligatoriu')
  });

  const initialValues = {
    Email: '',
    Password: ''
  }
    useEffect(() => {
        if (isLoggedIn) navigate('/home')
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = jwt_decode(token);
                console.log(data)
                setIsLoggedIn(true);
                
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const LoginHandler = (values) => {
        // if (e) {
        //     e.preventDefault();
        //     onLogin(emailRef.current.value, passwordRef.current.value);
        //     if (localStorage.getItem('token')) navigate('/home')
        // }
        onLogin(values.Email,values.Password)

    };

    const onLogin = async (enteredEmail, enteredPassword) => {
        const res = await fetch('http://localhost:8080/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Username: enteredEmail,
                Password: enteredPassword,
            }),
        });
        const data = await res.json()
        if (res.ok) {
            toast.success('Succes');
            if (data.message && data.token) {
                console.log(data)
                setIsLoggedIn(true)
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role)
                navigate("/home")
            }
        } else toast.error("Invalid!")
        
    };

    return (
        <div className="gradient-form">

            <Row className='login-form'>

                <Col col='6' className="login-col shadow-lg mb-5">
                    <div className="d-flex flex-column">

                        <div className="text-center">
                            <img src="https://mrauto360.com/images/navbar-image1.png"
                                style={{ width: '85px', height: '85px' }} alt="logo" />
                            <h4 className="mt-1 mb-5 pb-1">Bun venit la MyAuto</h4>
                            <p>Intră în contul tău</p>
                        </div>

                        {/* <input className='mb-2 form-control' ref={emailRef} label='Email address' id='form1' type='email' />
                        <input className='mb-2 form-control' ref={passwordRef} label='Password' id='form2' type='password' />


                        <div className="text-center pt-1 mb-5 pb-1">
                            <button onClick={(e) => LoginHandler(e)} className="gradient-custom m-3" style={{ width: '25%' }}>Intră</button>
                        </div> */}
  <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={LoginHandler}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="form-group">
                                    <label htmlFor="Email">Email</label>
                                    <Field
                                        className="form-control"
                                        type="email"
                                        name="Email"
                                        placeholder="Adaugă email"
                                    />
                                    <ErrorMessage name="Email" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Password">Parolă</label>
                                    <Field
                                        className="form-control"
                                        type="password"
                                        name="Password"
                                        placeholder="Adaugă parolă"
                                    />
                                    <ErrorMessage name="Password" component="div" className="text-danger" />
                                </div>
                                <Button type="submit" className="btn" variant="light" >
                                    Intră
                                </Button>
                            </Form>
                        )}
                    </Formik>
                        <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
                            <p className="mb-0">Nu ai cont?</p>
                            <button outline className='mx-2 text-light' onClick={() => navigate('/signup')}>
                                Înregistrează-te
                            </button>
                        </div>

                    </div>

                </Col>

                <Col col='6' className="mb-5 login-text" >
                    <div style={{ borderRadius: '1.5%' }} className="d-flex flex-column  justify-content-center gradient-custom h-100 mb-4">

                        <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                            <h4 className="mb-4">Totul dintr-o aplicație</h4>
                            <p className="small mb-0">Bun venit în aplicația de gestionare a serviciilor auto
                                pentru mașinile personale. Simplu, eficient și intuitiv - această platformă îți oferă controlul
                                complet asupra întregului proces de întreținere a vehiculului tău. Gestionarea programărilor,
                                serviciilor și vehiculelor nu a fost niciodată mai ușoară.
                                Intră acum și descoperă o experiență de administrare auto revoluționară
                            </p>
                        </div>

                    </div>

                </Col>

            </Row>

        </div>
    );
}

export default Login
