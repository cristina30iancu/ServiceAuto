import { Router } from 'express';
const router = Router();
import { Users } from "../database/sequelize.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const JWT_SECRET = "abcdef"
import { Op } from 'sequelize';

// get all users
router.route('/').get((req, res) => {
    const query = {}
    let pageSize = 2;
    const allowedFilters = ['Username', 'Firstname', 'Lastname', 'Password', 'Email', 'Role', 'UserID'];
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

    Users.findAll(query).then(result => res.send(result))

});

router.route('/login').post((req, res) => {
    try {
        Users.findOne({
            where: {
              [Op.or]: [
                { Username: req.body.Username },
                { Email: req.body.Username },
              ],
            },
          }).then(user => {
            if (user) {
                bcrypt.compare(req.body.Password, user.Password).then(isMatch => {
                    if (!isMatch) {
                        res.status(401).json({
                            message: 'Incorrect password'
                        });
                    } else {
                        const token = jwt.sign({ id: user.UserID }, JWT_SECRET, {
                            expiresIn: '1d'
                        });
                        return res.status(200).json({
                            message: 'Login successful',
                            token,
                            user: user,
                            role: user.Role
                        });
                    }
                })
            } else return res.status(404).json({ message: 'Invalid login!' })
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.route('/logged/:token').get((req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, JWT_SECRET);
        Users.findByPk(decoded.id).then(user => {
            if (user) {
                return res.status(200).json(user);
            } else return res.status(404).json({ message: 'Invalid token!' })
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// register
router.route('/register').post((req, res) => {
    try {
        const saltRounds = 10;
        bcrypt.hash(req.body.Password, saltRounds).then(hashedPassword => Users.create({
            Username: req.body.Username.replace(/@.+$/, ""),
            Password: hashedPassword,
            Email: req.body.Email,
            Firstname: req.body.Firstname,
            Lastname: req.body.Lastname,
            Role: req.body.Role ? req.body.Role : 'customer'
        }).then(result => {
            const token = jwt.sign({ id: result.UserID }, JWT_SECRET, {
                expiresIn: '1d'
            });
            console.log("e ok")
            return res.status(200).json({
                message: 'User registered successfully',
                token
            })
        }
        ).catch(msg => {
            console.log(msg);
            return res.status(400).json({ message: msg.message });
        }))
    } catch (err) {
        return res.status(500).json('server error: ' + err.message);
    }
})

// edit account
router.route('/').put(async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Anulare actualizare.' });
        }

        console.log(req.body)
        const user = await Users.findOne({ where: { Username: req.body.Username } });
        if (!user) return res.status(404).json({ error: 'Utilizatorul nu există!' });
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Parola veche este greșită!' });
        }
        const hashedPassword = await bcrypt.hash(req.body.Password, 10); // Hash the new password
        user.Password = hashedPassword; // Update the user's password field

        await user.save(); // Save the updated user object to the database

        const token = jwt.sign({ id: user.UserID }, JWT_SECRET, {
            expiresIn: '1d'
        });
        return res.status(200).json({
            message: 'Actualizare reușită!',
            token,
            user: user,
            roles: [user.Role]
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Eroare: " + err.message })
    }
})

// deactivate account
router.route('/').delete(async (req, res) => {
    try {
        const user = await Users.findOne({ where: { Username: req.body.Username } });
        if (!user) return res.status(404).json({ error: 'Utilizatorul nu există!' });

        await user.destroy()
        return res.status(200).json(`${req.body.Username} șters`);
    }
    catch (err) {
        return res.status(500).json({ error: "Eroare: " + err.message })
    }
})

export default router;