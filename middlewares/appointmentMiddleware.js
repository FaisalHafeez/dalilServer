//importing appointments collection
// const { find } = require("../schemas/appointmentSchema");
const appointment = require(`../schemas/appointmentSchema`);
const medicalCenter = require(`../schemas/medicalCenterSchema`);
const doctor = require(`../schemas/doctorSchema`);
const schedule = require(`../schemas/scheduleSchema`);
// importing dependencies
const mongo = require('mongodb');
const mongoose = require(`mongoose`);
// api for creating appointment
const createAppointment = async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    // const idNumber = Number(userId.split(`-`)[1]);
    // const doc = await appointment.find({});
    // // const appointmentDoc = await appointment.find(req.params);
    if (req.params.userId !== userId) {
      return res.status(401).json({ msg: `Not Authorized` });
    }

    const medicalCenterObject = await medicalCenter.findOne({medicalCenterId: req.body.medicalCenterId}).lean();
    const doctorObject = await doctor.findOne({doctorId: req.body.doctorId}).lean();
    const scheduleObject = await schedule.findOne({scheduleId: req.body.scheduleId}).lean();


    const document = await appointment.create({
      ...req.body,
      userId: req.params.userId,
      appointmentStatus: `pending`,
      appointmentId: new mongoose.Types.ObjectId(),
      dateCreated: Date(),
      medicalCenterObject: medicalCenterObject,
      doctorObject: doctorObject,
      scheduleObject: scheduleObject
    });

    let msg = "good";
    const responseBody = {
      codeStatus: "200",
      message: msg,
      data: document
    };

    return res.status(200).json({...responseBody});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// api for updating appointment
