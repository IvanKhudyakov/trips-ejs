const express = require('express');
const router = express.Router();

const {
    getAllTrips,
    indexPage,
    createTrip,
    putUpCreate,
    getTripForEdit,
    updateTrip,
    deleteTrip } = require('../controllers/trips');

// GET /jobs (display all the job listings belonging to this user)
// POST /jobs (Add a new job listing)
// GET /jobs/new (Put up the form to create a new entry)
// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
// POST /jobs/update/:id (Update a particular entry)
// POST /jobs/delete/:id (Delete an entry)

router.route('/').get(indexPage);
// router.route('/trips').get(getAllTrips);
router.route('/trips').post(createTrip).get(getAllTrips);
router.route('/trips/new').get(putUpCreate);
router.route('/trips/edit/:id').get(getTripForEdit);
router.route('/trips/update/:id').post(updateTrip);
router.route('/trips/delete/:id').post(deleteTrip);


module.exports = router;