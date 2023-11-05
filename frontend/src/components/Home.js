import { useEffect } from 'react';
import { Carousel, Container, Row, Col } from 'react-bootstrap';
import '../index.css';
import CarSection from './CarSection';
import Footer from './Footer';

const Home = () => {
  useEffect(() => {
    document.querySelector('.home').classList.add('fade-in-active');
  }, []);

  return (
    <div className='bg-light home'>
      <Carousel fade={true} indicators={false} nextLabel="" prevLabel="">
        <Carousel.Item style={{ height: '50vh' }} interval={3000}>
          <img
            className="d-block w-100"
            src="https://e1.pxfuel.com/desktop-wallpaper/888/240/desktop-wallpaper-best-car-for-laptop.jpg"
            alt="First slide"
          />
          <Carousel.Caption className='shadow-lg' style={{ fontWeight: 'bolder', fontFamily: 'Copperplate' }}>
            <h3>My auto</h3>
            <p>Rapid, sigur și la îndemână</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item style={{ height: '50vh' }} interval={3000}>
          <img
            className="d-block w-100"
            src="https://e0.pxfuel.com/wallpapers/25/852/desktop-wallpaper-night-drive-by-bjschneider-for-long-exposure-night-graphy-contest.jpg"
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3>Accesibil</h3>
            <p>Direct de pe telefonul tău</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item style={{ height: '50vh' }} interval={3000}>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8OHx8fGVufDB8fHx8&w=1000&q=80"
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3>Eficient</h3>
            <p>Totul într-un singur loc</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      <Container className='mb-2 pt-5'>
        <Row>
          <Col className='text-center '>
            <h1 className="animate-charcter">Bine ați venit!</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <p class="description mb-5 p-5 mt-3">Transformă administrarea serviciilor auto într-o experiență plăcută! 
            Uită de birocrație și pierderea de timp. Aici, poți planifica programări rapide și alege servicii personalizate. 
            Îmbinăm tehnologia avansată cu pasiunea pentru automobile,
             pentru a-ți oferi cea mai bună experiență de administrare auto.</p>
          </Col>
        </Row>
        <Row>
          <Col>
          </Col>
        </Row>
      </Container>
      <CarSection/>
      <Footer />
    </div>
  )
}

export default Home
