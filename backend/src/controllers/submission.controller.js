// import { db } from "../libs/db.js";

// export const getAllSubmission = async(req , res)=>{
//     try {
//         const userId = req.user.id;

//         const submissions = await db.submission.findMany({
//             where:{
//                 userId:userId
//             }
//         })

//         res.status(200).json({
//             success:true,
//             message:"Submissions fetched successfully",
//             submissions
//         })
        
//     } catch (error) {
//         console.error("Fetch Submissions Error:", error);
//         res.status(500).json({ error: "Failed to fetch submissions" });
//     }
// }


// export const getSubmissionsForProblem = async (req , res)=>{
//     try {
//         const userId = req.user.id;
//         const problemId = req.params.problemId;
//         const submissions = await db.submission.findMany({
//             where:{
//                 userId:userId,
//                 problemId:problemId
//             }
//         })

//         res.status(200).json({
//             success:true,
//             message:"Submission fetched successfully",
//             submissions
//         })
//     } catch (error) {
//         console.error("Fetch Submissions Error:", error);
//         res.status(500).json({ error: "Failed to fetch submissions" });
//     }
// }


// export const getAllTheSubmissionsForProblem = async (req , res)=>{
//     try {
//         const problemId = req.params.problemId;
//         const submission = await db.submission.count({
//             where:{
//                 problemId:problemId
//             }
//         })

//         res.status(200).json({
//             success:true,
//             message:"Submissions Fetched successfully",
//             count:submission
//         })
//     } catch (error) {
//         console.error("Fetch Submissions Error:", error);
//         res.status(500).json({ error: "Failed to fetch submissions" });
//     }
// }



import { db } from "../libs/db.js";

import {
  submitBatch,
  pollBatchResults,
} from "../libs/judge0.lib.js";

// Get all submissions of logged-in user
export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await db.submission.findMany({
      where: {
        userId,
      },
      include: {
        testCases: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch submissions",
    });
  }
};

// Get submissions of logged-in user for one problem
export const getSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;

    const submissions = await db.submission.findMany({
      where: {
        userId,
        problemId,
      },
      include: {
        testCases: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      message: "Submission fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch submissions",
    });
  }
};

// Get total submission count for a problem
export const getAllTheSubmissionsForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemId;

    const submission = await db.submission.count({
      where: {
        problemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      count: submission,
    });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch submissions",
    });
  }
};

