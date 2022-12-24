const mongoose = require(`mongoose`);

const cityNameSchema = mongoose.Schema({
  cityName: {
    type: Array,
    required: [true, `please provide valid city name`],
  },
});

const cityName = mongoose.model(`city`, cityNameSchema);

module.exports = cityName;
