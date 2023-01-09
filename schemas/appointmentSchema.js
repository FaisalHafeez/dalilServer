// importing mongoose for appointment schema and collection
const mongoose = require(`mongoose`);

// appointment schema or structure
const appointmentSchema = mongoose.Schema({
  // appointmentId: {
  //   type: String,
  // },
  appointmentId: mongoose.ObjectId,
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
  appointmentStatus: {
    type: String,
  },
  notes: String,
  images: String,
  userId: {
    type: String,
    required: [true, `please provide valid userId`],
  },
 
  //   type: Array,
  // },
  // medicalcenter: {
  //   medicalCenterId: {
  //     type: String,
  //   },
  //   name: {
  //     type: String,
  //   },
  //   city: {
  //     type: String,
  //   },
  //   district: {
  //     type: String,
  //   },
  //   description: {
  //     type: String,
  //   },
  //   address: {
  //     type: String,
  //   },
  //   phoneNumber: Array,
  //   email: String,
  //   facebookLink: String,
  //   googleMaplink: String,
  //   website: String,
  // },
  dateCreated: { type: Date },
  lastUpdateDate: {
    type: Date,
  }
});

const appointment = mongoose.model(`appointment`, appointmentSchema);

// exporting appointment collection
module.exports = appointment;
