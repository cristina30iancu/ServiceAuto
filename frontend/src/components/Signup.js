import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Container, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import { Formik, Form, Field, ErrorMessage } from "formik";

const Signup = () => {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const fnameRef = useRef();
  const lnameRef = useRef();

  useEffect(() => {}, []);

  const validationSchema = Yup.object({
    Email: Yup.string().email('Adresa de email este invalidă').required('Câmpul este obligatoriu'),
    Password: Yup.string().required('Câmpul este obligatoriu'),
    Firstname: Yup.string().required('Câmpul este obligatoriu'),
    Lastname: Yup.string().required('Câmpul este obligatoriu'),
  });

  const initialValues = {
    Email: '',
    Password: '',
    Firstname: '',
    Lastname: '',
  }

  const onSignIn = (values) => {
    fetch('http://localhost:8080/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: values.Email,
        Username: values.Email,
        Password: values.Password,
        Firstname: values.Firstname,
        Lastname: values.Lastname,
      }),
    })
      .then((response) => {
        if (response.ok) {
          toast.success('Utilizator înregistrat', {
            position: 'top-right',
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          throw new Error();
        }
      })
      .catch((e) =>
        toast.error('Date incorecte', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      );
  };

  const SignHandler = (values) => {
    console.log(values)
      onSignIn(values);
    
};

return (
    <div className="gradient-form">

    <Row className='login-form'>

        <Col col='6' className="login-col shadow-lg mb-5">
            <div className="d-flex flex-column">

                <div className="text-center">
                    <img  src="https://mrauto360.com/images/navbar-image1.png"
                        style={{ width: '85px', height:'85px' }} alt="logo" />
                    <h4 className="mt-1 mb-4 pb-1">Bun venit la MyAuto</h4>
                    <p >Înregistează-te</p>
                </div>          
                  <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={SignHandler}
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
                                <div className="form-group">
                                    <label htmlFor="Firstname">Prenume</label>
                                    <Field
                                        className="form-control"
                                        type="text"
                                        name="Firstname"
                                        placeholder="Adaugă prenume"
                                    />
                                    <ErrorMessage name="Firstname" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Lastname">Nume</label>
                                    <Field
                                        className="form-control"
                                        type="text"
                                        name="Lastname"
                                        placeholder="Adaugă nume"
                                    />
                                    <ErrorMessage name="Lastname" component="div" className="text-danger" />
                                </div>
                                <Button type="submit" className="btn" variant="light" >
                                    Înregistrare
                                </Button>
                            </Form>
                        )}
                    </Formik>
                <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
                    <p className="mb-0">Ai deja un cont?</p>
                    <button outline className='mx-2 text-light' onClick={()=>navigate('/login')}>
                        Autentifică-te
                    </button>
                </div>

            </div>

        </Col>

        <Col col='6' className="mb-5 login-text" >
            <div style={{borderRadius:'1.5%'}} className="d-flex flex-column  justify-content-center gradient-custom h-100 mb-4">

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

export default Signup;
