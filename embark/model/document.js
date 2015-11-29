var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;

var documentSchema = new Schema({
	document_id: {type: Number},
	back_image_src: {type: String},
	front_image_src: {type: String},
	image_name: {type: String},
	status: {type: String, default: "notUploaded"},
	random_generator: {type: String},
	verified_by: {type: String},
	verification_type: {type: String},
	is_deleted: {type: Boolean, default: false},
	verification_date: Date,
	created_at: Date,
	updated_at: Date
});

documentSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
  {
    this.created_at = currentDate;
  }
  console.log("In");
  next();
});

module.exports = documentSchema;
