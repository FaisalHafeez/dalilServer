const beneficiarys = require(`../schemas/beneficiarySchema`);
// importing all dependencies
const user = require(`../schemas/userSchema`);
const bcrypt = require("bcrypt");
const jwt = require(`jsonwebtoken`);
const mongoose = require("mongoose");


// api for getting a single Beneficiary
const singleMedicalFiles = async (req, res) => {
  try {
    
    // const document = await beneficiarys.findOne(req.params,).lean();
    const document = await beneficiarys.findOne(req.params,
        { beneficiaryId: 1, account: 1, familyMembers: "$familyMembers", _id: 0 } 
        ).lean()

    // console.log(req.params);
    
    if (!document) {
      return res.status(404).json({ msg: `beneficiary not found` });
    }

    if (res.locals.user.userId !== document.account.userId) {
      return res.status(401).json({ msg: `Not Authorized` });
    }
    let medicalFiles = []


    if (document.familyMembers) {
        document.familyMembers.forEach((document) => {
            if( document.medicalFiles){
                let medicalFile = {};
                medicalFile.medicalFileId =  document.medicalFiles.medicalFileId;
                medicalFile.name =  document.firstName + " " + document.lastName;
                medicalFile.birthDate =  document.birthdate.toISOString().split('T')[0];
                medicalFile.gender =  document.gender;
                medicalFile.bloodType =  document.medicalFiles.bloodType;
                medicalFile.height =  document.medicalFiles.height;
                medicalFile.allergies =  document.medicalFiles.allergies;
                medicalFile.chronicDiseases =  document.medicalFiles.chronicDiseases;
                medicalFile.surgeryHistory =  document.medicalFiles.surgeryHistory;
                medicalFile.clinicalVisits =  document.medicalFiles.clinicalVisits;
                medicalFile.medicalTests =  document.medicalFiles.medicalTests;
                medicalFiles.push(medicalFile);
            }
        });

    }
    
    
    const responseBody = {
      codeStatus: "200",
      message: "good",
      data: {
        objectCount: 0,
        hasMore: false,
        objectArray: medicalFiles
      }
    };

    res.status(200).json({... responseBody});
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  singleMedicalFiles
};
