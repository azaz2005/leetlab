import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick as Memory,
  Calendar,
} from "lucide-react";

const SubmissionsList = ({ submissions, isLoading }) => {
  // ============================================
  // Convert memory/time data into an array
  // ============================================
  const parseMetricData = (data) => {
    if (
      data === null ||
      data === undefined ||
      data === ""
    ) {
      return [];
    }

    // Already an array
    if (Array.isArray(data)) {
      return data;
    }

    // Number
    if (typeof data === "number") {
      return [data];
    }

    // String
    if (typeof data === "string") {
      const value = data.trim();

      if (!value) {
        return [];
      }

      // Try JSON first
      try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
          return parsed;
        }

        // JSON number/string
        if (
          typeof parsed === "number" ||
          typeof parsed === "string"
        ) {
          return [parsed];
        }
      } catch {
        // Not JSON.
        // Backend may have stored comma-separated values.
      }

      // Handle comma-separated values
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };


  // ============================================
  // Calculate average memory
  // ============================================
  const calculateAverageMemory = (memoryData) => {
    const memoryArray = parseMetricData(memoryData)
      .map((memory) => {
        const value = String(memory)
          .replace(/KB/gi, "")
          .trim();

        return parseFloat(value);
      })
      .filter(Number.isFinite);

    if (memoryArray.length === 0) {
      return 0;
    }

    return (
      memoryArray.reduce(
        (total, value) => total + value,
        0
      ) / memoryArray.length
    );
  };


  // ============================================
  // Calculate average runtime
  // ============================================
  const calculateAverageTime = (timeData) => {
    const timeArray = parseMetricData(timeData)
      .map((time) => {
        const value = String(time)
          .replace(/s/gi, "")
          .trim();

        return parseFloat(value);
      })
      .filter(Number.isFinite);

    if (timeArray.length === 0) {
      return 0;
    }

    return (
      timeArray.reduce(
        (total, value) => total + value,
        0
      ) / timeArray.length
    );
  };


  // ============================================
  // Loading state
  // ============================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }


  // ============================================
  // No submissions
  // ============================================
  if (
    !Array.isArray(submissions) ||
    submissions.length === 0
  ) {
    return (
      <div className="text-center p-8">
        <div className="text-base-content/70">
          No submissions yet
        </div>
      </div>
    );
  }


  // ============================================
  // Submissions list
  // ============================================
  return (
    <div className="space-y-4">

      {submissions.map((submission) => {

        const avgMemory =
          calculateAverageMemory(
            submission.memory
          );

        const avgTime =
          calculateAverageTime(
            submission.time
          );

        // Backend uses ACCEPTED / WRONG_ANSWER
        const isAccepted =
          String(submission.status)
            .toUpperCase() === "ACCEPTED";


        return (
          <div
            key={submission.id}
            className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow rounded-lg"
          >

            <div className="card-body p-4">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                {/* =================================
                    Status + Language
                ================================= */}
                <div className="flex items-center gap-4">

                  {isAccepted ? (

                    <div className="flex items-center gap-2 text-success">

                      <CheckCircle2 className="w-6 h-6" />

                      <span className="font-semibold">
                        Accepted
                      </span>

                    </div>

                  ) : (

                    <div className="flex items-center gap-2 text-error">

                      <XCircle className="w-6 h-6" />

                      <span className="font-semibold">
                        {submission.status ||
                          "Failed"}
                      </span>

                    </div>

                  )}


                  {/* Language */}
                  <div className="badge badge-neutral">
                    {submission.language}
                  </div>

                </div>


                {/* =================================
                    Runtime + Memory + Date
                ================================= */}
                <div className="flex flex-wrap items-center gap-4 text-base-content/70">

                  {/* Runtime */}
                  <div className="flex items-center gap-1">

                    <Clock className="w-4 h-4" />

                    <span>
                      {avgTime.toFixed(3)} s
                    </span>

                  </div>


                  {/* Memory */}
                  <div className="flex items-center gap-1">

                    <Memory className="w-4 h-4" />

                    <span>
                      {avgMemory.toFixed(0)} KB
                    </span>

                  </div>


                  {/* Date */}
                  <div className="flex items-center gap-1">

                    <Calendar className="w-4 h-4" />

                    <span>
                      {submission.createdAt
                        ? new Date(
                            submission.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default SubmissionsList;