// importing city collection for querying dataBase
const cityName = require(`../schemas/citySchema`);

// api for adding city
const createCity = async (req, res) => {
  try {
    const document = await cityName.create(req.body);
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for getting cities
const allCity = async (req, res) => {
  try {
    const document = await cityName.find({}).lean();
    if (document.length === 0) {
      return res.status(404).json({ msg: `City not found` });
    }
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { createCity, allCity };
