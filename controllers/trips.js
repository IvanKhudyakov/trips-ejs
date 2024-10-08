const User = require("../models/User");
const Trip = require("../models/Trip");
const convertDate = require("../utils/utils");


//render the index page
const indexPage = (req, res) => {
    res.redirect("/trips");
}

// GET /jobs (display all the job listings belonging to this user)
const getAllTrips = async (req, res) => {

    const trips = await Trip.find({ createdBy: res.locals.user }).sort('createdAt');
    // console.log("Total trips: ", trips.length);

    res.render("index", { trips, convertDate });
}

// POST /jobs (Add a new job listing)
const createTrip = async (req, res) => {
    req.body.createdBy = res.locals.user._id;
    //save the data to DB
    const trip = await Trip.create(req.body);
    // console.log(trip);
    res.redirect("/trips");
}
// GET /jobs/new (Put up the form to create a new entry)
const putUpCreate = (req, res) => {
    // console.log("putUpCreate");
    res.render("edittrip", {trip: null, convertDate});
}
// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
const getTripForEdit = async (req, res) => {
    // res.send("getTripForEdit");
    const tripId = req.params.id;
    const trip = await Trip.findOne({ _id: tripId });
    res.render("edittrip", { trip, convertDate });
}
// POST /jobs/update/:id (Update a particular entry)
const updateTrip = async (req, res) => {

    // console.log("updateTrip");
    // console.log(res.locals.user._id);
    
    const { body: {destination, duration, startDate, reason}, params: { id: tripId }} = req;
    const userId = res.locals.user._id;
    // console.log(destination, duration, res.locals.user._id, tripId);
    
    //ByDesign: no error handling as of now
    let update = {};
        update.destination = destination;
        update.duration = duration;
        update.startDate = startDate;
        update.reason = reason;
    
    const trip = await Trip.findOneAndUpdate({ _id: tripId, createdBy: userId }, update, {new:true, runValidators:true});
    // console.log(trip);
    res.redirect("/trips")
}
// POST /jobs/delete/:id (Delete an entry)
const deleteTrip = async (req, res) => {
    console.log("deleteTrip");
    const userId = res.locals.user._id;
    const tripId = req.params.id;
    const trip = await Trip.findOneAndDelete({ _id: tripId, createdBy: userId });
    if (!trip) {
        throw new Error(`The trip with id ${tripId} was not found`);
    }
    // console.log("The trip has been deleted!");
    
    res.redirect("/trips");
}

module.exports = {
    indexPage,
    getAllTrips,
    createTrip,
    putUpCreate,
    getTripForEdit,
    updateTrip,
    deleteTrip
};
