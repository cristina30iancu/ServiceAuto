import { Container, Row, Col } from 'react-bootstrap';
function Footer() {
    return (
      <footer className="bg-dark text-white py-3">
        <Container>
          <Row>
            <Col md="6">
              <h5>Contact</h5>
              <ul className="list-unstyled">
                <li>Str. Absolvirii nr. 50</li>
                <li>București, Sector 4</li>
                <li>info@myauto.com</li>
                <li>(0224) 234-432</li>
              </ul>
            </Col>
            <Col md="6">
              <p className="float-md-right">
                &copy; {new Date().getFullYear()} My auto. Toate drepturile rezervate.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
export default Footer;  