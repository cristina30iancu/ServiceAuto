import React, { useEffect, useState, Component, Fragment, useRef } from "react";
import Table from "react-bootstrap/Table";
import { Form as BootstrapForm } from 'react-bootstrap';
import Pagination from "react-bootstrap/Pagination";
import { Formik, Field, Form, ErrorMessage } from 'formik';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from 'react-toastify';
import * as Yup from "yup";
import { useFormik } from "formik";
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import Invoice from '../components/reports/Invoice'
import invoice from '../data/invoice'


const validationSchema = Yup.object().shape({
    Date: Yup.date().required("Câmp obligatoriu")
        .test("is-tomorrow-or-older", "Programarea poate fi începând de mâine", (value) => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            console.log(tomorrow, value)
            return value >= tomorrow;
        }),
    Time: Yup.string()
        .matches(/^([01]\d|2[0-3]):00$/, "Ora trebuie să fie fixă").required("Câmp obligatoriu")
        .test("is-between-8-and-20", "Ora între 8:00 și 20:00",
            (value) => {
                const hour = parseInt(value.split(":")[0]);
                return hour >= 8 && hour < 20;
            }
        ),
    ServicesIDs: Yup.array().min(1, "Selectați măcar un serviciu")
        .of(Yup.string().required('Câmp obligatoriu'))
        .required('Câmp obligatoriu'),
    VehicleID: Yup.number().required('Câmp obligatoriu')
});

const validationPaymentSchema = Yup.object().shape({
    cardNumber: Yup.string()
        .required('Numărul cardului este obligatoriu')
        .matches(/^\d{12}$/, 'Numărul cardului trebuie să conțină 12 cifre'),
    cardName: Yup.string().required('Numele deținătorului cardului este obligatoriu'),
    expiryDate: Yup.string()
        .required('Data de expirare este obligatorie')
        .matches(/^(0[1-9]|1[0-2])\/(23|24|25|26|27|28|29|30|31|32|33|34|35)$/, 'Data de expirare trebuie să fie în formatul MM/AA și anul să fie între 23 și 35'),
    cvv: Yup.string()
        .required('CVV este obligatoriu')
        .matches(/^[0-9]{3,4}$/, 'CVV trebuie să conțină 3 sau 4 cifre'),
});
const initialValues = {
    Date: "",
    Time: "",
    VehicleID: "",
    ServicesIDs: []
};

