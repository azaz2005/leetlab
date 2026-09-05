import React from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick as Memory,
} from "lucide-react";

const SubmissionResults = ({ submission }) => {
  if (!submission) {
    return (
      <div className="p-6 text-center text-base-content/70">
        No submission result available.
      </div>
    );
  }

  /*
   * The Run Code API returns:
   *
   * {
   *   passed,
   *   totalTestCases,
   *   passedTestCases,
   *   results: [...]
   * }
   *
   * A saved database submission returns:
   *
   * {
   *   status,
   *   memory,
   *   time,
   *   testCases: [...]
   * }
   *
   * Normalize both formats into one testCases array.
   */

  const isExecutionResult =
    Array.isArray(submission.results);

  const testCases = isExecutionResult
    ? submission.results.map((result, index) => ({
        id: result.token || index,
        testCase:
          result.testCase || index + 1,
        passed: Boolean(result.passed),
        expected: result.expected ?? "",
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
        memory: result.memory ?? null,
        time: result.time ?? null,
        status:
          result.status?.description ||
          result.status ||
          "",
        compileOutput:
          result.compile_output ||
          result.compileOutput ||
          null,
      }))
    : Array.isArray(submission.testCases)
    ? submission.testCases
    : [];

  /*
   * Determine overall status
   */
  const allPassed =
    isExecutionResult
      ? Boolean(submission.passed)
      : String(submission.status || "").toUpperCase() ===
        "ACCEPTED";

  const statusText = allPassed
    ? "Accepted"
    : "Wrong Answer";

  /*
   * Test case statistics
   */
  const passedTests = testCases.filter(
    (testCase) => testCase.passed
  ).length;

  const totalTests = testCases.length;

  const successRate =
    totalTests > 0
      ? (passedTests / totalTests) * 100
      : 0;

  /*
   * Get memory values
   *
   * Supports:
   * - number
   * - "123"
   * - "123, 456"
   * - JSON array "[123,456]"
   */
  const parseMetricValues = (value) => {
    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map(Number)
        .filter(Number.isFinite);
    }

    if (typeof value === "number") {
      return [value];
    }

    if (typeof value !== "string") {
      return [];
    }

    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    // Try JSON array first
    if (
      trimmed.startsWith("[") &&
      trimmed.endsWith("]")
    ) {
      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed
            .map(Number)
            .filter(Number.isFinite);
        }
      } catch {
        // Continue with comma-separated parsing
      }
    }

    return trimmed
      .split(",")
      .map((item) => parseFloat(item.trim()))
      .filter(Number.isFinite);
  };

  /*
   * Memory values
   */
  let memoryValues = [];

  if (isExecutionResult) {
    memoryValues = testCases
      .map((testCase) => parseFloat(testCase.memory))
      .filter(Number.isFinite);
  } else {
    memoryValues = parseMetricValues(
      submission.memory
    );
  }

  /*
   * Time values
   */
  let timeValues = [];

  if (isExecutionResult) {
    timeValues = testCases
      .map((testCase) => parseFloat(testCase.time))
      .filter(Number.isFinite);
  } else {
    timeValues = parseMetricValues(
      submission.time
    );
  }

  /*
   * Calculate averages
   */
  const avgMemory =
    memoryValues.length > 0
      ? memoryValues.reduce(
          (sum, value) => sum + value,
          0
        ) / memoryValues.length
      : 0;

  const avgTime =
    timeValues.length > 0
      ? timeValues.reduce(
          (sum, value) => sum + value,
          0
        ) / timeValues.length
      : 0;

  return (
    <div className="space-y-6">

      {/* ================================
          Overall Status
      ================================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Status */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">

            <h3 className="card-title text-sm">
              Status
            </h3>

            <div
              className={`text-lg font-bold ${
                allPassed
                  ? "text-success"
                  : "text-error"
              }`}
            >
              {statusText}
            </div>

          </div>
        </div>


        {/* Success Rate */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">

            <h3 className="card-title text-sm">
              Success Rate
            </h3>

            <div className="text-lg font-bold">
              {successRate.toFixed(1)}%
            </div>

            <div className="text-sm text-base-content/60">
              {passedTests} / {totalTests} passed
            </div>

          </div>
        </div>


        {/* Runtime */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">

            <h3 className="card-title text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Runtime
            </h3>

            <div className="text-lg font-bold">
              {avgTime.toFixed(3)} s
            </div>

          </div>
        </div>


        {/* Memory */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">

            <h3 className="card-title text-sm flex items-center gap-2">
              <Memory className="w-4 h-4" />
              Avg. Memory
            </h3>

            <div className="text-lg font-bold">
              {avgMemory.toFixed(0)} KB
            </div>

          </div>
        </div>

      </div>


      {/* ================================
          Test Case Results
      ================================= */}
      <div className="card bg-base-100 shadow-xl">

        <div className="card-body">

          <h2 className="card-title mb-4">
            Test Cases Results
          </h2>

          {testCases.length === 0 ? (

            <div className="text-center py-8 text-base-content/60">
              No test case results available.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="table table-zebra w-full">

                <thead>
                  <tr>
                    <th>Test Case</th>
                    <th>Status</th>
                    <th>Expected Output</th>
                    <th>Your Output</th>
                    <th>Memory</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>

                  {testCases.map(
                    (testCase, index) => (

                      <tr
                        key={
                          testCase.id ||
                          testCase.token ||
                          index
                        }
                      >

                        {/* Test Case */}
                        <td>
                          {testCase.testCase ||
                            index + 1}
                        </td>


                        {/* Status */}
                        <td>

                          {testCase.passed ? (

                            <div className="flex items-center gap-2 text-success">

                              <CheckCircle2 className="w-5 h-5" />

                              <span>
                                Passed
                              </span>

                            </div>

                          ) : (

                            <div className="flex items-center gap-2 text-error">

                              <XCircle className="w-5 h-5" />

                              <span>
                                Failed
                              </span>

                            </div>

                          )}

                        </td>


                        {/* Expected */}
                        <td className="font-mono whitespace-pre-wrap">
                          {testCase.expected || "-"}
                        </td>


                        {/* Actual */}
                        <td className="font-mono whitespace-pre-wrap">
                          {testCase.stdout || "-"}
                        </td>


                        {/* Memory */}
                        <td>
                          {testCase.memory != null
                            ? `${testCase.memory} KB`
                            : "-"}
                        </td>


                        {/* Time */}
                        <td>
                          {testCase.time != null
                            ? `${testCase.time} s`
                            : "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ================================
          Error Information
      ================================= */}
      {testCases.some(
        (testCase) =>
          testCase.stderr ||
          testCase.compileOutput
      ) && (

        <div className="card bg-base-100 shadow-xl">

          <div className="card-body">

            <h2 className="card-title">
              Execution Details
            </h2>

            {testCases.map(
              (testCase, index) => {

                if (
                  !testCase.stderr &&
                  !testCase.compileOutput
                ) {
                  return null;
                }

                return (
                  <div
                    key={
                      testCase.id ||
                      testCase.token ||
                      index
                    }
                    className="mb-4"
                  >

                    <h3 className="font-semibold mb-2">
                      Test Case {index + 1}
                    </h3>

                    {testCase.stderr && (
                      <div className="mb-2">

                        <p className="text-error font-semibold">
                          Error:
                        </p>

                        <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto text-sm">
                          {testCase.stderr}
                        </pre>

                      </div>
                    )}

                    {testCase.compileOutput && (
                      <div>

                        <p className="text-warning font-semibold">
                          Compilation Output:
                        </p>

                        <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto text-sm">
                          {testCase.compileOutput}
                        </pre>

                      </div>
                    )}

                  </div>
                );
              }
            )}

          </div>

        </div>

      )}

    </div>
  );
};

export default SubmissionResults;