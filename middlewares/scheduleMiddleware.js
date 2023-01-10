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

// get schedules for doctor MP-GAi9126
const allDoctorSchedule = async (req, res) => {
  try {
    const doctorIdQP = req.params.doctorId;

    let hasMore = true;
    let query = {};
    query['$and']=[];

    query["$and"].push({"doctorId": {$eq: doctorIdQP}});
    
    // let objectCount = 0;    
    // objectCount = await schedule.aggregate([
    //   {
    //     $lookup: {
    //       from: `medicalcenters`,
    //       localField: `medicalCenterId`,
    //       foreignField: `medicalCenterId`,
    //       as: `medicalCenterObject`,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: `doctors`,
    //       localField: `doctorId`,
    //       foreignField: `doctorId`,
    //       as: `doctorObject`,
    //     },
    //   },
    //   { $match: { 
    //     $and: query["$and"]
    //    }
    //   },
    //   // {
    //   //   $group: {
    //   //     _id: '$age',
    //   //     count: { $sum: 1 }
    //   //   }
    //   // }
    //   {
    //     $sort: sortByQP_
    //   },
    //   {
    //     $count: "objectCount"
    //   }
    // ]);

    documents = await schedule.aggregate([
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
          scheduleList: { $push: "$$ROOT"}
        }
      }
    ]);


    documents.forEach((document) => {
      document.medicalCenterName = document.medicalCenterName[0];
      // document.medicalCenterId = document.medicalCenterId[0];
      document.scheduleList.forEach((document) => {
        document.medicalCenterObject = document.medicalCenterObject[0]
        document.doctorObject = document.doctorObject[0]
      })
    });
    let count = documents.length

    let msg = "good"
    if (documents.length === 0){
      msg = "list is empty change your query";
    }
    const responseBody = {
      codeStatus: "200",
      message: msg,
      data: {
        objectCount: count,
        objectArray: documents
      }
    };

    res.status(200).json({...responseBody});
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
    const cityQP = req.query.city;
    const fromDateQP = req.query.fromDate;
    const toDateQP = req.query.toDate;
    const doctorIdQP = req.query.doctorId;
    const medicalCenterIdQP = req.query.medicalCenterId;
    const sortByQP = req.query.sortBy;
    const specialtyQP = req.query.specialty;
    const starting_after_objectQP = req.query.starting_after_object;
    const timeslotQP = req.query.timeSlot;

    let limitQP = req.query.limit;
    if (limitQP) {
      limitQP = Number(limitQP);
      if (limitQP > 100 || limitQP < 1) {
        limitQP = 30;
      }
    }else{
      limitQP = 30;
    }

    let hasMore = true;
    let query = {};
    query['$and']=[];

    if(doctorIdQP){
      // console.log(cityQP);
      query["$and"].push({"doctorId": {$eq: doctorIdQP}});
    }

    if(medicalCenterIdQP){
      // console.log(cityQP);
      query["$and"].push({"medicalCenterId": {$eq: medicalCenterIdQP}});
    }

    if(cityQP){
      console.log(cityQP);
      query["$and"].push({"medicalCenterObject.city": {$eq: cityQP}});
    }

    if(timeslotQP){
      // console.log(timeslotQP);
      query["$and"].push({timeslot: {$eq: timeslotQP}});
    }

    if(specialtyQP){
      // console.log(specialtyQP);
      query["$and"].push({"doctorObject.specialty": {$eq: specialtyQP}});
    }

    if(toDateQP){
      // console.log(toDateQP);
      query["$and"].push({startDate: {$lte: toDateQP}});      
    }

    if(fromDateQP){
      // console.log(fromDateQP);
      query["$and"].push({endDate: {$gte: fromDateQP}});      
    }

    let sortByQP_ = {}
    if(sortByQP === "doctor"){
      // console.log(sortByQP);
      sortByQP_ = {"doctorId": 1, "scheduleId": 1};

      if (starting_after_objectQP){
        query["$and"].push({"doctorId": {$gt: starting_after_objectQP}});
      }
    }else if(sortByQP === "medicalCenter"){
      // console.log(sortByQP);
      sortByQP_ = {"medicalCenterId": 1, "scheduleId": 1};
      if (starting_after_objectQP){
        query["$and"].push({"medicalCenterId": {$gt: starting_after_objectQP}});
      }
    }else{
      sortByQP_ = {"scheduleId": 1};
      if (starting_after_objectQP){
        query["$and"].push({"scheduleId": {$gt: starting_after_objectQP}});
      }
    }
    
    let objectCount = 0;

    if (query["$and"].length === 0) { 
      documents = await schedule.find({},
        // { scheduleId: 1, "doctor.doctorId": 1,"medicalcenter.medicalCenterId": 1, _id: 1 } 
        ).sort( sortByQP_ ).limit(limitQP).lean();
        

      objectCount = await schedule.find({},
        // { scheduleId: 1, "doctor.doctorId": 1,"medicalcenter.medicalCenterId": 1, _id: 1 } 
        ).countDocuments();
        
    }else {
      // documents = await schedule.find(query,
      //   // { scheduleId: 1, "doctor.doctorId": 1,"medicalcenter.medicalCenterId": 1, _id: 1 } 
      //   ).sort( sortByQP_ ).limit(limitQP).lean();

      // documents = await schedule.find({},
        // { scheduleId: 1, "doctor.doctorId": 1,"medicalcenter.medicalCenterId": 1, _id: 1 } 
        // ).sort( sortByQP_ ).limit(limitQP).lean();
        
        documents = await schedule.aggregate([
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
          {
            $sort: sortByQP_
          },
          {
            $limit: limitQP
          }
        ]);        

        // console.log(documents[0])
        for (const key in sortByQP_) {
          sortByQP_[key] = sortByQP_[key] *-1;
          // console.log(`obj.${key} = ${sortByQP_[key]}`);
        }

        lastDocument = await schedule.aggregate([
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
          // {
          //   $group: {
          //     _id: '$age',
          //     count: { $sum: 1 }
          //   }
          // }
          {
            $sort: sortByQP_
          },
          {
            $limit: limitQP
          }
        ]);

        documents.forEach((document) => {
          if (document.scheduleId === lastDocument[0].scheduleId) hasMore = false;
          document.doctorObject = document.doctorObject[0]
          document.medicalCenterObject = document.medicalCenterObject[0]
        });

        if (starting_after_objectQP){
          query["$and"].pop();
        }
        objectCount = await schedule.aggregate([
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
          // {
          //   $group: {
          //     _id: '$age',
          //     count: { $sum: 1 }
          //   }
          // }
          {
            $sort: sortByQP_
          },
          {
            $count: "objectCount"
          }
        ]);
    }
    let count = 0
    // console.log(objectCount[0].objectCount)
    if(objectCount[0] !== undefined){
      count = objectCount[0].objectCount
    }

    let msg = "good"
    if (documents.length === 0){
      msg = "list is empty change your query";
      hasMore = false;
    }
    const responseBody = {
      codeStatus: "200",
      message: msg,
      data: {
        objectCount: count,
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
  allDoctorSchedule,
  specificSchedule,
  allSchedule,
  deleteSchedule,
};
