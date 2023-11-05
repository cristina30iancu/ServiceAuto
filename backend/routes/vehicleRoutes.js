import { Router } from 'express';
const router = Router();
import { Users, Vehicles } from "../database/sequelize.js";
import { Op } from 'sequelize';

// get all vehicles
router.route('/').get((req, res) => {

    const query = {}
    let pageSize = 2;
    const allowedFilters = ['VehicleID', 'Make','Model', 'Year','Fuel','UserID'];
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
        query.where = {}
        for (const key of filterKeys) {
            query.where[key] = {
                [Op.like]: `%${req.query[key]}%`
            }
        }
    } if (req.query.sortOrder && req.query.sortOrder === '-1') {
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
    Vehicles.findAll(query).then(result => res.send(result))

});

// add vehicle
router.route('/').post((req, res) => {
    try {
        if (!req.body.Make || !req.body.Model || !req.body.Year || !req.body.Fuel ) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        Vehicles.create(req.body).then(result => res.status(201).json(result));
    }
    catch (err) {
        return res.status(500).json("server error")
    }
})

// edit vehicle
router.route('/:id').put(async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Anulare actualizare.' });
        }
        const vehicle = await Vehicles.findByPk(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehiculul nu exista' });
        await vehicle.update(req.body);
        return res.status(204).json(vehicle);
    }
    catch (err) {
        return res.status(500).json("server error: " + err.message)
    }
})
  
// delete vehicle 
router.route('/:id').delete((req, res) => {
    Vehicles.findByPk(req.params.id).then(record => {
        if (record) record.destroy();
        else res.json(`There is no vehicle with the id ${req.params.id}`);
    }).then(() => res.status(201).json({ message: `The vehicle with id ${req.params.id} was deleted!` }));
})

// give vehicle to user
router.route('/:id/user/:UserID').post((req, res) => {
    Vehicles.findByPk(req.params.id).then(vehicle => {
        if (!vehicle) return res.json(`There is no vehicle with the id ${req.params.id}`);
        else {
            Users.findByPk(req.params.UserID).then(user => {
                if(!user) return res.json(`There is no user with the id ${req.params.UserID}`);
                else {
                    vehicle.update({
                        UserID: req.params.UserID
                    }).then(result => res.json(result))
                }
            })
        }
    });
})

export default router;