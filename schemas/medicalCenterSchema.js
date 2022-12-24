// importing mongooose for medicalCenterSchema and collection setup
const mongoose = require(`mongoose`);

// medicalCenter schema setup
const medicalCenterSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, `please enter valid  name`],
  },
  city: {
    type: String,
    required: [true, `please enter valid city`],
  },
  district: {
    type: String,
    required: [true, `please enter valid district`],
  },
  description: String,
  address: {
    type: String,
    required: [true, `please enter valid address`],
  },
  phoneNumber: {
    type: Array,
    required: [true, `please enter valid phoneNumbers`],
  },
  email: {
    type: String,
    unique: true,
  },
  facebookLink: String,
  googleMapLink: String,
  website: {
    type: String,
    required: [true, `please enter valid website`],
  },
  medicalCenterId: { type: String, unique: true },
  sd: { type: Number, unique: true },
});

const medicalCenter = mongoose.model(`medicalCenter`, medicalCenterSchema);

module.exports = medicalCenter;
