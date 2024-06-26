//require modules
const express = require('express');
const morgan = require('morgan');
const tripRoutes = require('./routes/tripRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const dotenv = require('dotenv');

//create app
const app = express();

//configure app
let port = process.env.PORT || 8084;
let host = '0.0.0.0';
dotenv.config();
let username = `${process.env.DB_USERNAME}`;
let password = `${process.env.DB_PASSWORD}`;
let url = 'mongodb+srv://' + username + ':' + password + '@trips.jiospgv.mongodb.net/trips';
console.log(url);
app.set('view engine', 'ejs');

//connect to MongoDB
mongoose.connect(url)
.then(() => {
    //start the server
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride("_method"));
//app.use(trimmer);

function trimmer(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
        //Escape <script> and </script> on inputted data
        var message = 'script';
        var searchStr = 'script';
        var regEx = new RegExp(searchStr, "ig");
        //For trips only
        try {
            //req.body.name = req.body.name.replaceAll('<script>', message);
            //req.body.name = req.body.name.replaceAll('</script>', message);
            req.body.name = req.body.name.replaceAll(regEx, message);
            req.body.name = req.body.name.replaceAll('<', '');
            req.body.name = req.body.name.replaceAll('>', '');
        } catch (e) {
            console.log(e.message);
        }
        //For trips + days
        try {
            req.body.location = req.body.location.replaceAll(regEx, message);
            req.body.location = req.body.location.replaceAll('<', '');
            req.body.location = req.body.location.replaceAll('>', '');
            req.body.details = req.body.details.replaceAll(regEx, message);
            req.body.details = req.body.details.replaceAll('<', '');
            req.body.details = req.body.details.replaceAll('>', '');
        } catch (e) {
            console.log(e.message);
        }
        for (const [key, value] of Object.entries(req.body)) {
            if (typeof(value) === 'string')
                req.body[key] = value.trim();
        }
    }
    next();
}

app.use(session({
    secret: `${process.env.SESSION_KEY}`,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000},
    store: new MongoStore({mongoUrl: url})
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.email = req.session.email||null;
    res.locals.userFullName = req.session.userFullName||null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

//set up routes
app.use('/', mainRoutes);
app.use('/trips', tripRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate resource ' + req.url);
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    if (!err.status) {
        err.status = 500;
        err.message = ('Internal Server Error');
    } 
    res.status(err.status);
    console.log(err.stack);
    res.render('./error/serverError', {error: err});
});

//TO DO
//Display hyperlinks as different colors -- DONE
//Sort trips by Ongoing, Upcoming, Previous -- DONE
//Generate a PDF for trip showing all day details -- DONE
//Alert user when days will be removed when num of days shrinks when editing trip -- PARTIALLY DONE, need to display the days that will be removed
//Adding viewers / editors for everything related to trips -- DONE
//If user drop-down is shown, allow user to click anywhere else on site to close it -- DONE
//If user needs to login to access page, redirect to last page user was on after they login -- DONE
//Update CSS for flash messages -- DONE
//Fix placeholders on forms (12:00 PM) -- DONE
//Add limit on number of days at can be added (731 days) -- DONE
//Add a copy trip button -- Will say "Copy of (trip name)" -- DONE
//Option to sort trips shown by created or shared with me or show all (send new request to server) -- DONE
//Add go to last day button on showDays.ejs -- DONE
//Edit timestamp for last modified on for trips and add last modified by -- DONE
//Fix CANCEL button on mobile when turning device -- changes look -- DONE
//General access - anyone with link can view/edit trip -- DONE
//Add copy link button on share.ejs under general access -- DONE
//Work on profile page -- display created trips in a table maybe -- DONE
//Add character limits on trip fields -- DONE
//Fix share.ejs css on mobile -- DONE
//Display previous trips in reverse order by end date (show most recent trips at top) -- DONE
//Profile page - options to sort trips by created or shared with me or show all -- DONE
//Save user preference when reloading trips page (display trips based on what they last have been shown), saved in session -- DONE
//Fix header (user drop down) - does not show on 'top' of screen -- DONE
//Fix header (user drop down) - goes off page if main content is not long enough -- DONE
//Add create new trip when user is shown none exist -- DONE
//Statistics - show one big map of all with pinpoints of everywhere the user went in a overall - DONE

//Ability to archive a trip
//When a form contains errors, keep the fields when page refreshes
//Work on settings page
//Add pop-up modal for adding new users for share.ejs
//Add transition on copy link message on share.ejs
//Make flash messages same width as main container on page
//Bug fix: Flash message saying you are already logged in when spamming cancel on forms -- unable to replicate 12/28/22 @ 10:50 PM
//Update end date calendar value to day after start date when it is changed
//Search bar on trips page
//Confirmation emails

