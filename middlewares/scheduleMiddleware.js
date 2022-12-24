//importing appointments collection
const { find } = require("../schemas/scheduleSchema");
const schedule = require(`../schemas/scheduleSchema`);
// importing dependencies

// api for creating schedule
const createSchedule = async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const idNumber = Number(userId.split(`-`)[1]);
    const doc = await schedule.find({});
    if (doc.length === 0) {
      const document = await schedule.create({
        ...req.body,
        scheduleId: `SCH-${1}`,
        sid: 1,
        isActive: true,
        dateCreated: Date(),
        dateCreatedMilliSeconds: new Date().valueOf(),
      });

      const test = await schedule
        .aggregate([
          {
            $match: { _id: document._id },
          },
          {
            $lookup: {
              from: `medicalcenters`,
              localField: `medicalCenterId`,
              foreignField: `medicalCenterId`,
              as: `medicalcenter`,
            },
          },
          {
            $lookup: {
              from: `doctors`,
              localField: `doctorId`,
              foreignField: `doctorId`,
              as: `doctor`,
            },
          },
        ])
        .exec();
      test.forEach((each) => {
        delete each._id;
      });
      console.log(document, test[0].doctor);
      const newDoc = await schedule.findOneAndReplace(
        { _id: document._id },
        test[0],
        {
          new: true,
        }
      );

      res.status(200).json(newDoc);
    } else {
      let lastDoc = doc[doc.length - 1];
      const changedId = Number(lastDoc.scheduleId.split(`-`)[1]);
      const document = await schedule.create({
        ...req.body,
        scheduleId: `SCH-${changedId + 1}`,
        sid: changedId + 1,
        isActive: true,
        dateCreated: Date(),
        dateCreatedMilliSeconds: new Date().valueOf(),
      });

      const test = await schedule
        .aggregate([
          {
            $match: { _id: document._id },
          },
          {
            $lookup: {
              from: `medicalcenters`,
              localField: `medicalCenterId`,
              foreignField: `medicalCenterId`,
              as: `medicalcenter`,
            },
          },
          {
            $lookup: {
              from: `doctors`,
              localField: `doctorId`,
              foreignField: `doctorId`,
              as: `doctor`,
            },
          },
        ])
        .exec();
      test.forEach((each) => {
        delete each._id;
      });
      console.log(document, test[0].doctor);
      const newDoc = await schedule.findOneAndReplace(
        { _id: document._id },
        test[0],
        {
          new: true,
        }
      );

      res.status(200).json(newDoc);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for updating schedule
const updateSchedule = async (req, res) => {
  try {
    const document = await schedule
      .findOneAndUpdate(
        req.params,
        {
          ...req.body,
          lastUpdateDate: Date(),
        },
        { new: true }
      )
      .lean();
    if (!document) {
      return res.status(404).json({ msg: `schedule not found` });
    }
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

const specificSchedule = async (req, res) => {
  try {
    const document = await schedule.findOne(req.params).lean();
    if (!document) {
      return res.status(404).json({ msg: `schedule not found` });
    }
    res.status(200).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// getting all schedules
const allSchedule = async (req, res) => {
  try {
    const city = req.query.city;
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const doctorId = req.query.doctorId;
    const medicalCenterIdQuery = req.query.medicalCenterId;
    // const sortBy = req.query.sortBy;
    const specialtyQuery = req.query.specialty;
    const scheduleIdquery = req.query.starting_after_object;
    const timeslot = req.query.timeslot;
    let limit = req.query.limit;
    if (limit) {
      limit = Number(limit);
      if (limit > 100 || limit < 1) {
        limit = 30;
      }
    }
    if (toDate) {
      const dateMilliseconds = new Date(toDate).valueOf();
      if (!dateMilliseconds) {
        return res.status(200).json({ msg: `Invalid date inputed` });
      }
      const document = await appointment.find({
        dateCreatedMilliSeconds: { $lte: dateMilliseconds },
      });
      const documents = await appointment
        .find({
          dateCreatedMilliSeconds: { $lte: dateMilliseconds },
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    if (fromDate) {
      const dateMilliseconds = new Date(toDate).valueOf();
      if (!dateMilliseconds) {
        return res.status(200).json({ msg: `Invalid date inputed` });
      }
      const document = await appointment.find({
        dateCreatedMilliSeconds: { $gte: dateMilliseconds },
      });
      const documents = await appointment
        .find({
          dateCreatedMilliSeconds: { $gte: dateMilliseconds },
        })
        .limit(limit ? limit : 30);
      if (documents.length === 0) {
        return res.status(404).json({ msg: `appointments not found` });
      }
      return res.status(200).json({
        documents,
        objectCount: document.length,
        hasMore: document.length > documents.length ? true : false,
      });
    }
    // if (sortBy) {
    //   if (sortBy === doctorId) {
    //     const alldocument = await schedule
    //       .find({})
    //       .sort({ "doctor.doctorId": 1 });
    //     if (alldocument.length === 0) {
    //       return res.status(404).json({ msg: `schedules not found` });
    //     }
    //     const documents = await schedule
    //       .find({})
    //       .limit(limit ? limit : 0)
    //       .sort({ "doctor.doctorId": 1 });

    //     return res.status(200).json({
    //       documents,
    //       objectCount: alldocument.length,
    //       hasMore: alldocument.length > documents.length ? true : false,
    //     });
    //   }
    //   if (sortBy === medicalCenterId) {
    //     const alldocument = await schedule
    //       .find({})
    //       .sort({ "medicalcenter.medicalCenterId": 1 });
    //     if (alldocument.length === 0) {
    //       return res.status(404).json({ msg: `schedules not found` });
    //     }
    //     const documents = await schedule
    //       .find({})
    //       .limit(limit ? limit : 0)
    //       .sort({ "medicalcenter.medicalCenterId": 1 });
    //     return res.status(200).json({
    //       documents,
    //       objectCount: alldocument.length,
    //       hasMore: alldocument.length > documents.length ? true : false,
    //     });
    //   }
    // }
    if (specialtyQuery) {
      const alldocument = await schedule.find({
        "doctor.specialty": specialtyQuery,
      });
      if (alldocument.length === 0) {
        return res.status(404).json({ msg: `schedules not found` });
      }
      const documents = await schedule
        .find({
          "doctor.specialty": specialtyQuery,
        })
        .limit(limit ? limit : 0);
      return res.status(200).json({
        documents,
        objectCount: alldocument.length,
        hasMore: alldocument.length > documents.length ? true : false,
      });
    }
    if (medicalCenterIdQuery) {
      const alldocument = await schedule.find({
        "medicalcenter.medicalCenterId": medicalCenterIdQuery,
      });
      if (alldocument.length === 0) {
        return res.status(404).json({ msg: `schedules not found` });
      }
      const documents = await schedule
        .find({
          "medicalcenter.medicalCenterId": medicalCenterIdQuery,
        })
        .limit(limit ? limit : 0);
      return res.status(200).json({
        documents,
        objectCount: alldocument.length,
        hasMore: alldocument.length > documents.length ? true : false,
      });
    }
    if (city) {
      const alldocument = await schedule.find({
        "medicalcenter.city": city,
      });
      if (alldocument.length === 0) {
        return res.status(404).json({ msg: `schedules not found` });
      }
      const documents = await schedule
        .find({
          "medicalcenter.city": city,
        })
        .limit(limit ? limit : 0);
      return res.status(200).json({
        documents,
        objectCount: alldocument.length,
        hasMore: alldocument.length > documents.length ? true : false,
      });
    }
    if (doctorId) {
      const alldocument = await schedule.find({
        "doctor.doctorId": doctorId,
      });
      if (alldocument.length === 0) {
        return res.status(404).json({ msg: `schedules not found` });
      }
      const documents = await schedule
        .find({
          "doctor.doctorId": doctorId,
        })
        .limit(limit ? limit : 0);
      return res.status(200).json({
        documents,
        objectCount: alldocument.length,
        hasMore: alldocument.length > documents.length ? true : false,
      });
    }
    if (scheduleIdquery) {
      const alldocument = await schedule.find({
        sid: {
          $gt: Number(scheduleIdquery.split(`-`)[1]),
        },
      });
      if (alldocument.length === 0) {
        return res.status(404).json({ msg: `schedules not found` });
      }
      const documents = await schedule
        .find({
          scheduleId: scheduleIdquery,
        })
        .limit(limit ? limit : 0);
      return res.status(200).json({
        documents,
        objectCount: alldocument.length,
        hasMore: alldocument.length > documents.length ? true : false,
      });
    }
    if (timeslot) {
      const alldocument = await schedule.find({
        timeslot: timeslot,
      });
      if (alldocument.length === 0) {
        return res.status(404).json({ msg: `schedules not found` });
      }
      const documents = await schedule
        .find({
          timeslot: timeslot,
        })
        .limit(limit ? limit : 0);
      return res.status(200).json({
        documents,
        objectCount: alldocument.length,
        hasMore: alldocument.length > documents.length ? true : false,
      });
    }
    const alldocument = await schedule.find({});
    if (alldocument.length === 0) {
      return res.status(404).json({ msg: `schedules not found` });
    }
    const documents = await schedule.find({}).limit(limit ? limit : 0);
    res.status(200).json({
      documents,
      objectCount: alldocument.length,
      hasMore: alldocument.length > documents.length ? true : false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// deleting schedule
const deleteSchedule = async (req, res) => {
  try {
    const document = await schedule.findOneAndDelete(req.params).lean();
    if (!document) {
      return res.status(404).json({ msg: `schedule not found` });
    }
    res.status(200).json({ msg: `successfully deleted` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createSchedule,
  updateSchedule,
  specificSchedule,
  allSchedule,
  deleteSchedule,
};
