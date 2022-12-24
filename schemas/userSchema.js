// importing mongoose dependency for user schema and model creation
const mongoose = require(`mongoose`);

// user schema or structure
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, `please provide valid username`],
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, `please provide valid phoneNumber`],
  },
  phoneAuthenticated: Boolean,
  whatsAppNumber: String,

  beneficiary: {
    hasBeneficiary: {
      type: Boolean,
      required: true,
    },
    beneficiaryId: {
      type: String,
      unique: true,
    },
  },
  password: {
    type: String,
    required: [true, `please provide valid password`],
  },
  userId: {
    type: String,
    unique: true,
  },
  sd: {
    type: Number,
    unique: true,
  },
});

const user = mongoose.model(`user`, userSchema);

/// exporting user model to usermiddleware for querying user collection
module.exports = user;
