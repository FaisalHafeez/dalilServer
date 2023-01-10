// importing mongoose for appointment schema and collection
const mongoose = require(`mongoose`);

// appointment schema or structure
const appointmentSchema = mongoose.Schema({
  // appointmentId: {
  //   type: String,
  // },
  appointmentId: mongoose.ObjectId,  
  appointmentStatus: {
    type: String,
  },
  patient: {
    userId: {
      type: String,
      required: [true, `please provide valid userId`],
    },
    patientType: {
      type: String,
      required: [true, `please provide valid patientType`],
    },
    patientId: {
      type: String,
      required: [true, `please provide valid patientId`],
    },
    patientName: {
      type: String,
      required: [true, `please provide valid patientName`],
    },
    patientRelationship: {
      type: String,
      required: [true, `please provide valid patientRelationship`],
    },
  },
  scheduleId: {
    type: String,
    required: [true, `please provide valid schedule id`],
  },
  medicalCenterId: {
    type: String,
    required: [true, `please provide valid medicalCenter id`],
  },
  doctorId: {
    type: String,
    required: [true, `please provide valid doctor id`],
  },  
  notes: String,
  medicalCenterObject: Object,
  doctorObject: Object,
  scheduleObject: Object,
  userId: {
    type: String,
    required: [true, `please provide valid userId`],
  },
  dateCreated: { type: Date },
  lastUpdateDate: {
    type: Date,
  }
});

const appointment = mongoose.model(`appointment`, appointmentSchema);

// exporting appointment collection
module.exports = appointment;
