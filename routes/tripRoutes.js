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

//POST /trips/:id: copy an existing trip
router.post('/:id/copy', isLoggedIn, isAccessType(['owner', 'editor', 'viewer'], false), controller.copyTrip);

//GET /trips/:id: send details of trip of specified id
//*****//
router.get('/:id', validateId, isAccessType(['owner', 'editor', 'viewer'], true), controller.showTrip);

//GET /trips/:id/edit: send html form for editing an existing trip
router.get('/:id/edit', validateId, isLoggedIn, isAccessType(['owner', 'editor'], false), controller.editTrip);

//PUT /trips/:id: update the trip of the specified id
router.put('/:id', validateId, isLoggedIn, isAccessType(['owner', 'editor'], false), validateTrip, validateResult, controller.updateTrip);

//PUT /trips/:id/access: update the trip's access of the specified id
router.put('/:id/access', validateId, isLoggedIn, isAccessType(['owner'], false), controller.addAccess);

//PUT /trips/:id/general: update the trip's general access of the specified id
router.put('/:id/general', validateId, isLoggedIn, isAccessType(['owner'], false), controller.updateGeneralAccess);

//DELETE /trips/:id/:userId: delete access from the specified user on the specified trip
router.delete('/:id/:userId', validateId, isLoggedIn, isAccessType(['owner'], false), controller.removeAccess);

//DELETE /trips/:id: delete the trip of the specified id
router.delete('/:id', validateId, isLoggedIn, isAccessType(['owner'], false), controller.deleteTrip);

//GET /trips/:id/pdf: generate a PDF of the trip of the specified id
//*****//
router.get('/:id/pdf', validateId, isAccessType(['owner', 'editor', 'viewer'], true), controller.generatePDF);

//GET /trips/:id/share: send sharing details of specified trip id
router.get('/:id/share', validateId, isLoggedIn, isAccessType(['owner', 'editor', 'viewer'], false), controller.share);

//GET /trips/:id/:dayId: show the day with the specified trip id and day number
//*****//
router.get('/:id/:dayId', validateId, isAccessType(['owner', 'editor', 'viewer'], true), controller.showDay);

//GET /trips/:id/:dayId/edit: send html form for editing an existing day by trip id/day number
router.get('/:id/:dayId/edit', validateId, isLoggedIn, isAccessType(['owner', 'editor'], false), controller.editDay);

//PUT /trips/:id/:dayId: update the day of the specified trip id/day number
router.put('/:id/:dayId', validateId, isLoggedIn, isAccessType(['owner', 'editor'], false), validateDay, validateResult, controller.updateDay);

module.exports = router;