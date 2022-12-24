// importing mongoose
const mongoose = require(`mongoose`);

const loginSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, `please provide valid user name`],
  },
  password: {
    type: String,
    required: [true, `please provide valid password`],
  },
});

const login = mongoose.model(`login`, loginSchema);

module.exports = login;
