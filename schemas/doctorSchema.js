// importing mongooose for doctorSchema and collection setups
const mongoose = require(`mongoose`);

// doctor schema setup
const doctorSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, `please enter valid first name`],
  },
  middleName: {
    type: String,
    required: [true, `please enter valid middle name`],
  },
  lastName: {
    type: String,
    required: [true, `please enter valid last name`],
  },
  specialty: {
    type: String,
    required: [true, `please enter valid specialty`],
  },
  level: {
    type: String,
    required: [true, `please enter valid level`],
  },
  gender: {
    type: String,
    required: [true, `please enter valid gender`],
  },
  birthdate: {
    type: String,
    required: [true, `please enter valid birthdate`],
  },
  doctorId: { type: String, unique: true },
  sd: { type: Number, unique: true },
});

const doctor = mongoose.model(`doctor`, doctorSchema);

module.exports = doctor;
