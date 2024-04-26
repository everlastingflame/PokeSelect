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
    let user = req.body;
    try{
        console.log(user);
        data_validation.validateUsername(user.username, "username");
        data_validation.validatePassword(user.password, "password");
        data_validation.validateEmail(user.email, "email");
        console.log(user.dob);
        data_validation.validateDate(user.dob, "dob");
    }
    catch(e){
        res.status(400).render('signUpForm', {error: e}); 
    }
    try {
        const newUser = await dbData.users.createNewUser(user.username, user.password, user.email, user.dob);
        res.render('userhome', {newUser: user.username});
    } catch (e) {
        res.status(400).render('signUpForm', {error: e});
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
        const user = await dbData.users.loginUser(username, password);
        res.render('userhome', {user: user});

    }catch(e){
        res.status(400).render('userlogon', {error: e}); 
        return;
    }

});

export default router;
