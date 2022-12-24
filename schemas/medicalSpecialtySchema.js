const mongoose = require(`mongoose`);

const medicalSpecialtySchema = mongoose.Schema({
  specialtyName: {
    type: Array,
    required: [true, `please provide valid specialty name`],
  },
});

const specialtyName = mongoose.model(`specialty`, medicalSpecialtySchema);

module.exports = specialtyName;
