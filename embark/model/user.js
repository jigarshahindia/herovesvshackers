var mongoose = require('mongoose');
var crypto = require('crypto');

var db = mongoose.connection;
var Schema = mongoose.Schema;

var documentSchema = require('./document');

var userSchema = new Schema({
	email_id: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	device_id: {type: String},
	device: {type: String},	
	ip_address: {type: String},
  onboardingDetails: {
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
  },
	documents: [documentSchema],
	is_deleted : {type: Boolean, default: false},
  session_token: {type: String, required: true},
	created_at: Date,
	updated_at: Date,
});

userSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
  {
    this.password = crypto.createHash('sha256').update(this.password).digest('base64');
    this.created_at = currentDate;
    for(var index = 0; index < 5 ; index ++)
    {
      this.documents.push({'document_id': index + 1});
    }
  }
  next();
});

var User = mongoose.model('User', userSchema);
module.exports = User;
