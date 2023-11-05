import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import Modal from "react-bootstrap/Modal";

function Profile() {
    const [user, setUser] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        fetchUser();
    }, []);

    const handleDeleteConfirmation = (confirmation) => {
        setShowDeleteModal(false);
        if (confirmation) {
            deactivateAccount()
        }
    }
    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:8080/users/logged/' + token);
        const data = await res.json();
        if (!data.UserID) toast.error(`Autentificare expirata!`);
        else {
            setUser(data);
        }
    }
    
      const deactivateAccount = async () => {
        fetch('http://localhost:8080/users/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Username: user.Username
            }),
        })
            .then((response) => {
                if (response.ok) {
                    toast.success('Cont dezactivat!');
                } return response.json();
            })
            .then((data) => {
                if (data.error) toast.error(data.error)
                else {
                    localStorage.removeItem("token")
                    localStorage.removeItem("role")
                    navigate("/login")
                }
            })
            .catch((e) => toast.error("Eroare! " + e))
    }


    return (
        <div>
            <div className="container mt-5" style={{ width: '30vw' }}>
                <div className="row justify-content-center" >
                    <div className="col card shadow-lg" >
                        <div className="card-body">
                            <div className="d-flex flex-column align-items-center text-center">
                                <img src={'person.svg'} alt="Admin" className="rounded-circle" width="150" />
                                <div col="mt-r">
                                    <h4>{user?.Username}</h4>
                                    <p className="text-dark mb-2">{user?.Email}</p>
                                    <p className="text-dark mb-2">{user?.Lastname} {user?.Firstname}</p>
                                    <p className="text-dark mb-2">Rol: {user?.Role}</p>
                                    <Button className="btn mt-3"
                                        onClick={() => navigate("/reset")}>Schimbă parola</Button>
                                </div>
                                <div className="mt-3">
                                    <Button className="btn btn-danger"
                                        onClick={() => setShowDeleteModal(true)}
                                    >Dezactivează profil</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmare dezactivare</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Ești sigur că vrei să îți dezactivezi contul?</p>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                        onClick={() => handleDeleteConfirmation(false)}
                    >
                        Nu
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger mx-3"
                        onClick={() => handleDeleteConfirmation(true)}
                    >
                        Da
                    </button>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default Profile;