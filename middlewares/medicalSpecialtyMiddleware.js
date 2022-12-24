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
    const document = await specialtyName.find({}).lean();
    if (document.length === 0) {
      return res.status(404).json({ msg: `medicalSpecialties not found` });
    }
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { createmedicalSpecialty, allmedicalSpecialty };
