// importing dependencies and files/modules
// importing express server from express
const express = require(`express`);
// importing router from express
const router = express.Router();
// importing users middleware
const { createUsers, getUsers } = require(`../middlewares/userMiddleware`);

// importing beneficiary middleware
const {
  createBeneficiary,
  getBeneficiaries,
  singleBeneficiary,
  updateBeneficiary,
} = require(`../middlewares/beneficiaryMiddleware`);

// importing appointment middleware
const {
  createAppointment,
  updateAppointment,
  specificAppointment,
  allAppointments,
} = require(`../middlewares/appointmentMiddleware`);

// importing schedules middleware
const {
  createSchedule,
  updateSchedule,
  specificSchedule,
  allSchedule,
  deleteSchedule,
} = require(`../middlewares/scheduleMiddleware`);

// importing doctor middleware
const {
  createDoctor,
  singleDoctor,
  updateDoctor,
  deleteDoctor,
  allDoctor,
} = require(`../middlewares/doctorMiddleware`);

const {
  createmedicalCenter,
  singlemedicalCenter,
  updatemedicalCenter,
  deletemedicalCenter,
  allmedicalCenter,
} = require(`../middlewares/medicalCenterMiddleware`);

const {
  createmedicalSpecialty,
  allmedicalSpecialty,
} = require(`../middlewares/medicalSpecialtyMiddleware`);

const { createCity, allCity } = require(`../middlewares/cityMiddleware`);

const Login = require(`../middlewares/loginMiddleware`);

// importing authentication/authorization middleware
const { authentication, cookieVerification } = require(`../auth`);

// All routes
// routes for user
router
  .route(`/v1/users`)
  .post(authentication, createUsers)
  .get(authentication, getUsers);

// routes for beneficiary
router
  .route(`/v1/beneficiaries`)
  .post(authentication, createBeneficiary)
  .get(authentication, getBeneficiaries);

// routes for single beneficiary and updating it
router
  .route(`/v1/beneficiaries/:beneficiaryId`)
  .get(authentication, cookieVerification, singleBeneficiary)
  .patch(authentication, cookieVerification, updateBeneficiary);

// routes for appointments
router
  .route(`/v1/appointments/users/:userId`)
  .get(authentication, specificAppointment)
  .post(authentication, cookieVerification, createAppointment);

// routes for appointment
router.route(`/v1/appointments`).get(authentication, allAppointments);
router
  .route(`/v1/appointments/:appointmentId`)
  .get(authentication, cookieVerification)
  .patch(authentication, cookieVerification, updateAppointment);

// routes for schedules
router
  .route(`/v1/schedules`)
  .get(authentication, allSchedule)
  .post(authentication, cookieVerification, createSchedule);
router
  .route(`/v1/schedules/:scheduleId`)
  .get(authentication, specificSchedule)
  .patch(authentication, updateSchedule)
  .delete(authentication, deleteSchedule);

// routes for doctors
router
  .route(`/v1/doctors`)
  .get(authentication, allDoctor)
  .post(authentication, createDoctor);

// routes for doctor
router
  .route(`/v1/doctors/:doctorId`)
  .get(authentication, singleDoctor)
  .patch(authentication, updateDoctor)
  .delete(authentication, deleteDoctor);

// routes for medicalCenters
router
  .route(`/v1/medicalcenters`)
  .get(authentication, allmedicalCenter)
  .post(authentication, createmedicalCenter);

// routes for medicalCenter
router
  .route(`/v1/medicalcenters/:medicalCenterId`)
  .get(authentication, singlemedicalCenter)
  .patch(authentication, updatemedicalCenter)
  .delete(authentication, deletemedicalCenter);

// routes for medicalSpecialty
router
  .route(`/v1/medicalspecialties`)
  .post(authentication, createmedicalSpecialty)
  .get(authentication, allmedicalSpecialty);

// routes for cities
router
  .route(`/v1/cities`)
  .post(authentication, createCity)
  .get(authentication, allCity);

// routes for login
router.route(`/v1/login`).post(Login);

// exporting router
module.exports = router;
