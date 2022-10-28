//require modules
const express = require('express');
const morgan = require('morgan');
const tripRoutes = require('./routes/tripRoutes');
const mainRoutes = require('./routes/mainRoutes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

//create app
const app = express();

//configure app
let port = 8084;
let host = 'localhost';
let url = 'mongodb://localhost:27017/trips';
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
app.use(trimmer);

function trimmer(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT') {
        //Escape <script> and </script> on inputted data
        var message = 'L';
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
            req.body.image = req.body.image.replaceAll(regEx, '');
            req.body.image = req.body.image.replaceAll('<', '');
            req.body.image = req.body.image.replaceAll('>', '');
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

//set up routes
app.use('/', mainRoutes);
app.use('/trips', tripRoutes);

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
    res.render('error', {error: err});
});

//TO DO
//Display hyperlinks as different colors -- DONE
//Sort trips by Ongoing, Upcoming, Previous -- DONE
//Generate a PDF for trip showing all day details -- DONE
//Alert user when days will be removed when num of days shrinks when editing trip
//Fix placeholders on forms (12:00 PM)
//Add go to last day button on showDays.ejs
//Storing an image without URL
//Changing time stamp display - maybe split it, convert to 12 hour time
//Search bar on trips page
