import { Router } from 'express';
const router = Router();
import { Payments } from "../database/sequelize.js";
import { Op } from 'sequelize';

// get all payments
router.route('/').get((req, res) => {
    const query = {}
    let pageSize = 2;
    const allowedFilters = ['PaymentID', 'Amount','Date','Type','AppointmentID'];
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

    Payments.findAll(query).then(result => res.send(result))

});

// add payment
router.route('/').post((req, res) => {
    try {
        if (!req.body.Amount || !req.body.Date || !req.body.Type|| !req.body.AppointmentID ) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        Payments.create(req.body).then(result => res.status(200).json(result));
    }
    catch (err) {
        return res.status(500).json("server error")
    }
})

// delete payment 
router.route('/:id').delete((req, res) => {
    Payments.findByPk(req.params.id).then(record => {
        if (record) record.destroy();
        else res.json(`There is no payment with the id ${req.params.id}`);
    }).then(() => res.json({ message: `The payment with id ${req.params.id} was deleted!` }));
})

export default router;