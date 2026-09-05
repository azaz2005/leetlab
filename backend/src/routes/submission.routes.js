// import express from "express"
// import { authMiddleware } from "../middleware/auth.middleware.js";
// import { getAllSubmission, getAllTheSubmissionsForProblem, getSubmissionsForProblem } from "../controllers/submission.controller.js";


// const submissionRoutes = express.Router()


// submissionRoutes.get("/get-all-submissions" , authMiddleware , getAllSubmission);
// submissionRoutes.get("/get-submission/:problemId" , authMiddleware , getSubmissionsForProblem)

// submissionRoutes.get("/get-submissions-count/:problemId" , authMiddleware , getAllTheSubmissionsForProblem)


// export default submissionRoutes;



import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import {
  getAllSubmission,
  getAllTheSubmissionsForProblem,
  getSubmissionsForProblem,
  createSubmission,
} from "../controllers/submission.controller.js";

const submissionRoutes = express.Router();


// Submit solution
submissionRoutes.post(
  "/create",
  authMiddleware,
  createSubmission
);


// Get all submissions of current user
submissionRoutes.get(
  "/get-all-submissions",
  authMiddleware,
  getAllSubmission
);


// Get submissions for a problem
submissionRoutes.get(
  "/get-submission/:problemId",
  authMiddleware,
  getSubmissionsForProblem
);


// Get submission count for a problem
submissionRoutes.get(
  "/get-submissions-count/:problemId",
  authMiddleware,
  getAllTheSubmissionsForProblem
);


export default submissionRoutes;