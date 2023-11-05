import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navigation() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      try {
        setIsLoggedIn(true);
        if (role) {
          setIsAdmin(role == "admin")
        }
      } catch (e) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } else setIsLoggedIn(false)
  });

  const logout = async () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  }

  return (
    <Navbar className='shadow-lg' collapseOnSelect bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="/home">
          <img
            alt=""
            src="https://mrauto360.com/images/navbar-image1.png"
            width="40"
            height="40"
            className="d-inline-block align-top"
          />{' '}
          MyAuto
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        {isLoggedIn && <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >
            <Nav.Link href="/home">Acasă</Nav.Link>
            {
              isAdmin ? <Nav.Link href="/services">Servicii</Nav.Link> : ''
            }
            <Nav.Link href="/cars">Mașini</Nav.Link>
            <Nav.Link href="/appointments">Programări</Nav.Link>
            {
              isAdmin ? <Nav.Link href="/dashboard">Statistici</Nav.Link> : ''
            }
            <NavDropdown title="Profil" id="navbarScrollingDropdown">
              <NavDropdown.Item href="/profile">
                Profilul meu
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#" onClick={logout}>
                Log out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>}

      </Container>
    </Navbar>
  );
}

export default Navigation;