// Submit solution
export const createSubmission = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      source_code,
      language_id,
      language,
      problemId,
      stdin,
      expected_outputs,
    } = req.body;

    console.log("=================================");
    console.log("CREATE SUBMISSION REQUEST");
    console.log("User:", userId);
    console.log("Problem:", problemId);
    console.log("Language:", language);
    console.log("Language ID:", language_id);
    console.log("=================================");

    // -----------------------------
    // Validate request
    // -----------------------------

    if (
      typeof source_code !== "string" ||
      source_code.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        error: "source_code is required",
      });
    }

    if (!language_id) {
      return res.status(400).json({
        success: false,
        error: "language_id is required",
      });
    }

    if (!problemId) {
      return res.status(400).json({
        success: false,
        error: "problemId is required",
      });
    }

    if (!Array.isArray(stdin) || stdin.length === 0) {
      return res.status(400).json({
        success: false,
        error: "stdin must be a non-empty array",
      });
    }

    if (
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({
        success: false,
        error:
          "expected_outputs must have the same length as stdin",
      });
    }

    // -----------------------------
    // Verify problem exists
    // -----------------------------

    const problem = await db.problem.findUnique({
      where: {
        id: problemId,
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found",
      });
    }

    // -----------------------------
    // Create Judge0 submissions
    // -----------------------------

    const submissions = stdin.map((input) => ({
      source_code,
      language_id: Number(language_id),
      stdin: String(input ?? ""),
    }));

    console.log(
      "JUDGE0 SUBMISSIONS:",
      JSON.stringify(submissions, null, 2)
    );

    // -----------------------------
    // Send to Judge0
    // -----------------------------

    const submitResponse = await submitBatch(submissions);

    if (
      !Array.isArray(submitResponse) ||
      submitResponse.length !== submissions.length
    ) {
      throw new Error(
        "Judge0 did not return valid submission tokens"
      );
    }

    const tokens = submitResponse.map(
      (submission) => submission?.token
    );

    if (
      tokens.length !== submissions.length ||
      tokens.some((token) => !token)
    ) {
      throw new Error(
        `Invalid Judge0 tokens: ${JSON.stringify(
          submitResponse
        )}`
      );
    }

    console.log("TOKENS:", tokens);

    // -----------------------------
    // Poll Judge0
    // -----------------------------

    const results = await pollBatchResults(tokens);

    console.log(
      "FINAL JUDGE0 RESULTS:",
      JSON.stringify(results, null, 2)
    );

    // -----------------------------
    // Compare test cases
    // -----------------------------

    const testResults = results.map(
      (result, index) => {
        const actualOutput = String(
          result.stdout ?? ""
        )
          .replace(/\r\n/g, "\n")
          .trim();

        const expectedOutput = String(
          expected_outputs[index] ?? ""
        )
          .replace(/\r\n/g, "\n")
          .trim();

        const passed =
          result.status?.id === 3 &&
          actualOutput === expectedOutput;

        return {
          testCase: index + 1,
          passed,

          expected: expectedOutput,
          stdout: result.stdout ?? null,
          stderr: result.stderr ?? null,

          compileOutput:
            result.compile_output ?? null,

          status:
            result.status?.description ??
            "Unknown",

          memory:
            result.memory != null
              ? String(result.memory)
              : null,

          time:
            result.time != null
              ? String(result.time)
              : null,
        };
      }
    );

    const passedTestCases =
      testResults.filter(
        (test) => test.passed
      ).length;

    const totalTestCases =
      testResults.length;

    const allPassed =
      passedTestCases === totalTestCases;

    const status = allPassed
      ? "ACCEPTED"
      : "WRONG_ANSWER";

    // -----------------------------
    // Save submission
    // -----------------------------

    const submission = await db.submission.create({
      data: {
        userId,
        problemId,

        sourceCode: source_code,

        language:
          language ||
          String(language_id),

        stdin: JSON.stringify(stdin),

        stdout: testResults
          .map((test) => test.stdout ?? "")
          .join("\n"),

        stderr: testResults
          .map((test) => test.stderr ?? "")
          .filter(Boolean)
          .join("\n") || null,

        compileOutput:
          testResults
            .map(
              (test) =>
                test.compileOutput ?? ""
            )
            .filter(Boolean)
            .join("\n") || null,

        status,

        memory:
          testResults
            .map((test) => test.memory)
            .filter(Boolean)
            .join(", ") || null,

        time:
          testResults
            .map((test) => test.time)
            .filter(Boolean)
            .join(", ") || null,

        testCases: {
          create: testResults.map(
            (test) => ({
              testCase: test.testCase,
              passed: test.passed,
              stdout: test.stdout,
              expected: test.expected,
              stderr: test.stderr,
              compileOutput:
                test.compileOutput,
              status: test.status,
              memory: test.memory,
              time: test.time,
            })
          ),
        },
      },

      include: {
        testCases: true,
      },
    });

    // -----------------------------
    // Mark problem as solved
    // -----------------------------

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },

        update: {},

        create: {
          userId,
          problemId,
        },
      });
    }

    console.log(
      "SUBMISSION SAVED:",
      submission.id
    );

    // -----------------------------
    // Response
    // -----------------------------

    return res.status(201).json({
      success: true,

      message: allPassed
        ? "Solution Accepted!"
        : "Solution submitted. Some test cases failed.",

      submission,

      passed: allPassed,

      totalTestCases,

      passedTestCases,

      results: testResults,
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "CREATE SUBMISSION ERROR"
    );

    console.error(error);

    console.error(
      "================================="
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Submission failed",
    });
  }
};