const updateAppointment = async (req, res) => {
  try {
    const document = await appointment
      .findOneAndUpdate(
        {
          appointmentId: req.params.appointmentId,
          userId: res.locals.user.userId,
        },
        {
          ...req.body,
          lastUpdateDate: Date(),
        },
        {
          new: true,
        }
      )
      .lean();
    if (!document) {
      return res.status(404).json({ msg: `document not found` });
    }

    const response = await appointment
      .aggregate([
        {
          $match: {
            appointmentId: req.params.appointmentId,
            userId: document.userId,
          },
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
    response.forEach((each) => {
      delete each.sd;
    });
    res.status(200).json(response[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

const specificAppointment = async (req, res) => {
  try {

    const bookedQP = req.query.booked ?? "true";
    const cancelledQP = req.query.cancelled ?? "true";
    const rejectedQP = req.query.rejected ?? "true";
    const completedQP = req.query.completed ?? "true";
    const pendingQP = req.query.pending ?? "true";
    const starting_after_objectQP = req.query.starting_after_object;
    const limitQP = Number(req.query.limit) ?? 30;

    let bookingStatusQP = [];
    if(bookedQP === "true")bookingStatusQP.push("booked");
    if(cancelledQP === "true")bookingStatusQP.push("cancelled");
    if(rejectedQP === "true")bookingStatusQP.push("rejected");
    if(completedQP === "true")bookingStatusQP.push("completed");
    if(pendingQP === "true")bookingStatusQP.push("pending");

    // console.log(bookingStatusQP);

    let query = {};
    query['$and']=[];
    query["$and"].push({"userId": {$eq: req.params.userId}});
    query["$and"].push({"appointmentStatus": {$in: bookingStatusQP}});


    let objectCount = 0;
    let hasMore = true;

    if (query["$and"].length === 0) {      
      objectCount = await appointment.find({},).countDocuments();
      if (starting_after_objectQP) query["$and"].push({appointmentId: {$gt: starting_after_objectQP}});
      documents = await appointment.find({},).sort({appointmentId: 1, _id: 1}).limit(limitQP).lean();
      lastDocument = await appointment.findOne(query,).sort({appointmentId: -1, _id: -1}).lean();
        
    }else {      
      objectCount = await appointment.find(query,).countDocuments();      
      if (starting_after_objectQP) query["$and"].push({"appointmentId": {$gt: starting_after_objectQP}});
      documents = await appointment.find(query,).sort({appointmentId: 1, _id: 1}).limit(limitQP).lean();
      lastDocument = await appointment.findOne(query,).sort({appointmentId: -1, _id: -1}).lean();      
    }
    // console.log(lastDocument.appointmentId)
    console.log("length is " + documents.length)
    // console.log(documents[0])
    documents.forEach((document) => {
      if (document.appointmentId.equals(lastDocument.appointmentId)) hasMore = false;
    });


    let msg = "good"
    if (documents.length === 0){
      msg = "list is empty change your query";
      hasMore = false;
    }

    const responseBody = {
      codeStatus: "200",
      message: msg,
      data: {
        objectCount: objectCount,
        hasMore,
        objectArray: documents
      }
    };

    res.status(200).json({...responseBody});
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

const doctorAppointmentSummaries = async (req, res) => {
  try {
    const bookedQP = req.query.booked ?? "true";
    //! Done
    //? Used MongoDB's $project and $group stages in the aggregate() pipeline to minimize the code and make it more performant.
    let query = {
      doctorId: req.params.doctorId,
    };

    if (bookedQP === "true") {
      query.bookingStatus = "booked";
    }

    const documents = await appointment.aggregate([
      {
        //?$match stage to filter the documents based on the booked query parameter and doctorId parameter.
        $match: query,
      },
      {
        //? $lookup stages to join the appointment collection with medicalcenters and doctors collection.
        $lookup: {
          from: "medicalcenters",
          localField: "medicalCenterId",
          foreignField: "medicalCenterId",
          as: "medicalCenterObject",
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "doctorId",
          as: "doctorObject",
        },
      },

      //?$project stage is used to select only the required fields from the documents. `
      {
        $project: {
          medicalCenterId: "$medicalCenterId",
          medicalCenterName: "$medicalCenterObject.name",
          //? MAYBE (can be enabled in future if needed)
          //* The appointmentDate field is already included in the $match stage, so it's not needed to be included again in the $project stage.
          // appointmentDate: '$appointmentDate',
          //* Same goes for $slot
          // slot: '$slot'
        },
      },
      {
        $group: {
          _id: {
            medicalCenterId: "$medicalCenterId",
            medicalCenterName: "$medicalCenterName",
          },
          dates: {
            $push: {
              date: "$appointmentDate",
              slot: "$slot",
            },
          },
        },
      },
      {
        $unwind: "$dates",
      },
      {
        $group: {
          _id: {
            medicalCenterId: "$_id.medicalCenterId",
            medicalCenterName: "$_id.medicalCenterName",
          },
          expectedVisits: {
            $push: {
              date: "$dates.date",
              morningSlot: {
                $sum: {
                  $cond: [{ $eq: ["$dates.slot", "morning"] }, 1, 0],
                },
              },
              afternoonSlot: {
                $sum: {
                  $cond: [{ $eq: ["$dates.slot", "afternoon"] }, 1, 0],
                },
              },
              eveningSlot: {
                $sum: {
                  $cond: [{ $eq: ["$dates.slot", "evening"] }, 1, 0],
                },
              },
            },
          },
        },
      },
    ]);

    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No records found",
      });
    }

    let objectCount = documents.length;
    let hasMore = false;

    let theSummary = documents.map((doc) => {
      return {
        medicalCenterId: doc._id.medicalCenterId,
        medicalCenterName: doc._id.medicalCenterName,
        expectedVisits: doc.expectedVisits,
      };
    });

    return res.json({
      statusCode: 200,
      message: "success",
      data: {
        objectCount,
        hasMore,
        objectArray: theSummary,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      statusCode: 500,
      message: "Server Error",
    });
  }
};


// getting all appointments
const allAppointments = async (req, res) => {
  try {
    const bookedQP = req.query.booked ?? true;
    const cancelledQP = req.query.cancelled ?? true;
    const rejectedQP = req.query.rejected ?? true;
    const completedQP = req.query.completed ?? true;
    const pendingQP = req.query.pending ?? true;
    const medicalCenterIdQP = req.query.medicalCenterId;
    const starting_after_objectQP = req.query.starting_after_object;
    const limitQP = Number(req.query.limit) ?? 30;
    const fromDateQP = req.query.fromDate;
    const toDateQP = req.query.toDate;

    let bookingStatusQP = [];
    if(bookedQP){
      bookingStatusQP.push("booked");
    }
    if(cancelledQP){
      bookingStatusQP.push("cancelled");
    }
    if(rejectedQP){
      bookingStatusQP.push("rejected");
    }
    if(completedQP){
      bookingStatusQP.push("completed");
    }
    if(pendingQP){
      bookingStatusQP.push("pending");
    }
    
  //   if (toDate) {
  //     const dateMilliseconds = new Date(toDate).valueOf();
  //     if (!dateMilliseconds) {
  //       return res.status(200).json({ msg: `Invalid date inputed` });
  //     }
  //     const document = await appointment.find({
  //       dateCreatedMilliSeconds: { $lte: dateMilliseconds },
  //     });
  //     const documents = await appointment
  //       .find({
  //         dateCreatedMilliSeconds: { $lte: dateMilliseconds },
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (fromDate) {
  //     const dateMilliseconds = new Date(fromDate).valueOf();
  //     if (!dateMilliseconds) {
  //       return res.status(200).json({ msg: `Invalid date inputed` });
  //     }

  //     const document = await appointment.find({
  //       dateCreatedMilliSeconds: { $gte: dateMilliseconds },
  //     });
  //     const documents = await appointment
  //       .find({
  //         dateCreatedMilliSeconds: { $gte: dateMilliseconds },
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (medicalCenterId) {
  //     const document = await appointment.find({
  //       "medicalcenter.medicalCenterId": medicalCenterId,
  //     });
  //     const documents = await appointment
  //       .find({
  //         "medicalcenter.medicalCenterId": medicalCenterId,
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (starting_after_object) {
  //     const aid = Number(starting_after_object.split(`-`)[1]);
  //     const document = await appointment.find({
  //       aid: { $gt: aid },
  //     });
  //     const documents = await appointment
  //       .find({
  //         aid: { $gt: aid },
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (cancelled) {
  //     const document = await appointment.find({
  //       appointmentStatus: cancelled,
  //     });
  //     const documents = await appointment
  //       .find({
  //         appointmentStatus: cancelled,
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (rejected) {
  //     const document = await appointment.find({
  //       appointmentStatus: rejected,
  //     });
  //     const documents = await appointment
  //       .find({
  //         appointmentStatus: rejected,
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (completed) {
  //     const document = await appointment.find({
  //       appointmentStatus: completed,
  //     });
  //     const documents = await appointment
  //       .find({
  //         appointmentStatus: completed,
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (pending) {
  //     const document = await appointment.find({
  //       appointmentStatus: pending,
  //     });
  //     const documents = await appointment
  //       .find({
  //         appointmentStatus: pending,
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   if (booked) {
  //     const document = await appointment.find({
  //       appointmentStatus: booked,
  //     });
  //     const documents = await appointment
  //       .find({
  //         appointmentStatus: booked,
  //       })
  //       .limit(limit ? limit : 30);
  //     if (documents.length === 0) {
  //       return res.status(404).json({ msg: `appointments not found` });
  //     }
  //     return res.status(200).json({
  //       documents,
  //       objectCount: document.length,
  //       hasMore: document.length > documents.length ? true : false,
  //     });
  //   }
  //   const documents = await appointment.find({});
  //   const allDoc = await appointment.find({}).limit(limit ? limit : 30);
  //   if (!allDoc) {
  //     res.status(404).json({ msg: `appointments not found` });
  //   }
  //   res.status(200).json({
  //     allDoc,
  //     objectCount: documents.length,
  //     hasMore: documents.length > allDoc.length ? true : false,
  //   });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createAppointment,
  updateAppointment,
  specificAppointment,
  doctorAppointmentSummaries,
  allAppointments,
};
