// importing mongoose for scheduke schema and collection
const mongoose = require(`mongoose`);

// scheduke schema or structure
const scheduleSchema = mongoose.Schema({
  scheduleId: {
    type: String,
    required: [true, `please provide valid  scheduleId`],
  },
  sd: {
    type: Number,
  },
  medicalCenterId: {
    type: String,
    required: [true, `please provide valid medicalCenter id`],
  },
  doctorId: {
    type: String,
    required: [true, `please provide valid doctor id`],
  },
  timeslot: {
    type: String,
    required: [true, `please provide valid timeslot`],
  },
  monday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },
  tuesday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },
  wednesday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },
  thursday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },
  friday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },
  saturday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },
  sunday: {
    type: Boolean,
    required: [true, `please provide valid date`],
  },

  price: {
    type: Number,
    required: [true, `please provide valid price`],
  },
  startDate: {
    type: Date,
    required: [true, `please provide valid startDate`],
  },
  endDate: {
    type: Date,
    required: [true, `please provide valid endDate`],
  },

  doctor: {
    type: Array,
  },
  medicalcenter: {
    medicalCenterId: {
      type: String,
    },
    name: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
    },
    phoneNumber: Array,
    email: String,
    facebookLink: String,
    googleMaplink: String,
    website: String,
  },
  isActive: {
    type: Boolean,
  },
  dateCreated: { type: Date },
  dateCreatedMilliSeconds: {
    type: Number,
  },
  lastUpdateDate: {
    type: Date,
  },
  sid: Number,
});

const schedule = mongoose.model(`schedule`, scheduleSchema);

// exporting schedule collection
module.exports = schedule;
