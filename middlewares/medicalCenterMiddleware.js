// importing medicalCenter collection for querying database
const medicalCenter = require(`../schemas/medicalCenterSchema`);
// api/ logic for medicalCenter creation
const createmedicalCenter = async (req, res) => {
  try {
    const allDocument = await medicalCenter.find({});
    if (allDocument.length === 0) {
      const document = await medicalCenter.create({
        ...req.body,
        medicalCenterId: `MC-1`,
        sd: 1,
      });
      delete document._doc.sd;
      res.status(200).json(document._doc);
    } else {
      const lastDocument = allDocument[allDocument.length - 1];
      const idNumber = Number(lastDocument.medicalCenterId.split(`-`)[1]);
      const document = await medicalCenter.create({
        ...req.body,
        medicalCenterId: `MC-${idNumber + 1}`,
        sd: idNumber + 1,
      });
      delete document._doc.sd;
      res.status(200).json(document._doc);
    }
  } catch (error) {
    //   checking for server errors
    console.log(error);
    res.status(200).json({ msg: error.message });
  }
};

// api/ logic for getting a medicalCenter
const singlemedicalCenter = async (req, res) => {
  try {
    const document = await medicalCenter.find(req.params).lean();
    if (document.length === 0) {
      return res.status(404).json({ msg: `document not found` });
    }
    document.forEach((each) => {
      delete each.sd;
    });
    res.status(200).json(document);
  } catch (error) {
    //   checking for server errors
    console.log(error);
    res.status(200).json({ msg: error.message });
  }
};

// api/ logic for updating a medicalCenter
const updatemedicalCenter = async (req, res) => {
  try {
    const document = await medicalCenter
      .findOneAndUpdate(req.params, req.body, {
        new: true,
      })
      .lean();
    if (!document) {
      return res.status(404).json({ msg: `document not found` });
    }
    const documentArray = [document];
    documentArray.forEach((each) => {
      delete each.sd;
    });
    res.status(200).json(document);
  } catch (error) {
    //   checking for server errors
    console.log(error);
    res.status(200).json({ msg: error.message });
  }
};

// api/ logic for updating a medicalCenter
const deletemedicalCenter = async (req, res) => {
  try {
    const document = await medicalCenter.findOneAndDelete(req.params);
    if (!document) {
      return res.status(404).json({ msg: `document not found` });
    }
    res.status(200).json({ msg: `successfully Deleted` });
  } catch (error) {
    //   checking for server errors
    console.log(error);
    res.status(200).json({ msg: error.message });
  }
};

// api/ logic for getting all medicalCenter
const allmedicalCenter = async (req, res) => {
  try {
    const limitQuery = req.query.limit;
    let medicalCenterIdQuery = req.query.starting_after_object;
    const cityId = req.query.city;

    const limit = Number(limitQuery);
    if (!medicalCenterIdQuery) {
      medicalCenterIdQuery = `MCI-0`;
    }
    if (!medicalCenterIdQuery.startsWith(`MCI-`)) {
      return res.status(404).json({
        msg: `medicalCenter not found, check your starting_after_object input`,
      });
    }

    let medicalCenterId = Number(medicalCenterIdQuery.split(`-`)[1]);
    let city = cityId;

    if (limit > 100 || limit < 1) {
      limit = 30;
    }

    // logic checking for city query parameters
    if (!city) {
      const totalmedicalCenter = await medicalCenter.find({
        sd: { $gt: medicalCenterId },
      });
      let object = await medicalCenter
        .find({
          sd: {
            $gt: medicalCenterId,
          },
        })
        .limit(!limit ? 30 : limit);
      if (object.length === 0) {
        return res.status(404).json({
          msg: `medicalCenter not found`,
        });
      }
      object.forEach((object) => {
        delete object._doc.sd;
      });

      res.status(200).json({
        object,
        objectCount: totalmedicalCenter.length,
        hasMore: object.length >= totalmedicalCenter.length ? false : true,
      });
    }

    // logic checking for city query parameters
    if (city) {
      const totalmedicalCenter = await medicalCenter.find({
        sd: { $gt: medicalCenterId },
        city: city,
      });
      let object = await medicalCenter
        .find({
          sd: {
            $gt: medicalCenterId,
          },
          city: city,
        })
        .limit(!limit ? 30 : limit);
      if (object.length === 0) {
        return res.status(404).json({
          msg: `medicalCenter not found`,
        });
      }
      object.forEach((object) => {
        delete object._doc.sd;
      });

      res.status(200).json({
        object,
        objectCount: totalmedicalCenter.length,
        hasMore: object.length >= totalmedicalCenter.length ? false : true,
      });
    }
  } catch (error) {
    //   checking for server errors
    console.log(error);
    res.status(200).json({ msg: error.message });
  }
};

module.exports = {
  createmedicalCenter,
  singlemedicalCenter,
  updatemedicalCenter,
  deletemedicalCenter,
  allmedicalCenter,
};
