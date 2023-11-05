import { Router } from 'express';
const router = Router();
import { Services, Vehicles, Appointments } from "../database/sequelize.js";
import { Op } from 'sequelize';

// get all appointments
router.route('/').get((req, res) => {
  const query = {};
  let pageSize = 2;
  const allowedFilters = ['AppointmentID', 'Date', 'Time', 'Status', 'VehicleID'];
  const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
  if (filterKeys.length > 0) {
    query.where = {}
    for (const key of filterKeys) {
      query.where[key] = {
        [Op.like]: `%${req.query[key]}%`
      }
    }
  }
  if (req.query.sortOrder && req.query.sortOrder === '-1') {
    sortOrder = 'DESC'
  }
  if (req.query.pageSize) {
    pageSize = parseInt(req.query.pageSize)
  }
  if (req.query.sort) {
    query.order = [[Sequelize.fn('lower', Sequelize.col(req.query.sort)), req.query.how ? req.query.how : 'ASC']]
  }
  if (!isNaN(parseInt(req.query.page))) {
    query.limit = pageSize
    query.offset = pageSize * parseInt(req.query.page)
  }

  const userQuery = {};
  if (req.query.UserID) {
    userQuery.where = {};
    userQuery.where.UserID = req.query.UserID;
  }

  Appointments.findAll({
    include: [{
      model: Services,
      attributes: ['ServiceID', 'Name', 'Price'],
      as: 'services',
    }, {
      model: Vehicles,
      attributes: ['UserID', 'Make', 'Model'],
      as: 'Vehicle',
      where: userQuery.where
    }],
    where: query.where,
    order: query.order,
    limit: query.limit,
    offset: query.offset,
  }).then(result => res.send(result));
});

router.route('/profit').get(async (req, res) => {
  try {
    const monthlyProfits = {};

    // Obține toate programările care au fost plătite
    const paidAppointments = await Appointments.findAll({
      where: {
        [Op.or]: [
          { Status: 'Plătită' },
          { Status: 'Acceptată' }
        ]
      },
      include: [
        {
          model: Services,
          as: 'services',
          attributes: ['Price'],
        },
      ],
    });
    // Calculează profitul pe fiecare lună
    paidAppointments.forEach(appointment => {
      const monthYear = appointment.Date.substring(0, 7); // Extrage YYYY-MM din data programării
      const appointmentProfit = appointment.services.reduce(
        (total, service) => total + service.Price,
        0
      );

      if (monthlyProfits[monthYear]) {
        monthlyProfits[monthYear] += appointmentProfit;
      } else {
        monthlyProfits[monthYear] = appointmentProfit;
      }
    });
    return res.status(201).json(monthlyProfits);
  } catch (error) {
    return res.status(400).json({ error: 'Eroare: ' + error });
  }
});

// add appointment
router.route('/').post(async (req, res) => {
  try {
    if (!req.body.Date || !req.body.Time || !req.body.VehicleID || !req.body.ServicesIDs) {
      return res.status(400).json({ error: 'Completați toate câmpurile!' });
    }
    Vehicles.findByPk(req.body.VehicleID).then(vehicle => {
      if (!vehicle) return res.status(404).json({ msg: `Nu există vehicul cu id ${req.params.VehicleID}` });
    })
    const apps = await Appointments.findAndCountAll({ where: { Date: req.body.Date, Time: req.body.Time } });
    if (apps.count >= 3) {
      return res.status(403).json({ msg: "Nu se mai pot genera programări în acest interval orar." });
    }
    const appointment = await Appointments.create(req.body);
    for (const id of req.body.ServicesIDs) {
      let service = await Services.findByPk(id);
      if (service) {
        await appointment.addService(service);
      }
    }
    return res.status(201).json(appointment);
  }
  catch (err) {
    return res.status(500).json("Eroare de server: " + err.message)
  }
})

// edit appointment
router.route('/:id').put(async (req, res) => {
  try {
    if (!req.body.Status) {
      return res.status(400).json({ error: 'Statusul lipseste.' });
    }
    const appointment = await Appointments.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Programarea nu exista' });
    await appointment.update({ Status: req.body.Status });
    return res.status(204).json(appointment);
  }
  catch (err) {
    return res.status(500).json("server error: " + err.message)
  }
})

// delete appointment 
router.route('/:id').delete((req, res) => {
  Appointments.findByPk(req.params.id).then(record => {
    if (record) record.destroy();
    else return res.status(404).json(`There is no appointment with the id ${req.params.id}`);
  }).then(() => res.status(201).json({ message: `The appointment with id ${req.params.id} was deleted!` }));
})


export default router;