import data_validation from "../data/data_validation.js"
import express from 'express';
import userFuncs from "../data/users.js"

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.render('landingPage');
    } catch (e) {
        res.status(500).send(e.message);
    }
});


router.get('/users', async (req, res) => {
    try {
        const users = await userFuncs.getAll();
        res.json(users);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await userFuncs.getUser(req.params.id);
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        res.json(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router
.route('/signup')
.get((req, res) => {
    res.render('signUpForm');
})
.post(async (req, res) => {
    try {
        const user = req.body;
        if (!data_validation.isValidUser(user)) {
            res.status(400).send('Invalid user');
            return;
        }
        const newUser = await userFuncs.createNewUser(user);
        res.status(201).json(newUser);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router
.route('/login')
.get((req, res) => {
    res.render('userlogon');
})
.post(async (req, res) => {
    try {
        const user = req.body;
        if (!data_validation.isValidUser(user)) {
            res.status(400).send('Invalid user');
            return;
        }
        const existingUser = await userFuncs.getUser(user.username);
        if (!existingUser || existingUser.password !== user.password) {
            res.status(401).send('Invalid user or password');
            return;
        }
        res.render('welcome', { user: existingUser });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

export default router;