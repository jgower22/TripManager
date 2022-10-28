const express = require('express');
const controller = require('../controllers/tripController');

const router = express.Router();

//GET /trips: send all trips to user
router.get('/', controller.index);

//GET /trips/new: send html form for creating a new trip
router.get('/new', controller.newTrip);

//POST /trips: create a new trip
router.post('/', controller.createTrip);

//GET /trips/:id: send details of connection of specified id
router.get('/:id', controller.showTrip);

//GET /trips/:id/edit: send html form for editing an existing trip
router.get('/:id/edit', controller.editTrip);

//PUT /trips/:id: update the trip of the specified id
router.put('/:id', controller.updateTrip);

//DELETE /trips/:id: delete the trip of the specified id
router.delete('/:id', controller.deleteTrip);

//GET /trips/:id/pdf: generate a PDF of the trip of the specified id
router.get('/:id/pdf', controller.generatePDF);

//GET /trips/:id/:dayId: show the day with the specified trip id and day number
router.get('/:id/:dayId', controller.showDay);

//GET /trips/:id/:dayId/edit: send html form for editing an existing day by trip id/day number
router.get('/:id/:dayId/edit', controller.editDay);

//PUT /trips/:id/:dayId: update the day of the specified trip id/day number
router.put('/:id/:dayId', controller.updateDay);

module.exports = router;