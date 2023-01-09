//importing appointments collection
const { find } = require("../schemas/appointmentSchema");
const appointment = require(`../schemas/appointmentSchema`);
// importing dependencies
const mongo = require('mongodb');
const mongoose = require(`mongoose`);
// api for creating appointment
const createAppointment = async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const idNumber = Number(userId.split(`-`)[1]);
    const doc = await appointment.find({});
    // const appointmentDoc = await appointment.find(req.params);
    if (req.params.userId !== userId) {
      return res.status(401).json({ msg: `Not Authorized` });
    }


    const document = await appointment.create({
      ...req.body,
      userId: req.params.userId,
      appointmentStatus: `pending`,
      appointmentId: new mongoose.Types.ObjectId(),
      dateCreated: Date(),
    });   

    const aggDocument = await appointment
        .aggregate([
          {
            $match: { _id: document._id },
          },
          {
            $lookup: {
              from: `medicalcenters`,
              localField: `medicalCenterId`,
              foreignField: `medicalCenterId`,
              as: `medicalCenterObject`,
            }
          },
          // {
          //   $lookup: {
          //     from: `doctors`,
          //     localField: `doctorId`,
          //     foreignField: `doctorId`,
          //     as: `doctorObject`,
          //   }
          // }
          // {
          //   $lookup: {
          //     from: `schedules`,
          //     localField: `scheduleId`,
          //     foreignField: `scheduleId`,
          //     as: `scheduleObject`,
          //   }
          // }
        ]);

        aggDocument.forEach((aggDocument) => {
          delete aggDocument._id;
          delete aggDocument.appointmentId;
          aggDocument.medicalCenterObject = aggDocument.medicalCenterObject[0];
          delete aggDocument.medicalCenterObject._id;
          delete aggDocument.medicalCenterObject.created;
          delete aggDocument.medicalCenterObject.updated;
          // aggDocument.doctorObject = aggDocument.doctorObject[0];
          // aggDocument.scheduleObject = aggDocument.scheduleObject[0];

        });

    console.log(aggDocument[0]);
    const newDocument = await appointment.findOneAndReplace(
      { _id: document._id },
      aggDocument[0]
    );


    return res.status(200).json({
      document
    });
    // if (doc.length === 0) {
    //   const document = await appointment.create({
    //     ...req.body,
    //     userId: req.params.userId,
    //     timeslot: `pending`,
    //     price: `pending`,
    //     appointmentStatus: `pending`,
    //     appointmentId: `AP-${1}`,
    //     aid: 1,
    //     dateCreated: Date(),
    //     dateCreatedMilliSeconds: new Date().valueOf(),
    //   });
    //   const test = await appointment
    //     .aggregate([
    //       {
    //         $match: { _id: document._id },
    //       },
    //       {
    //         $lookup: {
    //           from: `medicalcenters`,
    //           localField: `medicalCenterId`,
    //           foreignField: `medicalCenterId`,
    //           as: `medicalcenter`,
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: `doctors`,
    //           localField: `doctorId`,
    //           foreignField: `doctorId`,
    //           as: `doctor`,
    //         },
    //       },
    //     ])
    //     .exec();
    //   const newDoc = await appointment.findOneAndReplace(
    //     { _id: document._id },
    //     test[0]
    //   );
    //   console.log(newDoc);
    //   res.status(200).json(test[0]);
    // } else {
    //   const lastappointmentDoc = doc[doc.length - 1];
    //   const idNumber = Number(lastappointmentDoc.appointmentId.split(`-`)[1]);
    //   const document = await appointment.create({
    //     ...req.body,
    //     userId: req.params.userId,
    //     timeslot: `pending`,
    //     price: `pending`,
    //     appointmentStatus: `pending`,
    //     appointmentId: `AP-${idNumber + 1}`,
    //     aid: idNumber + 1,
    //     dateCreated: Date(),
    //     dateCreatedMilliSeconds: new Date().valueOf(),
    //   });
    //   const test = await appointment
    //     .aggregate([
    //       {
    //         $match: { _id: document._id },
    //       },
    //       {
    //         $lookup: {
    //           from: `medicalcenters`,
    //           localField: `medicalCenterId`,
    //           foreignField: `medicalCenterId`,
    //           as: `medicalcenter`,
    //         },
    //       },
    //       {
    //         $lookup: {
    //           from: `doctors`,
    //           localField: `doctorId`,
    //           foreignField: `doctorId`,
    //           as: `doctor`,
    //         },
    //       },
    //     ])
    //     .exec();
    //   const newDoc = await appointment.findOneAndReplace(
    //     { _id: document._id },
    //     test[0]
    //   );
    //   res.status(200).json(test[0]);
    // }
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

    let bookedQP = req.query.booked ?? "true";
    let cancelledQP = req.query.cancelled ?? "true";
    let rejectedQP = req.query.rejected ?? "true";
    let completedQP = req.query.completed ?? "true";
    let pendingQP = req.query.pending ?? "true";
    let medicalCenterIdQP = req.query.medicalCenterId;
    let starting_after_objectQP = req.query.starting_after_object;
    let limitQP = Number(req.query.limit) ?? 30;
    let fromDateQP = req.query.fromDate;
    let toDateQP = req.query.toDate;

    let bookingStatusQP = [];
    if(bookedQP === "true"){
      bookingStatusQP.push("booked");
    }
    if(cancelledQP === "true"){
      bookingStatusQP.push("cancelled");
    }
    if(rejectedQP === "true"){
      bookingStatusQP.push("rejected");
    }
    if(completedQP === "true"){
      bookingStatusQP.push("completed");
    }

    if(pendingQP === "true"){
      console.log("this is true");
      bookingStatusQP.push("pending");
    }

    console.log(bookingStatusQP);

    let query = {};
    query['$and']=[];
    query["$and"].push({"userId": {$eq: req.params.userId}});
    query["$and"].push({"appointmentStatus": {$in: bookingStatusQP}});


    let objectCount = 0;

    if (query["$and"].length === 0) { 
      documents = await appointment.find({},).limit(limitQP).lean();

      objectCount = await appointment.find({},).countDocuments();
        
    }else {
      documents = await appointment.find(query,).limit(limitQP).lean();

        objectCount = await appointment.find(query,).countDocuments();
    }


    const responseBody = {
      codeStatus: "200",
      message: "good",
      data: {
        objectCount: objectCount,
        hasMore: false,
        objectArray: documents
      }
    };

    res.status(200).json({...responseBody});

    // const booked = req.query.booked;
    // const cancelled = req.query.cancelled;
    // const rejected = req.query.rejected;
    // const completed = req.query.completed;
    // const pending = req.query.pending;
    // const limitQuery = req.query.limit;
    // const limit = Number(limitQuery);
    // if (pending) {
    //   const document = await appointment.find({
    //     userId: req.params.userId,
    //     appointmentStatus: pending,
    //   });
    //   const documents = await appointment
    //     .find({
    //       userId: req.params.userId,
    //       appointmentStatus: pending,
    //     })
    //     .limit(limit ? limit : 30);
    //   if (documents.length === 0) {
    //     return res.status(404).json({ msg: `appointments not found` });
    //   }
    //   return res.status(200).json({
    //     documents,
    //     objectCount: document.length,
    //     hasMore: document.length > documents.length ? true : false,
    //   });
    // }
    // if (booked) {
    //   const document = await appointment.find({
    //     userId: req.params.userId,
    //     appointmentStatus: booked,
    //   });
    //   const documents = await appointment
    //     .find({
    //       userId: req.params.userId,
    //       appointmentStatus: booked,
    //     })
    //     .limit(limit ? limit : 30);
    //   if (documents.length === 0) {
    //     return res.status(404).json({ msg: `appointments not found` });
    //   }
    //   return res.status(200).json({
    //     documents,
    //     objectCount: document.length,
    //     hasMore: document.length > documents.length ? true : false,
    //   });
    // }
    // if (cancelled) {
    //   const document = await appointment.find({
    //     userId: req.params.userId,
    //     appointmentStatus: cancelled,
    //   });
    //   const documents = await appointment
    //     .find({
    //       userId: req.params.userId,
    //       appointmentStatus: cancelled,
    //     })
    //     .limit(limit ? limit : 30);
    //   if (documents.length === 0) {
    //     return res.status(404).json({ msg: `appointments not found` });
    //   }
    //   return res.status(200).json({
    //     documents,
    //     objectCount: document.length,
    //     hasMore: document.length > documents.length ? true : false,
    //   });
    // }
    // if (rejected) {
    //   const document = await appointment.find({
    //     userId: req.params.userId,
    //     appointmentStatus: rejected,
    //   });
    //   const documents = await appointment
    //     .find({
    //       userId: req.params.userId,
    //       appointmentStatus: rejected,
    //     })
    //     .limit(limit ? limit : 30);
    //   if (documents.length === 0) {
    //     return res.status(404).json({ msg: `appointments not found` });
    //   }
    //   return res.status(200).json({
    //     documents,
    //     objectCount: document.length,
    //     hasMore: document.length > documents.length ? true : false,
    //   });
    // }
    // if (completed) {
    //   const document = await appointment.find({
    //     userId: req.params.userId,
    //     appointmentStatus: completed,
    //   });
    //   const documents = await appointment
    //     .find({
    //       userId: req.params.userId,
    //       appointmentStatus: completed,
    //     })
    //     .limit(limit ? limit : 30);
    //   if (documents.length === 0) {
    //     return res.status(404).json({ msg: `appointments not found` });
    //   }
    //   return res.status(200).json({
    //     documents,
    //     objectCount: document.length,
    //     hasMore: document.length > documents.length ? true : false,
    //   });
    // }
    // const document = await appointment.find(req.params);
    // const documents = await appointment
    //   .find(req.params)
    //   .limit(limit ? limit : 30);
    // if (documents.length === 0) {
    //   return res.status(404).json({ msg: `appointments not found` });
    // }
    // res.status(200).json({
    //   documents,
    //   objectCount: document.length,
    //   hasMore: document.length > documents.length ? true : false,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
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


  //   const limit = Number(limitQuery);
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
  allAppointments,
};
