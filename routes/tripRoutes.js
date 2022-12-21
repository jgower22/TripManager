const express = require('express');
const controller = require('../controllers/tripController');
const { isGuest, isLoggedIn, isAccessType } = require('../middlewares/auth');
const { validateId, validateTrip, validateDay, validateResult } = require('../middlewares/validator');

const router = express.Router();

//GET /trips: send all trips to user
router.get('/', isLoggedIn, controller.index);

//GET /trips/new: send html form for creating a new trip
router.get('/new', isLoggedIn, controller.newTrip);

//POST /trips: create a new trip
router.post('/', isLoggedIn, validateTrip, validateResult, controller.createTrip);

//GET /trips/:id: send details of trip of specified id
router.get('/:id', validateId, isLoggedIn, isAccessType(['owner', 'editor', 'viewer']), controller.showTrip);

//GET /trips/:id/edit: send html form for editing an existing trip
router.get('/:id/edit', validateId, isLoggedIn, isAccessType(['owner', 'editor']), controller.editTrip);

//PUT /trips/:id: update the trip of the specified id
router.put('/:id', validateId, isLoggedIn, isAccessType(['owner', 'editor']), validateTrip, validateResult, controller.updateTrip);

//PUT /trips/:id/access: update the trip's access of the specified id
router.put('/:id/access', validateId, isLoggedIn, isAccessType(['owner']), controller.addAccess);

//DELETE /trips/:id/:userId: delete access from the specified user on the specified trip
router.delete('/:id/:userId', validateId, isLoggedIn, isAccessType(['owner']), controller.removeAccess);

//DELETE /trips/:id: delete the trip of the specified id
router.delete('/:id', validateId, isLoggedIn, isAccessType(['owner']), controller.deleteTrip);

//GET /trips/:id/pdf: generate a PDF of the trip of the specified id
router.get('/:id/pdf', validateId, isLoggedIn, isAccessType(['owner', 'editor', 'viewer']), controller.generatePDF);

//GET /trips/:id/share: send sharing details of specified trip id
router.get('/:id/share', validateId, isLoggedIn, isAccessType(['owner', 'editor', 'viewer']), controller.share);

//GET /trips/:id/:dayId: show the day with the specified trip id and day number
router.get('/:id/:dayId', validateId, isLoggedIn, isAccessType(['owner', 'editor', 'viewer']), controller.showDay);

//GET /trips/:id/:dayId/edit: send html form for editing an existing day by trip id/day number
router.get('/:id/:dayId/edit', validateId, isLoggedIn, isAccessType(['owner', 'editor']), controller.editDay);

//PUT /trips/:id/:dayId: update the day of the specified trip id/day number
router.put('/:id/:dayId', validateId, isLoggedIn, isAccessType(['owner', 'editor']), validateDay, validateResult, controller.updateDay);

module.exports = router;