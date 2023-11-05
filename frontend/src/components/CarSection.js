import { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
function CarSection() {
    useEffect(() => {
        const carBox = document.querySelector(".car-box");
        const photoBox = document.querySelector(".photo-box");
    
        const onScroll = () => {
          const top = carBox.getBoundingClientRect().top;
    
          if (top < window.innerHeight) {
            carBox.classList.add("slide-in-left");
            photoBox.classList.add("slide-in-right");
            window.removeEventListener("scroll", onScroll);
          }
        };
    
        window.addEventListener("scroll", onScroll);
    
        return () => {
          window.removeEventListener("scroll", onScroll);
        };
      }, []);

    return (
      <div className="car-section">
        <Container>
          <Row>
            <Col md="6">
              <div className="car-box p-5">
                <h2>Funcționalități</h2>
                <p>Descoperă o modalitate modernă și inteligentă de a-ți gestiona mașina personală.
                   De la programări pentru revizii periodice și service-uri până la rapoarte personalizate 
                   și notificări utile, avem totul acoperit. Începe să ai control total asupra vehiculului 
                   tău și bucură-te de o experiență de conducere fără griji!</p>
              </div>
            </Col>
            <Col md="6">
              <div className="photo-box">
                <img src="https://www.cvfht.ca/FHTfolders.php?df=640" alt="Car 1" />
                <img src="https://media.istockphoto.com/id/1347150429/photo/professional-mechanic-working-on-the-engine-of-the-car-in-the-garage.jpg?s=612x612&w=0&k=20&c=5zlDGgLNNaWsp_jq_L1AsGT85wrzpdl3kVH-75S-zTU=" alt="Car 2" />
                </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
  export default CarSection
  