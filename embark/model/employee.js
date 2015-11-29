var mongoose = require('mongoose');

var db = mongoose.connection;
var Schema = mongoose.Schema;


var employeeSchema = new Schema({
	email_id: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	session_token: {type: String, required: true},
	created_at: Date,
	updated_at: Date,
});


employeeSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
  {
    this.created_at = currentDate;
  }
  next();
});


var Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;