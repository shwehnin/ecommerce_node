const {Schema, model} = require('mongoose');

const categorySchema = Schema({
    name: {type: String, required: true},
    color: {type:String, default: '#000000'},
    image: {type: String, required: true}
});

categorySchema.set('toObject', {virtuals: true});
categorySchema.set('toJSON', {virtuals: true});

exports.Category = model('Category', categorySchema);