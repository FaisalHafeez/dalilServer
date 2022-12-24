// importing mongoose dependency for beneficiary schema and model creation
const mongoose = require(`mongoose`);

// beneficiary schema or structure
const beneficiarySchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, `please provide valid firstName`],
  },
  middleName: {
    type: String,
    required: [true, `please provide valid middleName`],
  },
  lastName: {
    type: String,
    required: [true, `please provide valid lastName`],
  },
  birthdate: {
    type: String,
    required: [true, `please provide valid birthdate`],
  },
  phoneNumber: {
    type: String,
    required: [true, `please provide valid phoneNumber `],
  },
  gender: {
    type: String,
    required: [true, `please provide valid gender`],
  },
  familyMembers: {
    type: Array,
    required: [true, `please provide valid family member `],
  },
  insurancePolicyId: {
    type: String,
    required: [true, `please provide valid insurance policy id`],
  },
  residentCity: {
    type: String,
    required: [true, `please provide valid resident City `],
  },
  residentDistrict: String,
  account: {
    hasAccount: { type: Boolean, required: true },
    userId: {
      type: String,
    },
  },

  sd: {
    type: Number,
    // unique: true,
  },
  beneficiaryId: {
    type: String,
    unique: true,
  },
});

const beneficiarys = mongoose.model(`beneficiary`, beneficiarySchema);

// exporting beneficiary model to beneficiarymiddleware for querying beneficiary collection
module.exports = beneficiarys;
