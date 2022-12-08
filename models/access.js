const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accessSchema = new Schema({
    type: {type: String},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    trip: {type: Schema.Types.ObjectId, ref: 'Trip'}
},
{timestamps: false}
);

module.exports = mongoose.model('Access', accessSchema);


