import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { Form as BootstrapForm } from 'react-bootstrap';
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from 'react-toastify';
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    Make: Yup.string().required("Dați marca"),
    Model: Yup.string().required("Dați modelul"),
    Year: Yup.number().required("Dați anul").test("is-between-1970-and-2023",
        "Anul trebuie să fie între 1970 și 2023", (value) => value >= 1970 && value <= 2023),
    Fuel: Yup.string().required("Dați tipul de combustibil").oneOf(['Diesel', 'Benzină', 'Biodiesel', 'Ethanol', 'Hybrid', 'Electric'], "Combustibil invalid"),
});

const initialValues = {
    Make: "",
    Model: "",
    Year: "",
    Fuel: ""
};

const Cars = () => {
    const [filterText, setFilterText] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [show, setShowModal] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [user, setUser] = useState({});
    const [editingRowId, setEditingRowId] = useState(null);
    const [editingObj, setEditingObj] = useState({});

    const filteredData = data?.filter((row) => {
        return Object.keys(row).some((key) =>
            row[key]?.toString().toLowerCase().includes(filterText.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredData.slice(startIndex, endIndex);

    useEffect(() => {
        fetchUser();
    }, []);

    const editItem = async (id) => {
        console.log(id, editingObj)
        fetch("http://localhost:8080/vehicles/" + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingObj),
        })
            .then((res) => {
                if (res.status != 204) toast.error(`Vehicul neactualizat! `)
                else { toast.success(`Vehicul actualizat cu succes!`);
                if(user.Role == 'admin') fetchCars();
                else fetchCars(user.UserID)
            }
            })
            .catch((e) => toast.error(`Vehicul neactualizat!`));
    }
    const deleteItem = async (id) => {
        fetch("http://localhost:8080/vehicles/" + id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => {
                if (res.status != 201) toast.error(`Ștergere vehicul eșuată! `)
                else { toast.success(`Vehicul șters cu succes!`); fetchCars(); }
                return res.json();
            })
            .catch((e) => toast.error(`Ștergere vehicul eșuată! `));
    }
    const fetchCars = async (UserID) => {
        let url = ''
        if (UserID) {
            url = 'http://localhost:8080/vehicles?UserID=' + UserID
        } else url = 'http://localhost:8080/vehicles'
        const res = await fetch(url);
        const data = await res.json();
        if (data.length == 0) toast.error(`Nu sunt mașini!`);
        else {
            setData(data);
            setColumns(Object.keys(data[0]).slice(1, -1))
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
            if (data.Role == 'admin') fetchCars()
            else fetchCars(data.UserID);
        }
    }

    const postCar = async (newCar) => {
        fetch("http://localhost:8080/vehicles", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCar),
        })
            .then((res) => {
                if (res.status != 201) toast.error(`Adaugare vehicul eșuată!`)
                else { toast.success(`Vehicul ${newCar.Model} adăugat cu succes!`); fetchCars(user.UserID); }
            })
            .catch((e) => toast.error(`Adăugare vehicul eșuată!`));
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

    const handleSubmit = (values) => {
        const newItemWithId = { UserID: user.UserID, ...values };
        postCar(newItemWithId)
        setShowModal(false);
    };
    const handleInputChange = (event) => {
        const obj = { ...editingObj }
        obj.id = editingRowId;
        obj[event.target.name] = event.target.value;
        setEditingObj(obj);
        console.log(obj, editingObj)
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
                        <th>Marcă</th>
                        <th>Model</th>
                        <th>An</th>
                        <th>Combustibil</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((row) => (
                        <tr key={row.VehicleID}>
                            {columns.map((column) => (
                                editingRowId === row.VehicleID ? (column == 'Make' || column == 'Model' ?
                                    (<td key={editingRowId + column}> <input defaultValue={row[column]} name={column}
                                        onChange={handleInputChange} type='text'></input>
                                    </td>) : column == 'Year' ? (<td key={editingRowId + column}> <input name={column}
                                        onChange={handleInputChange} type='number' defaultValue={row[column]}></input>
                                    </td>) : <td key={editingRowId + column}>
                                        <select
                                            className="edit-input" name={column}
                                            defaultValue={row[column]}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Diesel">Diesel</option>
                                            <option value="Benzină">Benzină</option>
                                            <option value="Biodiesel">Biodiesel</option>
                                            <option value="Ethanol">Ethanol</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="Electric">Electric</option>
                                        </select>
                                    </td>
                                ) :
                                    (<td key={column}>{row[column]}</td>)
                            ))}
                            <td>
                                {editingRowId === row.VehicleID ? (
                                    <button style={{ fontSize: '16px' }}
                                        className="btn btn-success p-1"
                                        onClick={() => { editItem(editingRowId); setEditingRowId(null); setEditingObj({}) }}
                                    >
                                        Salvează
                                    </button>
                                ) : (
                                    <button style={{ fontSize: '16px' }}
                                        className="btn btn-warning p-1"
                                        onClick={() => setEditingRowId(row.VehicleID)}
                                    >
                                        Editează
                                    </button>
                                )}
                            </td>
                            <td>
                                <button style={{ fontSize: '16px' }} onClick={() => deleteItem(row.VehicleID)} className="btn btn-danger p-1">Șterge</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Pagination>
                {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                        variant="light"
                        key={i}
                        active={i + 1 === page}
                        onClick={() => handlePageChange(i + 1)}
                    >
                        {i + 1}
                    </Pagination.Item>
                ))}
            </Pagination>

            {user.Role == 'customer' && <Button variant="light" className="shadow-lg" onClick={handleShow}>
                Adaugă
            </Button>}

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Adaugă</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="form-group">
                                    <label htmlFor="Make">Marcă</label>
                                    <Field
                                        className="form-control"
                                        type="text"
                                        name="Make"
                                        placeholder="Adaugă marcă"
                                    />
                                    <ErrorMessage name="Make" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Model">Model</label>
                                    <Field
                                        className="form-control"
                                        type="text"
                                        name="Model"
                                        placeholder="Adaugă model"
                                    />
                                    <ErrorMessage name="Model" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Year">An</label>
                                    <Field
                                        className="form-control"
                                        type="number"
                                        name="Year"
                                        placeholder="Adaugă an"
                                    />
                                    <ErrorMessage name="Year" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Fuel">Combustibil</label>
                                    <Field as="select" name="Fuel" className="form-control">
                                        <option value="">-- Selectează --</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Benzină">Benzină</option>
                                        <option value="Biodiesel">Biodiesel</option>
                                        <option value="Ethanol">Ethanol</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Electric">Electric</option>
                                    </Field>
                                    <ErrorMessage name="Fuel" component="div" className="text-danger" />
                                </div>
                                <Button type="submit" className="btn" variant="light" disabled={isSubmitting}>
                                    Adaugă
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </div>
    );

};

export default Cars;