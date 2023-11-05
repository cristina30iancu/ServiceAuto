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
    Name: Yup.string().required("Dați numele"),
    Price: Yup.number().required("Dați prețul").
        test("test-price", "Prețul trebuie să fie între 50 și 10.000 RON",
            (value) => value >= 50 && value <= 10000),
});

const initialValues = {
    Name: "",
    Price: ""
};

const Services = () => {
    const [filterText, setFilterText] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const [show, setShowModal] = useState(false);
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [user, setUser] = useState({});
    const [editingRowId, setEditingRowId] = useState(null);
    const [editingObj, setEditingObj] = useState({});

    const filteredData = data.filter((row) => {
        return Object.keys(row).some((key) =>
            row[key].toString().toLowerCase().includes(filterText.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredData.slice(startIndex, endIndex);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchServices = async () => {
        const res = await fetch('http://localhost:8080/services');
        const data = await res.json();
        if (data.length == 0) toast.error(`Nu există servicii!`);
        else {
            setData(data);
            setColumns(Object.keys(data[0]).slice(1))
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
            fetchServices(data.UserID);
        }
    }

    const editItem = async (id) => {
        console.log(id, editingObj)
        fetch("http://localhost:8080/services/" + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingObj),
        })
            .then((res) => {
                if (res.status != 204) toast.error(`Serviciu neactualizat! `)
                else { toast.success(`Serviciu actualizat cu succes!`); fetchServices(); }
            })
            .catch((e) => toast.error(`Serviciu neactualizat!`));
    }
    const deleteItem = async (id) => {
        fetch("http://localhost:8080/services/" + id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
            .then((res) => {
                if (res.status != 201) toast.error(`Ștergere serviciu eșuată! `)
                else { toast.success(`Serviciu șters cu succes!`); fetchServices(); }
                return res.json();
            })
            .catch((e) => toast.error(`Ștergere serviciu eșuată! `));
    }
    const handleInputChange = (event) => {
        const obj = { ...editingObj }
        obj.id = editingRowId;
        obj[event.target.name] = event.target.value;
        setEditingObj(obj);
        console.log(obj, editingObj)
    }
    const postService = async (newCar) => {
        fetch("http://localhost:8080/services", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCar),
        })
            .then((res) => {
                if (res.status != 201) toast.error(`Adăugare serviciu eșuată!`)
                else { toast.success(`Serviciu ${newCar.Name} adăugat cu succes!`); fetchServices(); }
            })
            .catch((e) => toast.error(`Adăugare serviciu eșuată!`));
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
        postService(newItemWithId)
        setShowModal(false);
    };

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
                        <th>Nume</th>
                        <th>Preț</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((row) => (
                        <tr key={row.ServiceID}>
                            {columns.map((column) => (
                                editingRowId === row.ServiceID ? (column == 'Name' ? <td key={editingRowId + column}>
                                    <input defaultValue={row[column]} name={column}
                                        onChange={handleInputChange} type='text'></input>
                                </td> : <td key={editingRowId + column}> <input defaultValue={row[column]} name={column}
                                    onChange={handleInputChange} type='number'></input>
                                </td>) : (<td key={column}>{row[column]}</td>)
                            ))}
                            <td>
                                {editingRowId === row.ServiceID ? (
                                    <button style={{ fontSize: '16px' }}
                                        className="btn btn-success p-1"
                                        onClick={() => {
                                            editItem(editingRowId);
                                            setEditingRowId(null); setEditingObj({})
                                        }}
                                    >
                                        Salvează
                                    </button>
                                ) : (
                                    <button style={{ fontSize: '16px' }}
                                        className="btn btn-warning p-1"
                                        onClick={() => setEditingRowId(row.ServiceID)}
                                    >
                                        Editează
                                    </button>
                                )}
                            </td>
                            <td>
                                <button style={{ fontSize: '16px' }} onClick={() => deleteItem(row.ServiceID)}
                                    className="btn btn-danger p-1">Șterge</button>
                            </td>
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

            <Button variant="primary" onClick={handleShow}>
                Adaugă
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Adaugăre serviciu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Formik initialValues={initialValues}
                        validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="form-group">
                                    <label htmlFor="Name">Nume</label>
                                    <Field className="form-control" type="text" name="Name" placeholder="Adauga nume" />
                                    <ErrorMessage name="Name" component="div" className="text-danger" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="Price">Preț</label>
                                    <Field className="form-control" type="number" name="Price" placeholder="Adaugă preț" />
                                    <ErrorMessage name="Price" component="div" className="text-danger" />
                                </div>
                                <Button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    Adăugare </Button>
                            </Form>)}
                    </Formik>
                </Modal.Body>
            </Modal>
        </div>
    );

};

export default Services;