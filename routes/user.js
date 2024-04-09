import validation from "../data/data_validation.js"
import express from 'express';
import {create, getAll, get, remove, update} from "../data/users.js"
//import {productCreationCheck, deleteFuncHelp} from "../helpers.js"

const router = express.Router();