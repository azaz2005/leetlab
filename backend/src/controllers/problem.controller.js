import { db } from "../libs/db.js";
import {
  getJudge0LanguageId,
  submitBatch,
  pollBatchResults,
} from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {

    const normalizeOutput = (output) => {
      return String(output ?? "")
        .trim()
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .split("\n")
        .map((line) => line.trim())
        .join("\n");
    };


    for (const [language, solutionCode] of Object.entries(
      referenceSolutions
    )) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }


      const submissions = testcases.map(({ input }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((result) => result.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        console.log(
          `Result for ${language} - Testcase ${i + 1}:`,
          JSON.stringify(result, null, 2)
        );


        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Reference solution failed for testcase ${i + 1
              } in ${language}`,
            status: result.status,
            stdout: result.stdout,
            stderr: result.stderr,
            compile_output: result.compile_output,
          });
        }


        const actualOutput = normalizeOutput(result.stdout);
        const expectedOutput = normalizeOutput(testcases[i].output);

        if (actualOutput !== expectedOutput) {
          console.log("Expected:", JSON.stringify(expectedOutput));
          console.log("Actual:", JSON.stringify(actualOutput));

          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
            expected: expectedOutput,
            actual: actualOutput,
            result,
          });
        }
      }
    }
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Problem Created Successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

// ============================================
// GET ALL PROBLEMS
// ============================================

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      include: {
        user: true,

        // Check whether the current logged-in user
        // has solved each problem
        solvedBy: {
          where: {
            userId: req.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // Add a simple solved: true/false property
    // so the frontend can easily display the tick
    const problemsWithSolvedStatus = problems.map((problem) => ({
      ...problem,
      solved: problem.solvedBy.length > 0,
    }));

    return res.status(200).json({
      success: true,
      message: "Problems Fetched Successfully",
      problems: problemsWithSolvedStatus,
    });
  } catch (error) {
    console.error("GET ALL PROBLEMS ERROR:");
    console.error(error);

    return res.status(500).json({
      error: "Error While Fetching Problems",
      details: error.message,
    });
  }
};


// ============================================
// GET PROBLEM BY ID
// ============================================

export const getProblemById = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: "Problem not found.",
      });
    }

    return res.status(200).json({
      sucess: true,
      message: "Message Created Successfully",
      problem,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Error While Fetching Problem by id",
    });
  }
};


// ============================================
// UPDATE PROBLEM
// ============================================

export const updateProblem = async (req, res) => { };


// ============================================
// DELETE PROBLEM
// ============================================

export const deleteProblem = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        error: "Problem Not found",
      });
    }

    await db.problem.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Problem deleted Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: "Error While deleting the problem",
    });
  }
};


// ============================================
// GET ALL PROBLEMS SOLVED BY USER
// ============================================

export const getAllProblemsSolvedByUser = async (req, res) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },

      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      problems,
    });
  } catch (error) {
    console.error("Error fetching problems:", error);

    res.status(500).json({
      error: "Failed to fetch problems",
    });
  }
};