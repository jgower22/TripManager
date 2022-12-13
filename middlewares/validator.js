const { body } = require('express-validator');
const { validationResult } = require('express-validator');

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid trip id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error=> {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}

exports.validateSignUp = [body('firstName', 'First name cannot be empty').notEmpty().isAlpha().withMessage('First name can only contain letters').trim().escape(),
body('lastName', 'Last name cannot be empty').notEmpty().isAlpha().withMessage('Last name can only contain letters').trim().escape(),
body('email', 'Email must be a valid email address').isEmail().normalizeEmail().trim().escape(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateLogIn = [body('email', 'Email must be a valid email address').isEmail().normalizeEmail({ gmail_remove_dots: false }).trim().escape(),
body('password', 'Password must be at least 8 characters and at most 64 characters').isLength({min: 8, max: 64})];

exports.validateTrip = [body('name').isLength({min: 3}).withMessage('Trip name must be at least 3 characters').trim().escape(),
body('location').isLength({min: 3}).withMessage('Trip location must be at least 3 characters').trim().escape(),
body('startDate').isDate().withMessage('Start date must be a valid date').trim().escape(),
body('endDate').isDate().withMessage('End date must be a valid date').custom((value, { req }) => {
    let startDate = req.body.startDate;
    console.log('VALUE: ' + value);
    let endDate = value;

    if (endDate < startDate) {
        throw new Error('End date must be on or after start date');
    }

    return true;
})
.trim().escape(),
body('details').isLength({min: 3}).withMessage('Trip details must be at least 3 characters').trim().escape(),
body('applyToAllDays', 'Invalid value for change location for all days').toLowerCase().isIn('on').trim().escape()];

