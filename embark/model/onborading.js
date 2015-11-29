var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;

var onboardingSchema = new Schema({
	uid_data: {type: Number},
	poi: {
		name: {type: String},
		dob: {type: String},
		gender: {type: String},
		phone: {type: Number},
		email: {type: String},
	},
	poa: {
		co: {type: String},
		house: {type: String},
		street: {type: String},
		lm: {type: String},
		loc: {type: String},
		vtc: {type: String},
		sub_dist: {type: String},
		dist: {type: String},
		state: {type: String},
		pc: {type: String},
		po: {type: String},	
	},
	ldate:{
		lang: {type: String},
		co: {type: String},
		house: {type: String},
		street: {type: String},
		lm: {type: String},
		loc: {type: String},
		vtc: {type: String},
		sub_dist: {type: String},
		dist: {type: String},
		state: {type: String},
		pc: {type: String},
		po: {type: String},
	},
	pht: {type: String},
	signature: {type: String}
});

onboardingSchema.pre('save', function(next) {
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

module.exports = onboardingSchema;
