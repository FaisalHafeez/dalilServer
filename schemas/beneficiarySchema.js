// importing mongoose dependency for beneficiary schema and model creation
const mongoose = require(`mongoose`);


// medicalFile schema or structure
const medicalFileSchema = mongoose.Schema({
  medicalFileId: {
    type: String,
    required: [true, `please provide unique medicalFileID`],
    unique: true,
  },
  // familyMemberId: {
  //   type: String,
  //   required: [true, `please provide unique familyMemberId`],
  //   unique: true,
  // },
  bloodType: {
    type: String,
  },
  height: {
    type: Number,
  },
  allergies: {
    type: Array,
    required: [false, `specify allergies`],
  },
  chronicDiseases: {
    type: Array,
    required: [false, `specify chronic diseases`],
  },
  surgeryHistory: {
    type: Array,
    required: [false, `specify surgery history`],
  },
  clinicalVisits: {
    type: Array,
    required: [false, `specify clinical visits`],
  },
  medicalTests: {
    type: Array,
    required: [false, `specify medical tests`],
  }
});

// familyMember schema or structure
const familyMemberSchema = mongoose.Schema({
  familyMemberId: {
    type: String,
    unique: true,
  },
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
    type: Date,
    required: [true, `please provide valid birthdate`],
  },
  gender: {
    type: String,
    required: [true, `please provide valid gender`],
  },
  relationshipToBeneficiary: {
    type: String,
    enum: ['self', 'father', 'mother', 'wife', 'husband', 'daughter', 'son'],
    required: [true, `please specify relationship to the main beneficiary `],
  },  
  medicalFiles: {
    type: medicalFileSchema,
    required: [false, `please provide valid family member `],
  },
});

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
    type: Date,
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
    type: [familyMemberSchema],
    required: [false, `please provide valid family member `],
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
