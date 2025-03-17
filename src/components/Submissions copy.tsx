import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  FileText,
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Loader2,
  RefreshCw,
  Play,
  Sparkles,
} from "lucide-react";

interface SubmissionsProps {
  courseId: string;
  assignmentId: string;
}

interface Submission {
  student_name: string;
  student_email: string;
  submission_id: string;
  submission_title: string;
  submission_link: string;
  submission_date: string;
  submission_status: string;
  submission_score: string | number;
  grading_status?: "pending" | "in_progress" | "completed";
  task_id?: string;
}

const Submissions: React.FC<SubmissionsProps> = ({
  courseId,
  assignmentId,
}) => {
  const { user } = useAuth();
  const [submissionsData, setSubmissionsData] = useState<{
    assignment_name: string;
    submissions: Submission[];
  }>({ assignment_name: "", submissions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const [gradingInProgress, setGradingInProgress] = useState(false);
  const [gradingResults, setGradingResults] = useState<{
    assignment_name: string;
    assignment_id: string;
    points_received: number;
    rubric_breakdown: string;
    graded_at: string;
    student_name: string;
    id: number;
    points_possible: number;
    explanation: string;
    submission_id: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "missing":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return <CheckCircle className="h-4 w-4" />;
      case "late":
        return <Clock className="h-4 w-4" />;
      case "missing":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const toggleSubmissionSelection = (submissionId: string) => {
    console.log("Clicked submission ID:", submissionId);
    setSelectedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const initiateGrading = async () => {
    if (selectedSubmissions.size === 0) return;

    setGradingInProgress(true);
    const submissionsToGrade = Array.from(selectedSubmissions);

    try {
      // Start grading for each selected submission
      for (const submissionId of submissionsToGrade) {
        // Initiate grading
        const response = await fetch(
          `http://127.0.0.1:8000/classroom/grade_submission?email=${user?.email}&assignment_id=${assignmentId}&course_id=${courseId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              submission_ids: [submissionId],
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to initiate grading");

        const { task_id } = await response.json();

        // Update submission with task ID and status
        setSubmissionsData((prev) => ({
          ...prev,
          submissions: prev.submissions.map((sub) =>
            sub.submission_id === submissionId
              ? { ...sub, task_id, grading_status: "in_progress" }
              : sub
          ),
        }));

        // Start polling for this submission
        pollGradingStatus(submissionId, task_id);
      }
    } catch (error) {
      console.error("Error initiating grading:", error);
      setError("Failed to start grading process");
    }
  };

  const pollGradingStatus = async (submissionId: string, taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/classroom/task_status/${taskId}`
        );
        if (!response.ok) throw new Error("Failed to check grading status");

        const { status } = await response.json();

        // Log the status and score values
        console.log(`Polling submission ${submissionId}:`, { status });

        if (status.includes("completed")) {
          // Log a message indicating that grading is completed for the submission
          console.log("Grading completed for submission:", submissionId);

          // Stop the polling interval as grading is completed
          clearInterval(pollInterval);

          // Update the state with the new grading status and score for the completed submission
          setSubmissionsData((prev) => {
            const updatedData = {
              ...prev, // Spread the previous state to maintain other data
              submissions: prev.submissions.map(
                (sub) =>
                  sub.submission_id === submissionId
                    ? {
                        ...sub, // Spread the existing submission data
                        grading_status: "completed", // Update grading status to completed
                        submission_score: 100, // Update the submission score with the received score
                      }
                    : sub // Return the submission unchanged if it doesn't match the submissionId
              ),
            };

            // Log the updated submissions data
            console.log("Updated Submissions Data:", updatedData);

            // Check if all submissions are graded using the updated data
            const allCompleted = updatedData.submissions.every((sub) => {
              const isNotSelected = !selectedSubmissions.has(sub.submission_id);
              const isCompleted = sub.grading_status === "completed";
              const grading_status = sub.grading_status;
              // Log the submission ID and the evaluation of each condition
              console.log(`Submission ID: ${sub.submission_id}`);
              console.log(`  Is Not Selected: ${isNotSelected}`);
              console.log(`  Is Completed: ${isCompleted}`);
              console.log(`  Grading Status: ${grading_status}`);
              return isNotSelected || isCompleted;
            });

            console.log("All submissions might be completed:", allCompleted);
            if (allCompleted) {
              // Log a message indicating that all submissions are completed
              console.log("All submissions completed:", allCompleted);

              setGradingInProgress(false);
              setSelectedSubmissions(new Set());
            }

            // Fetch grading results for the completed submission
            fetchGradingResults(submissionId);

            return updatedData;
          });
        } else if (status.includes("failed")) {
          throw new Error(
            `Grading failed for submission with status: ${status}`
          );
        }
      } catch (error) {
        console.error("Error checking grading status:", error);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds
  };

  const fetchGradingResults = async (submissionId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/classroom/graded_submissions?submission_id=${submissionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch grading results");

      const data = await response.json();

      // Extract the latest_graded_submission from the response
      const latestGradedSubmission = data.latest_graded_submission;

      // Log the fetched grading results
      console.log("Fetched Grading Results:", latestGradedSubmission);

      // Set the grading results state with the latest graded submission
      setGradingResults(latestGradedSubmission);
    } catch (error) {
      console.error("Error fetching grading results:", error);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://127.0.0.1:8000/classroom/submissions?email=${user?.email}&course_id=${courseId}&assignment_id=${assignmentId}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setSubmissionsData(data);
        setError("");
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setError("Failed to load submissions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && assignmentId) {
      fetchSubmissions();
    }
  }, [courseId, assignmentId, user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-primary-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-medium">Loading submissions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <AlertCircle className="h-6 w-6" />
          <span className="font-medium">Error loading submissions</span>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {submissionsData.assignment_name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {submissionsData.submissions.length} submissions
          </p>
        </div>

        {selectedSubmissions.size > 0 && (
          <button
            onClick={initiateGrading}
            disabled={gradingInProgress}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-white font-medium text-sm
              ${
                gradingInProgress
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
          >
            {gradingInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Grading in Progress...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Grade Selected ({selectedSubmissions.size})
              </>
            )}
          </button>
        )}
      </div>

      {submissionsData.submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">
            No submissions found for this assignment
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissionsData.submissions.map((submission, index) => (
            <div
              key={submission.submission_id || index}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-200
                ${
                  selectedSubmissions.has(submission.submission_id)
                    ? "border-primary-500 ring-1 ring-primary-500"
                    : "border-gray-100 hover:border-primary-100 hover:shadow-md"
                }`}
            >
              <div className="space-y-4">
                {/* Header with student info and selection */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <h3 className="font-medium text-gray-900">
                        {submission.student_name || "Unknown Student"}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>
                        {submission.student_email || "No email provided"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {submission.grading_status === "in_progress" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Grading...
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          submission.submission_status
                        )}`}
                      >
                        {getStatusIcon(submission.submission_status)}
                        <span className="ml-1">
                          {submission.submission_status || "Unknown"}
                        </span>
                      </span>
                    )}

                    <button
                      onClick={() =>
                        toggleSubmissionSelection(submission.submission_id)
                      }
                      disabled={submission.grading_status === "in_progress"}
                      className={`p-2 rounded-md transition-colors
                        ${
                          selectedSubmissions.has(submission.submission_id)
                            ? "bg-primary-100 text-primary-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {selectedSubmissions.has(submission.submission_id) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submission details */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>{submission.submission_title || "No title"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {submission.submission_date
                          ? formatDate(submission.submission_date)
                          : "No date"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>
                        Score: {submission.submission_score || "Not graded"}
                      </span>
                    </div>
                    {submission.submission_link && (
                      <a
                        href={submission.submission_link}
                        className="inline-flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Submission</span>
                      </a>
                    )}
                  </div>
                </div>

                {gradingResults &&
                  gradingResults.submission_id === submission.submission_id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800">
                        Grading Results for {gradingResults.student_name}
                      </h4>
                      <p>
                        <strong>Assignment Name:</strong>{" "}
                        {gradingResults.assignment_name}
                      </p>
                      <p>
                        <strong>Points Received:</strong>{" "}
                        {gradingResults.points_received}
                      </p>
                      <p>
                        <strong>Points Possible:</strong>{" "}
                        {gradingResults.points_possible}
                      </p>
                      <p>
                        <strong>Rubric Breakdown:</strong>{" "}
                        {gradingResults.rubric_breakdown}
                      </p>
                      <p>
                        <strong>Explanation:</strong>{" "}
                        {gradingResults.explanation}
                      </p>
                      <p>
                        <strong>Graded At:</strong>{" "}
                        {new Date(gradingResults.graded_at).toLocaleString()}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
