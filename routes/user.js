import data_validation from "../data/data_validation.js"
import express from 'express';
import { dbData } from "../data/index.js"
import xss from "xss";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        let isLoggedIn = req.session.user ? true : false;
        res.render('landingPage', {isLoggedIn: isLoggedIn});
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
        data_validation.validateUsername(xss(user.username), "username");
        data_validation.validatePassword(xss(user.password), "password");
        data_validation.validateEmail(xss(user.email), "email");
        data_validation.validateDate(xss(user.dob), "dob");
    }
    catch(e){
        res.status(400).render('signUpForm', {error: e}); 
    }
    try {
        const newUser = await dbData.users.createNewUser(user.username, user.password, user.email, user.dob);
        res.redirect('/login')
    } catch (e) {
        res.status(400).render('signUpForm', {error: e});
    }
});

router.route('/user/:name')
.get(async (req, res) => {
    let user = req.session.user;
    let profile_user = await dbData.users.getUserByName(req.params.name);
    res.render('userhome', {newUser: profile_user._id});
})

router
.route('/login')
.get((req, res) => {
    res.render('userlogon');
})
.post(async (req, res) => {
    const {username, password} = req.body;
    try{
        const user = await dbData.users.loginUser(xss(username), xss(password));
        req.session.user = user;
        res.redirect('/user/'+user.username);

    }catch(e){
        res.status(400).render('userlogon', {error: e}); 
        return;
    }


});

export default router;
