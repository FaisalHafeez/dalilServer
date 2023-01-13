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
      documents = await appointment.find({},).sort({appointmentId: 1}).limit(limitQP).lean();
      lastDocument = await appointment.findOne(query,).sort({appointmentId: -1}).lean();
        
    }else {      
      objectCount = await appointment.find(query,).countDocuments();      
      if (starting_after_objectQP) query["$and"].push({"appointmentId": {$gt: starting_after_objectQP}});
      documents = await appointment.find(query,).sort({appointmentId: 1}).limit(limitQP).lean();
      lastDocument = await appointment.findOne(query,).sort({appointmentId: -1}).lean();      
    }
    // console.log(lastDocument.appointmentId)
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
    // const cancelledQP = req.query.cancelled ?? "true";
    // const rejectedQP = req.query.rejected ?? "true";
    // const completedQP = req.query.completed ?? "true";
    // const pendingQP = req.query.pending ?? "true";
    // const starting_after_objectQP = req.query.starting_after_object;
    // const limitQP = Number(req.query.limit) ?? 30;

    let addDates = 10;

    const todaysDate = new Date('January 12, 2023');
    const futureDate = new Date('January 12, 2023');
    futureDate.setDate(futureDate.getDate() + addDates);

    let bookingStatusQP = [];
    if(bookedQP === "true")bookingStatusQP.push("booked");
    // if(cancelledQP === "true")bookingStatusQP.push("cancelled");
    // if(rejectedQP === "true")bookingStatusQP.push("rejected");
    // if(completedQP === "true")bookingStatusQP.push("completed");
    // if(pendingQP === "true")bookingStatusQP.push("pending");


    let query = {};
    query['$and']=[];
    query["$and"].push({"doctorId": {$eq: req.params.doctorId}});
    // query["$and"].push({"appointmentDate": {$gte: todaysDate.toISOString().split('T')[0]}});
    // query["$and"].push({"appointmentDate": {$lte: futureDate.toISOString().split('T')[0]}});

    // yourDate.toISOString().split('T')[0]

    documents = await appointment.aggregate([
      {
        $lookup: {
          from: `medicalcenters`,
          localField: `medicalCenterId`,
          foreignField: `medicalCenterId`,
          as: `medicalCenterObject`,
        },
      },
      {
        $lookup: {
          from: `doctors`,
          localField: `doctorId`,
          foreignField: `doctorId`,
          as: `doctorObject`,
        },
      },
      { $match: { 
        $and: query["$and"]
        }
      },
      { $group:
        {
          _id: "$medicalCenterId",
          medicalCenterId: {$first: "$medicalCenterId"},
          medicalCenterName: {$first: "$medicalCenterObject.name"},
          appointmentDates: { $addToSet: "$appointmentDate"},
          expectedVisits: {
            $push: {
              date: "$appointmentDate",
              slot: "$timeslot",           
            },          
          }
        }
      },
      { $unwind: "$medicalCenterName" },
      // { $unwind: "$expectedVisits" },
      // {
      //   $group:
      //     {
      //       "_id": {
      //         "expectedVisits": "$expectedVisits",
      //         "medicalCenterName": "$medicalCenterName"
      //       },
      //       myCount: { $sum: 1 }
      //     }
      // },
      // { $group:
      //   {
      //     _id: null, uniqueValues: {$addToSet: "$expectedVisits.appointmentDate"}
      //   }
      // }
    ]);

    templateObject = {
      date: null,
      morningSlot: 0,
      afternoonSlot: 0,
      eveningSlot: 0,
    }

    let dateArray = new Array();
    let currentDate = todaysDate;
    while (currentDate <= futureDate){      
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // console.log(dateArray)


    let objectCount = 0;
    let hasMore = true;      
    // objectCount = await appointment.find(query,).countDocuments();
    

    // Creating the Body response
    let theSummary = new Array();
    for (let i = 0; i < documents.length; i++) {
      let medicalCenterId = documents[i].medicalCenterId;
      let medicalCenterName = documents[i].medicalCenterName;
      let theSummaryDateResults = new Array();
      for (let j = 0; j < dateArray.length; j++) {
        let date = dateArray[j].toISOString().split('T')[0]
        morningSlot = documents[i].expectedVisits.filter(element => element.date.toISOString().split('T')[0] === date  && element.slot === "morning").length;
        afternoonSlot = documents[i].expectedVisits.filter(element => element.date.toISOString().split('T')[0] === date  && element.slot === "afternoon").length;
        eveningSlot = documents[i].expectedVisits.filter(element => element.date.toISOString().split('T')[0] === date  && element.slot === "evening").length;
        let datesResults = {
          date: date,
          morningSlot: morningSlot,
          afternoonSlot: afternoonSlot,
          eveningSlot: eveningSlot
        };
        theSummaryDateResults.push(datesResults);
      }
      theSummary.push({
        medicalCenterId,
        medicalCenterName,
        expectedVisits: theSummaryDateResults
      });
    }

    // if (starting_after_objectQP) query["$and"].push({"appointmentId": {$gt: starting_after_objectQP}});
    // documents = await appointment.find(query,).sort({appointmentId: 1}).limit(limitQP).lean();
    // lastDocument = await appointment.findOne(query,).sort({appointmentId: -1}).lean();      
    
    // // console.log(lastDocument.appointmentId)
    // documents.forEach((document) => {
    //   if (document.appointmentId.equals(lastDocument.appointmentId)) hasMore = false;
    // });


    let msg = "good"
    if (documents.length === 0){
      msg = "list is empty change your query";
      hasMore = false;
    }

    const responseBody = {
      codeStatus: "200",
      message: msg,
      data: {
        objectCount: documents.length,
        hasMore,
        objectArray: theSummary
      }
    };

    res.status(200).json({...responseBody});

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