const Appointments = () => {
    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: (values) => {
            postAppointment(values);
            setShowModal(false);
        },
        validationSchema: validationSchema
    });
    const [editingRowId, setEditingRowId] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;
    const [show, setShowModal] = useState(false);
    const [services, setServices] = useState([]);
    const [user, setUser] = useState({});
    const [cars, setCars] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [columns, setColumns] = useState([]);
    const [newStatus, setNewStatus] = useState('');
    const [inv, setInv] = useState(null)

    const filteredData = appointments.filter((row) => {
        return Object.keys(row)?.some((key) =>
        (row[key]?.toString().toLowerCase().includes(filterText.toLowerCase()) || (key == 'Vehicle' &&
            (row[key].Make.toString().toLowerCase().includes(filterText.toLowerCase()) || row[key].Model.toString().toLowerCase().includes(filterText.toLowerCase())))
            || (key == 'services' &&
                (row[key].some(service => service.Name.toString().toLowerCase().includes(filterText.toLowerCase())))))
        );
    });

    const [isAdmin, setIsAdmin] = useState(false);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredData.slice(startIndex, endIndex);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showFactura, setShowFactura] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);


    useEffect(() => {
        if (editingRowId) {
            fetch(`http://localhost:8080/appointments?AppointmentID=${editingRowId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data[0].services) {
                        const invoiceItems = data[0].services;
                        const inv2 = {
                            ...invoice, items: invoiceItems,
                            client: user,
                            trans_date: new Date().toISOString().trim().substring(0, 10)
                        };
                        setInv(inv2);
                    }
                })
                .catch((error) => {
                    toast.error("Error fetching appointment:", error);
                });
        }
    }, [showFactura, editingRowId]);


    const handleShowPaymentModal = () => {
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    const handleShowFactura = (id) => {
        setEditingRowId(id)
        setShowFactura(true);
    };

    const handleCloseFactura = () => {
        setShowFactura(false);
    };

    const fetchServices = async () => {
        const res = await fetch('http://localhost:8080/services');
        const data = await res.json();
        if (data.length == 0) toast.error(`Nu există servicii!`);
        else {
            setServices(data);
            fetchUser();
        }
    }

    const fetchCars = async (UserID) => {
        const res = await fetch('http://localhost:8080/vehicles?UserID=' + UserID);
        const data = await res.json();
        if (data.length == 0) {
            if (user.Role == 'customer') toast.error(`Nu aveți mașini!`);
        }

        else {
            setCars(data);
            initialValues.VehicleID = data[0].VehicleID
        }
    }

    const fetchAppointments = async (UserID, isAdmin) => {
        console.log(isAdmin)
        const res = isAdmin ? await fetch('http://localhost:8080/appointments') :
            await fetch('http://localhost:8080/appointments?UserID=' + UserID);
        const data = await res.json();
        if (data.length == 0) toast.error(`Nu aveți programări!`);
        else {
            setAppointments(data);
            let columns = Object.keys(data[0])
            columns.splice(columns.indexOf('AppointmentID'), 1);
            columns.splice(columns.indexOf('VehicleID'), 1);
            setColumns(columns);
        }
    }

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:8080/users/logged/' + token);
        const data = await res.json();
        if (!data.UserID) toast.error(`Autentificare expirată!`);
        else {
            setUser(data);
            if (data.Role == 'admin') setIsAdmin(true);
            fetchCars(data.UserID);
            fetchAppointments(data.UserID, data.Role == 'admin');
        }
    }

    const handleFilterChange = (event) => {
        setFilterText(event.target.value);
        setPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleShow = () => {
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const postAppointment = async (newAppointment) => {
        fetch("http://localhost:8080/appointments", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointment),
        })
            .then((res) => {
                if (res.status != 201) toast.error(`Adăugare programare eșuată! `)
                else { toast.success(`Programare adăugată cu succes!`); fetchAppointments(user.UserID, user.Role == 'admin'); }
                return res.json();
            })
            .then((data) => {
                if (data.msg) {
                    toast.error(data.msg)
                }
            })
            .catch((e) => toast.error(`Adaugare programare eșuată!`));
    }
    const editItem = async (id) => {
        fetch("http://localhost:8080/appointments/" + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Status: newStatus }),
        })
            .then((res) => {
                if (res.status != 204) toast.error(`Actualizare programare eșuată! `)
                else { toast.success(`Programare actualizată cu succes!`); fetchAppointments(user.UserID, user.Role == 'admin'); }
            })
            .catch((e) => toast.error(`Adăugare programare eșuată!`));
    }
    const makePayment = async (values) => {
        fetch("http://localhost:8080/appointments/" + editingRowId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Status: 'Plătită' }),
        })
            .then((res) => {
                if (res.status != 204) toast.error(`Actualizare programare eșuată! `)
                else { toast.success(`Programare actualizată cu succes!`); fetchAppointments(user.UserID, false); }
            })
            .catch((e) => toast.error(`Adăugare programare eșuată!`));

        fetch("http://localhost:8080/payments/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ AppointmentID: editingRowId, Amount: 9, Date: new Date(), Type: 'Credit' }),
        })
            .then((res) => {
                if (res.status != 200) toast.error(`Adăugare plată eșuată! `)
                else { toast.success(`Plată cu succes!`); fetchAppointments(user.UserID, false); }
            })
            .catch((e) => toast.error(`Adăugare plată eșuată!`));
    }
    const deleteItem = async (id) => {
        fetch("http://localhost:8080/appointments/" + id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => {
                if (res.status != 201) toast.error(`Ștergere programare eșuată! `)
                else { toast.success(`Programare ștearsă cu succes!`); fetchAppointments(user.UserID, user.Role == 'admin'); }
                return res.json();
            })
            .catch((e) => toast.error(`Ștergere programare eșuată! `));
    }
    const editStatus = async (event,id) => {
        let newStatus = event.target.value
        if (newStatus == 'Plătită') {
            const res = await fetch('http://localhost:8080/payments?AppointmentID=' + editingRowId);
            const data = await res.json();
            if (data.length == 0) toast.error(`Nu există plată!`);
            else {
                console.log(newStatus)
                setNewStatus(newStatus)
            }
        }
        else setNewStatus(newStatus)
    }
    return (
        <div style={{ width: "90vw", margin: "5vh 5vw 5vh 5vw ", fontSize: '16px' }}>
            <BootstrapForm.Group>
                <BootstrapForm.Control
                    type="text"
                    placeholder="Caută..."
                    value={filterText}
                    onChange={handleFilterChange}
                />
            </BootstrapForm.Group>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Dată</th>
                        <th>Oră</th>
                        <th>Status</th>
                        <th>Servicii</th>
                        <th>Vehicul</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((row) => (
                        <tr key={row.AppointmentID}>
                            {Object.keys(row).map((column) =>
                                column === "AppointmentID" || column === "VehicleID" ? null
                                    : editingRowId === row.AppointmentID && user.Role == 'admin' && column === "Status" ? (
                                        <select
                                            className="edit-input"
                                            onChange={e=>editStatus(e, row.AppointmentID)}
                                        >
                                            <option value="În așteptare">În așteptare</option>
                                            <option value="Plătită">Plătită</option>
                                            <option value="Acceptată">Acceptată</option>
                                            <option value="Anulată">Anulată</option>
                                        </select>
                                    ) : column === "Date" ? (
                                        <td key={column}>{row[column].substring(0, 10)}</td>
                                    ) : column === "services" && row[column].length > 0 ? (
                                        <td key={column}>
                                            {row[column].map((s, i) => s.Name).join(", ")}
                                        </td>
                                    ) : column === "Vehicle" ? (
                                        <td key={column}>
                                            {row[column]?.Make} {row[column]?.Model}
                                        </td>
                                    ) : (
                                        <td key={column}>{row[column]}</td>
                                    )
                            )}
                            {
                                !isAdmin && row.Status != 'Plătită' ? (<> <td>
                                    <button
                                        style={{ fontSize: "16px" }}
                                        className="btn btn-success p-1"
                                        onClick={() => { setEditingRowId(row.AppointmentID); handleShowPaymentModal() }}
                                    >
                                        Plătește
                                    </button>
                                </td> </>) : ''
                            }
                            {
                                !isAdmin && row.Status == 'Plătită' ? (<> <td>
                                    <button
                                        style={{ fontSize: "16px" }}
                                        className="btn btn-success p-1"
                                        onClick={() => { handleShowFactura(row.AppointmentID) }}
                                    >
                                        Vezi factură
                                    </button>
                                </td> </>) : ''
                            }
                            {
                                isAdmin ? (<> <td>
                                    {editingRowId === row.AppointmentID ? (
                                        <button style={{ fontSize: '16px' }}
                                            className="btn btn-success p-1"
                                            onClick={() => { setEditingRowId(null); editItem(row.AppointmentID) }}
                                        >
                                            Salvează
                                        </button>
                                    ) : (
                                        <button style={{ fontSize: '16px' }}
                                            className="btn btn-warning p-1"
                                            onClick={() => setEditingRowId(row.AppointmentID)}
                                        >
                                            Editează
                                        </button>
                                    )}
                                </td>

                                    <td>
                                        <button style={{ fontSize: '16px' }} onClick={() => deleteItem(row.AppointmentID)} className="btn btn-danger p-1">Șterge</button>
                                    </td></>) : ''
                            }
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                        key={i}
                        active={i + 1 === page}
                        onClick={() => handlePageChange(i + 1)}
                    >
                        {i + 1}
                    </Pagination.Item>
                ))}
            </Pagination>

           {!isAdmin&& <Button variant="primary" onClick={handleShow}>
                Adaugă
            </Button>}

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Adaugă</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="Date">Dată</label>
                            <input
                                className="form-control"
                                type="date"
                                name="Date"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                placeholder="Adaugă dată" value={formik.values.Date}
                            />
                            {formik.touched.Date && formik.errors.Date && (
                                <div className="text-danger">{formik.errors.Date}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="Time">Oră</label>
                            <input
                                className="form-control"
                                type="time"
                                name="Time" onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                placeholder="Adaugă oră" value={formik.values.Time}
                            />
                            {formik.touched.Time && formik.errors.Time && (
                                <div className="text-danger">{formik.errors.Time}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="VehicleID">Vehicul</label>
                            <select name="VehicleID" className="form-control"
                                onChange={(event) => {
                                    formik.setFieldValue("VehicleID", event.target.value);
                                }}
                                onBlur={formik.handleBlur}
                                value={formik.values.VehicleID || (cars.length > 0 ? cars[0].VehicleID : "")}>
                                {cars.map((row) => (
                                    <option key={row.VehicleID} value={row.VehicleID}>{row.Make} - {row.Model}</option>
                                ))}
                            </select> {formik.errors.VehicleID && (
                                <div className="text-danger">{formik.errors.VehicleID}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="ServicesIDs">Alege serviciu</label>
                            <select name="ServicesIDs" className="form-control" multiple
                                onChange={(event) => {
                                    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
                                    formik.setFieldValue("ServicesIDs", selectedOptions);
                                }} onBlur={formik.handleBlur}
                                value={formik.values.ServicesIDs}>
                                {services.map((row) => (
                                    <option key={row.ServiceID} value={row.ServiceID}>{row.Name}</option>
                                ))}
                            </select> {formik.touched.ServicesIDs && formik.errors.ServicesIDs && (
                                <div className="text-danger">{formik.errors.ServicesIDs}</div>
                            )}
                        </div>
                        <Button type="submit">
                            Adaugă
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>
            <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalii de plată</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={{
                            discountCode: '',
                            cardNumber: '',
                            cardName: '',
                            expiryDate: '',
                            cvv: '',
                        }}
                        validationSchema={validationPaymentSchema}
                        onSubmit={makePayment}
                    >
                        <Form>
                            <BootstrapForm.Group controlId="cardNumber">
                                <BootstrapForm.Label>Număr card</BootstrapForm.Label>
                                <Field
                                    type="text"
                                    name="cardNumber"
                                    placeholder="Introduceți numărul cardului"
                                    className="form-control"
                                />
                                <ErrorMessage name="cardNumber" component="div" className="text-danger" />
                            </BootstrapForm.Group>

                            <BootstrapForm.Group controlId="cardName">
                                <BootstrapForm.Label>Nume deținător card</BootstrapForm.Label>
                                <Field
                                    type="text"
                                    name="cardName"
                                    placeholder="Introduceți numele deținătorului cardului"
                                    className="form-control"
                                />
                                <ErrorMessage name="cardName" component="div" className="text-danger" />
                            </BootstrapForm.Group>

                            <BootstrapForm.Group controlId="expiryDate">
                                <BootstrapForm.Label>Data expirării</BootstrapForm.Label>
                                <Field
                                    type="text"
                                    name="expiryDate"
                                    placeholder="LL/AA"
                                    className="form-control"
                                />
                                <ErrorMessage name="expiryDate" component="div" className="text-danger" />
                            </BootstrapForm.Group>

                            <BootstrapForm.Group controlId="cvv">
                                <BootstrapForm.Label>CVV</BootstrapForm.Label>
                                <Field
                                    type="text"
                                    name="cvv"
                                    placeholder="Introduceți CVV-ul"
                                    className="form-control"
                                />
                                <ErrorMessage name="cvv" component="div" className="text-danger" />
                            </BootstrapForm.Group>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="secondary" className="m-3" onClick={handleClosePaymentModal}>
                                    Închide
                                </Button>
                                <Button variant="primary" className="m-3" type="submit">
                                    Plătește
                                </Button>
                            </div>

                        </Form>
                    </Formik>
                </Modal.Body>
            </Modal>
            {inv && showFactura && user.Role == 'customer' &&
                <div className="container" >
                    <PDFViewer width="1000" height="600" className="app" >
                        <Invoice invoice={inv} />
                    </PDFViewer>
                    <br></br>
                    <PDFDownloadLink style={{ marginTop: '10px', fontSize: '24px', backgroundColor: 'black', color: 'white', textDecoration: 'none', fontWeight: 'bold' }} document={<Invoice invoice={inv} />} fileName="factura.pdf">
                        {({ blob, url, loading, error }) =>
                            loading ? 'Încărcare document...' : 'Descarcă PDF'
                        }
                    </PDFDownloadLink>
                </div>}

        </div>
    );

};

export default Appointments;