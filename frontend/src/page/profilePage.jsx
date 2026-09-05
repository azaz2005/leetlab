import React, { useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Shield,
  Code2,
  CheckCircle2,
  Trophy,
  CalendarDays,
} from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";
import { useSubmissionStore } from "../store/useSubmissionStore";

const ProfilePage = () => {
  const { authUser } = useAuthStore();

  const {
    submissions,
    isLoading,
    getAllSubmissions,
  } = useSubmissionStore();

  useEffect(() => {
    getAllSubmissions();
  }, [getAllSubmissions]);

  const acceptedSubmissions = useMemo(() => {
    return (submissions || []).filter(
      (submission) =>
        String(submission.status).toUpperCase() === "ACCEPTED"
    );
  }, [submissions]);

  const solvedProblems = useMemo(() => {
    const solvedProblemIds = new Set();

    acceptedSubmissions.forEach((submission) => {
      if (submission.problemId) {
        solvedProblemIds.add(submission.problemId);
      }
    });

    return solvedProblemIds.size;
  }, [acceptedSubmissions]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const avatarUrl =
    authUser?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      authUser?.name || "User"
    )}&background=0D8ABC&color=fff&bold=true`;

  return (
    <div className="min-h-screen w-full px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">
            My <span className="text-primary">Profile</span>
          </h1>

          <p className="mt-2 text-base-content/60">
            View your LeetLab profile and coding progress
          </p>
        </div>

        {/* Profile Card */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">

            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Avatar */}
              <div className="shrink-0">
                <img
                  src={avatarUrl}
                  alt={authUser?.name || "User"}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20"
                />
              </div>

              {/* User Information */}
              <div className="text-center md:text-left flex-1">

                <h2 className="text-3xl font-bold">
                  {authUser?.name || "User"}
                </h2>

                <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-base-content/70">
                  <Mail className="w-5 h-5" />
                  <span>{authUser?.email || "No email available"}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Shield className="w-5 h-5 text-primary" />

                  <span className="badge badge-primary">
                    {authUser?.role || "USER"}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-sm text-base-content/60">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    Member since {formatDate(authUser?.createdAt)}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">

          {/* Problems Solved */}
          <div className="stat bg-base-200 rounded-2xl shadow-md border border-base-300">
            <div className="stat-figure text-success">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="stat-title">
              Problems Solved
            </div>

            <div className="stat-value text-success">
              {isLoading ? "..." : solvedProblems}
            </div>

            <div className="stat-desc">
              Accepted problems
            </div>
          </div>

          {/* Submissions */}
          <div className="stat bg-base-200 rounded-2xl shadow-md border border-base-300">
            <div className="stat-figure text-primary">
              <Code2 className="w-8 h-8" />
            </div>

            <div className="stat-title">
              Submissions
            </div>

            <div className="stat-value text-primary">
              {isLoading ? "..." : submissions?.length || 0}
            </div>

            <div className="stat-desc">
              Total submissions
            </div>
          </div>

          {/* Accepted */}
          <div className="stat bg-base-200 rounded-2xl shadow-md border border-base-300">
            <div className="stat-figure text-success">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="stat-title">
              Accepted
            </div>

            <div className="stat-value text-success">
              {isLoading ? "..." : acceptedSubmissions.length}
            </div>

            <div className="stat-desc">
              Successful submissions
            </div>
          </div>

        </div>

        {/* Account Information */}
        <div className="card bg-base-200 shadow-xl border border-base-300 mt-8">

          <div className="card-body">

            <h2 className="card-title text-2xl mb-5">
              <User className="w-6 h-6 text-primary" />
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="p-4 rounded-xl bg-base-300">
                <p className="text-sm text-base-content/60">
                  Full Name
                </p>

                <p className="font-semibold text-lg mt-1">
                  {authUser?.name || "N/A"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-base-300">
                <p className="text-sm text-base-content/60">
                  Email
                </p>

                <p className="font-semibold text-lg mt-1">
                  {authUser?.email || "N/A"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-base-300">
                <p className="text-sm text-base-content/60">
                  Account Type
                </p>

                <p className="font-semibold text-lg mt-1">
                  {authUser?.role || "USER"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-base-300">
                <p className="text-sm text-base-content/60">
                  Member Since
                </p>

                <p className="font-semibold text-lg mt-1">
                  {formatDate(authUser?.createdAt)}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;