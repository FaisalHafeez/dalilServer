// importing specialty collection for querying dataBase
const specialtyName = require(`../schemas/medicalSpecialtySchema`);
// api for adding medicalSpecialty
const createmedicalSpecialty = async (req, res) => {
  try {
    const document = await specialtyName.create(req.body);
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for getting medicalSpecialty
const allmedicalSpecialty = async (req, res) => {
  try {
    const documents = await specialtyName.find({}, {medicalSpecialtyName:1, _id:0}).lean();
    if (documents.length === 0) {
      return res.status(404).json({ statusCode: "404", message: `Empty medical specialty list` });
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
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { createmedicalSpecialty, allmedicalSpecialty };
