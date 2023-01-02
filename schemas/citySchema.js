const mongoose = require(`mongoose`);

const cityNameSchema = mongoose.Schema({
  cityName: {
    type: String,
    required: [true, `please provide valid city name`],
  },
});

const cityName = mongoose.model(`city`, cityNameSchema);

module.exports = cityName;
