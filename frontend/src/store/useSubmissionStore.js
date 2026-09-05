import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set) => ({
  // ============================================
  // State
  // ============================================

  isLoading: false,
  isSubmitting: false,

  submissions: [],
  submission: null,
  submissionCount: 0,


  // ============================================
  // Get all submissions of current user
  // ============================================

  getAllSubmissions: async () => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        "/submission/get-all-submissions"
      );

      set({
        submissions: res.data.submissions || [],
      });

      return res.data;

    } catch (error) {
      console.error(
        "Error getting all submissions:",
        error
      );

      toast.error(
        error.response?.data?.error ||
          "Error getting all submissions"
      );

      return null;

    } finally {
      set({ isLoading: false });
    }
  },


  // ============================================
  // Get submissions for a specific problem
  // ============================================

  getSubmissionForProblem: async (problemId) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        `/submission/get-submission/${problemId}`
      );

      set({
        submissions: res.data.submissions || [],
      });

      return res.data;

    } catch (error) {
      console.error(
        "Error getting submissions for problem:",
        error
      );

      toast.error(
        error.response?.data?.error ||
          "Error getting submissions for problem"
      );

      return null;

    } finally {
      set({ isLoading: false });
    }
  },


  // ============================================
  // Get total submission count for a problem
  // ============================================

  getSubmissionCountForProblem: async (problemId) => {
    try {
      const res = await axiosInstance.get(
        `/submission/get-submissions-count/${problemId}`
      );

      set({
        submissionCount: res.data.count || 0,
      });

      return res.data;

    } catch (error) {
      console.error(
        "Error getting submission count for problem:",
        error
      );

      toast.error(
        error.response?.data?.error ||
          "Error getting submission count for problem"
      );

      return null;
    }
  },


  // ============================================
  // Submit solution
  // ============================================

  submitSolution: async ({
    source_code,
    language_id,
    language,
    problemId,
    stdin,
    expected_outputs,
  }) => {
    try {
      set({
        isSubmitting: true,
      });

      console.log(
        "Submitting solution:",
        {
          source_code,
          language_id,
          language,
          problemId,
          stdin,
          expected_outputs,
        }
      );

      const res = await axiosInstance.post(
        "/submission/create",
        {
          source_code,
          language_id,
          language,
          problemId,
          stdin,
          expected_outputs,
        }
      );

      console.log(
        "Submission response:",
        res.data
      );

      // Save returned submission
      set({
        submission: res.data.submission || null,
      });

      // Show result
      if (res.data.passed === true) {
        toast.success(
          "Solution Accepted!"
        );
      } else {
        toast.error(
          "Solution submitted, but some test cases failed."
        );
      }

      return res.data;

    } catch (error) {
      console.error(
        "Error submitting solution:",
        error
      );

      toast.error(
        error.response?.data?.error ||
          "Error submitting solution"
      );

      return null;

    } finally {
      set({
        isSubmitting: false,
      });
    }
  },


  // ============================================
  // Clear current submission
  // ============================================

  clearSubmission: () => {
    set({
      submission: null,
    });
  },


  // ============================================
  // Clear submissions
  // ============================================

  clearSubmissions: () => {
    set({
      submissions: [],
    });
  },
}));