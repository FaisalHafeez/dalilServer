// importing doctor collection for querying database
const doctor = require(`../schemas/doctorSchema`);
// api/ logic for doctor creation
const createDoctor = async (req, res) => {
  try {
    const allDocument = await doctor.find({});
    if (allDocument.length === 0) {
      const document = await doctor.create({
        ...req.body,
        doctorId: `DOC-1`,
        sd: 1,
      });
      delete document._doc.sd;
      res.status(200).json(document._doc);
    } else {
      const lastDocument = allDocument[allDocument.length - 1];
      const idNumber = Number(lastDocument.doctorId.split(`-`)[1]);
      const document = await doctor.create({
        ...req.body,
        doctorId: `DOC-${idNumber + 1}`,
        sd: idNumber + 1,
      });
      delete document._doc.sd;
      res.status(200).json(document._doc);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for getting a single doctor
const singleDoctor = async (req, res) => {
  try {
    const document = await doctor.find(req.params).lean();
    if (document.length === 0) {
      return res.status(404).json({ msg: `document not found` });
    }
    document.forEach((each) => {
      delete each.sd;
    });
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for updating a single doctor
const updateDoctor = async (req, res) => {
  try {
    const document = await doctor
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
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for deleting a single doctor
const deleteDoctor = async (req, res) => {
  try {
    const document = await doctor.findOneAndDelete(req.params);
    if (!document) {
      return res.status(404).json({ msg: `document not found` });
    }
    res.status(200).json({ msg: `successfully Deleted` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for getting all  doctors
const allDoctor = async (req, res) => {
  try {
    const limitQuery = req.query.limit;
    let doctorIdQuery = req.query.starting_after_object;
    const specialtyId = req.query.specialty;

    const limit = Number(limitQuery);
    if (!doctorIdQuery) {
      doctorIdQuery = `DOC-0`;
    }
    if (!doctorIdQuery.startsWith(`DOC-`)) {
      return res.status(404).json({
        msg: `doctor not found, check your starting_after_object input`,
      });
    }

    let doctorId = Number(doctorIdQuery.split(`-`)[1]);
    let specialty = specialtyId;

    if (limit > 100 || limit < 1) {
      limit = 30;
    }

    // logic checking for specialty query parameters
    if (!specialty) {
      const totalDoctor = await doctor.find({
        sd: { $gt: doctorId },
      });
      let object = await doctor
        .find({
          sd: {
            $gt: doctorId,
          },
        })
        .limit(!limit ? 30 : limit);
      if (object.length === 0) {
        return res.status(404).json({
          msg: `doctor not found`,
        });
      }
      object.forEach((object) => {
        delete object._doc.sd;
      });

      res.status(200).json({
        object,
        objectCount: totalDoctor.length,
        hasMore: object.length >= totalDoctor.length ? false : true,
      });
    }

    // logic checking for specialty query parameters
    if (specialty) {
      const totalDoctor = await doctor.find({
        sd: { $gt: doctorId },
        specialty: specialty,
      });
      let object = await doctor
        .find({
          sd: {
            $gt: doctorId,
          },
          specialty: specialty,
        })
        .limit(!limit ? 30 : limit);
      if (object.length === 0) {
        return res.status(404).json({
          msg: `doctor not found`,
        });
      }
      object.forEach((object) => {
        delete object._doc.sd;
      });

      res.status(200).json({
        object,
        objectCount: totalDoctor.length,
        hasMore: object.length >= totalDoctor.length ? false : true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createDoctor,
  singleDoctor,
  updateDoctor,
  deleteDoctor,
  allDoctor,
};
