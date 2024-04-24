import data_validation from "../data/data_validation.js"
import express from 'express';
import { dbData } from "../data/index.js"

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
        const users = await dbData.users.getAll();
        res.json(users);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await dbData.users.getUser(req.params.id);
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
.route('/register')
.get((req, res) => {
    res.render('signUpForm');
})
.post(async (req, res) => {
    try{
        let user = req.body;
        console.log(user);
        data_validation.validateString(user.username, "username");
        data_validation.validateString(user.password, "password");
        data_validation.validateString(user.email, "email");
        data_validation.validateDate(user.dob, "dob");
    }
    catch(e){
        res.status(400).send(`Invalid input, ${e.message}`); 
        return;
    }
    try {
        let user = req.body;
        const newUser = await dbData.users.createNewUser(user.username, user.password, user.email, user.dob);
        res.render('userhome', {newUser: user.username});
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
});

router
.route('/login')
.get((req, res) => {
    res.render('userlogon');
})
.post(async (req, res) => {
    const {username, password} = req.body;
    try{
        console.log(user.username, user.password);
        let user = req.body;
        data_validation.validateString(user.username, "username");
        data_validation.validateString(user.password, "password");
    }
    catch(e){
        res.status(400).render('userlogon', {error:  `Invalid input, ${e}`}); 
        return;
    }
    try{
        let user = req.body;
        const existingUser = await dbData.users.getUser(user.username);
        if (!existingUser || existingUser.password !== user.password) {
            res.status(401).render('userlogon', {error: 'Invalid user or password'});
            return;
        }
        res.render('userhome', {user: existingUser.name});  
    } catch (e) {
        res.status(500).send(e.message);
    }
});

export default router;