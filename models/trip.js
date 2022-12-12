const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    name: {type: String, required: [true, 'name is required']},
    location: {type: String, required: [true, 'location is required']},
    startDate: {type: String, required: [true, 'startDate is required']},
    endDate: {type: String, required: [true, 'endDate is required']},
    details: {type: String, required: [true, 'details is required']},
    access: [{
        user: {type: Schema.Types.ObjectId, ref: 'User'},
        type: {type: String},
    }],
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    days: {type: Array, required: [true, 'days are required']},
},
{timestamps: true}
);

module.exports = mongoose.model('Trip', tripSchema);


