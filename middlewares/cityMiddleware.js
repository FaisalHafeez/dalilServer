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
    const documents = await cityName.find({} , {cityName:1, _id:0}).lean();
    if (documents.length === 0) {
      return res.status(404).json({ statusCode: "404", message: `Empty city list` });
    }

    const responseBody = {
      codeStatus: "200",
      message: "good",
      data: {
        objectCount: documents.length,
        objectArray: documents
      }
    };

    res.status(200).json({...responseBody});
  } catch (error) {
    console.log(error);
    res.status(500).json({ statusCode: "404", message: error.message  });
  }
};

module.exports = { createCity, allCity };
