import { Router } from 'express';
const router = Router();
import { Services } from "../database/sequelize.js";
import { Op } from 'sequelize';

// get all services
router.route('/').get((req, res) => {
    const query = {}
    let pageSize = 2;
    const allowedFilters = ['ServiceID', 'Name','Price'];
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

    Services.findAll(query).then(result => res.send(result))

});

// add service
router.route('/').post((req, res) => {
    try {
        if (!req.body.Name || !req.body.Price ) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        Services.create(req.body).then(result => res.status(201).json(result));
    }
    catch (err) {
        return res.status(500).json("server error")
    }
})

// edit service
router.route('/:id').put(async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Anulare actualizare.' });
        }
        const service = await Services.findByPk(req.params.id);
        if (!service) return res.status(404).json({ error: 'Serviciul nu exista' });
        await service.update(req.body);
        return res.status(204).json(service);
    }
    catch (err) {
        return res.status(500).json("server error: " + err.message)
    }
})

// delete service 
router.route('/:id').delete((req, res) => {
    Services.findByPk(req.params.id).then(record => {
        if (record) record.destroy();
        else res.json(`There is no service with the id ${req.params.id}`);
    }).then(() => res.status(201).json({ message: `The service with id ${req.params.id} was deleted!` }));
})

export default router;