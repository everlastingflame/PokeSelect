import data_validation from "../data/data_validation.js"
import express from 'express';
import { dbData } from "../data/index.js"

const router = express.Router();

router.get('/new', async (req, res) => {
    try {
        res.render('newDraft');
    } catch (e) {
        res.status(500).send(e.message);
    }
})
.post(async (req, res) => {

});

router.get('/new', async (req, res) => {
    try {
        let isLoggedIn = req.session.user ? true : false;
        res.render('landingPage', {isLoggedIn: isLoggedIn});
    } catch (e) {
        res.status(500).send(e.message);
    }
});

export default router;