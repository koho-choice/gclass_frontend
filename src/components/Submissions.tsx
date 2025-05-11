import React, { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
  XCircle,
  Info,
} from "lucide-react";
import * as XLSX from "xlsx";
import { host, getJwtToken } from "../config";
import { PlatformServiceFactory } from "../../services/PlatformServiceFactory";
import { Submission } from "../../services/common";
import { ManualUploadService } from "../../services/ManualUploadService";
import { CanvasService } from "../../services/CanvasService";
import { ClassroomService } from "../../services/ClassroomService";
import mammoth from "mammoth";

interface SubmissionsProps {
  courseId: string;
  assignmentId: string;
  setRubricPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setShowRubricPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

const Submissions: React.FC<SubmissionsProps> = ({
  courseId,
  assignmentId,
  setRubricPreview,
  setShowRubricPreview,
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
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [selectedRubricFileId, setSelectedRubricFileId] = useState<
    string | null
  >(null);
  const [rubricText, setRubricText] = useState<string>("");
  const [rubricData, setRubricData] = useState<string | null>(null);
  const { platform } = useAuth();
  const [allSelected, setAllSelected] = useState(false);
  const [rubricSource, setRubricSource] = useState<
    "generated" | "uploaded" | null
  >(null);
  const [rubricLoading, setRubricLoading] = useState(false);
  const [gradedSubmissions, setGradedSubmissions] = useState<Map<string, any>>(
    new Map()
  );
  const [gradingInProgress, setGradingInProgress] = useState(false);
  const [gradingStarted, setGradingStarted] = useState(false);
  const [gradedCount, setGradedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const token = getJwtToken();
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
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "late":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "missing":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    // Update the selected submissions state
    setSelectedSubmissions((prev) => {
      // Create a new Set from the previous state
      const newSet = new Set(prev);

      // Check if the submissionId is already in the set
      if (newSet.has(submissionId)) {
        // If it is, remove it (deselect)
        newSet.delete(submissionId);
      } else {
        // If it isn't, add it (select)
        newSet.add(submissionId);
      }

      // Log the count of selected submissions

      // Return the updated set
      return newSet;
    });
  };

  const toggleExpandedSubmission = (submissionId: string) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const handleRubricTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setRubricText(e.target.value);
  };

  const generateRubricPreview = async () => {
    if (!rubricText) return;

    setRubricLoading(true);

    try {
      const response = await fetch(`${host}/api/generate_rubric_preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: rubricText }),
      });

      if (response.ok) {
        const data = await response.json();
        setRubricData(data.rubric);
        setRubricPreview(data.rubric);
        setShowRubricPreview(true);

        setRubricSource("generated");
      } else {
        console.error("Failed to generate rubric preview");
      }
    } catch (error) {
      console.error("Error generating rubric preview:", error);
    } finally {
      setRubricLoading(false);
    }
  };

  const handleSubmissionClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
  };

  const handleSubmissionLinkClick = async (
    submissionId: string,
    submissionLink: string
  ) => {
    if (platform === "manual") {
      try {
        const manualUploadService = new ManualUploadService();
        const { submission_link } = await manualUploadService.getSubmissionLink(
          token,
          submissionId
        );
        window.open(submission_link, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("Error fetching manual submission link:", error);
      }
    } else {
      window.open(submissionLink, "_blank", "noopener,noreferrer");
    }
  };

  const renderRubricTable = (rubricDataStr: string) => {
    if (rubricSource === "uploaded") {
      return null;
    }

    let rubricData;
    try {
      rubricData = JSON.parse(rubricDataStr);
    } catch (error) {
      console.error("Failed to parse rubric data:", error);
      return <p>Error parsing rubric data</p>;
    }

    return (
      <div className="overflow-x-auto">
        <h3 className="text-lg font-bold mb-4">{rubricData.title}</h3>
        <p className="mb-4">{rubricData.description}</p>
        {rubricData.criteria.map((criterion: any, index: number) => (
          <div key={index} className="mb-6">
            <h4 className="text-md font-semibold mb-2">{criterion.name}</h4>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Level</th>
                  <th className="py-2 px-4 border-b">Points</th>
                  <th className="py-2 px-4 border-b">Description</th>
                </tr>
              </thead>
              <tbody>
                {criterion.levels.map((level: any, levelIndex: number) => (
                  <tr key={levelIndex} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{level.label}</td>
                    <td className="py-2 px-4 border-b">{level.points}</td>
                    <td className="py-2 px-4 border-b">{level.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedSubmissions(new Set());
    } else {
      const allSubmissionIds = submissionsData.submissions.map(
        (submission) => submission.submission_id
      );
      setSelectedSubmissions(new Set(allSubmissionIds));
    }
    setAllSelected(!allSelected);
  };

  const getService = () => {
    switch (platform) {
      case "manual":
        return new ManualUploadService();
      case "canvas":
        return new CanvasService();
      case "classroom":
        return new ClassroomService();
      default:
        throw new Error("Unsupported platform");
    }
  };

  const fetchGradedSubmissionWithPolling = async (submission_id: string) => {
    const maxAttempts = 10; // Maximum number of attempts
    let attempts = 0;

    const poll = async () => {
      try {
        const service = getService();
        const gradedSubmission = await service.getGradedSubmission(
          token,
          submission_id
        );
        console.log(
          `Fetched graded submission for ID ${submission_id}:`,
          gradedSubmission
        );

        if (gradedSubmission && gradedSubmission.latest_graded_submission) {
          setGradedSubmissions((prev) => {
            const newMap = new Map(prev);
            newMap.set(
              String(submission_id),
              gradedSubmission.latest_graded_submission
            );
            console.log(
              "Updated gradedSubmissions state:",
              Array.from(newMap.entries())
            );
            return newMap;
          });

          // Update the submissionsData state to trigger a re-render
          setSubmissionsData((prevData) => {
            const updatedSubmissions = prevData.submissions.map(
              (submission) => {
                if (submission.submission_id === submission_id) {
                  return {
                    ...submission,
                    submission_score:
                      gradedSubmission.latest_graded_submission.points_received,
                  };
                }
                return submission;
              }
            );

            return {
              ...prevData,
              submissions: updatedSubmissions,
            };
          });
        } else {
          console.warn(
            `No graded submission data for ID ${submission_id} yet. Retrying...`
          );
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 1000); // Retry after 1 seconds
          } else {
            console.error(
              `Max attempts reached for submission ID ${submission_id}.`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error fetching graded submission for ID ${submission_id}:`,
          error
        );
      }
    };

    poll();
  };

  const handleGradeSubmissions = async () => {
    if (!rubricData) {
      console.error("Error: No rubric provided.");
      alert("Please provide a rubric before grading.");
      return;
    }
    setGradingInProgress(true);
    setGradingStarted(true);

    try {
      console.log("Selected submissions:", selectedSubmissions);
      const submissionIds = Array.from(selectedSubmissions);
      console.log("Submission IDs:", submissionIds);

      // Set totalCount immediately after determining the number of submissions
      const totalSubmissions = submissionIds.length;
      setTotalCount(totalSubmissions);
      console.log("Total submissions:", totalSubmissions);

      const service = getService();
      const response = await service.gradeSubmission({
        token,
        email: user?.email,
        courseId,
        assignmentId,
        submissionIds,
        rubric: rubricData,
      });
      console.log("Grading task started with task ID:", response.task_id);

      const gradedList = new Set<number>();

      // Function to check submission statuses
      const checkStatuses = async () => {
        const statuses = await service.fetchSubmissionStatuses(
          token,
          submissionIds
        );
        let newGraded = false;

        statuses.forEach(async ({ submission_id, status }) => {
          if (!gradedList.has(submission_id)) {
            if (status === "graded") {
              console.log(`Submission ${submission_id} is graded.`);
              fetchGradedSubmissionWithPolling(submission_id);
              gradedList.add(submission_id);

              newGraded = true;
            }
          }
        });

        // Track progress
        const gradedCount = gradedList.size;
        setGradedCount(gradedCount); // Update graded count
        console.log(
          `Graded ${gradedCount} out of ${totalSubmissions} submissions.`
        );

        if (gradedCount < totalSubmissions) {
          setTimeout(checkStatuses, 5000); // Retry after 5 seconds
        } else {
          setGradingInProgress(false);
          // No need to set totalCount here again since it's already set
        }
      };

      // Start checking statuses
      checkStatuses();
    } catch (error) {
      console.error("Error grading submissions:", error);
      setGradingInProgress(false);
    }
  };

  const exportAllGradedSubmissionsToCSV = () => {
    // First CSV: Basic Graded Submissions
    const basicCsvData = [
      [
        "Student",
        "ID",
        "SIS User ID",
        "SIS Login ID",
        "Section",
        submissionsData.assignment_name,
      ],
      [
        "Points Possible",
        "",
        "",
        "",
        "",
        submissionsData.submissions[0]?.points_possible || "",
      ],
    ];

    gradedSubmissions.forEach((submission) => {
      basicCsvData.push([
        submission.student_name,
        "",
        "",
        "",
        "",
        submission.points_received,
      ]);
    });

    const basicWorksheet = XLSX.utils.aoa_to_sheet(basicCsvData);
    const basicWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      basicWorkbook,
      basicWorksheet,
      "Graded Submissions"
    );
    XLSX.writeFile(basicWorkbook, "graded_submissions.csv");

    // Second CSV: Detailed Graded Submissions
    const detailedCsvData = [
      ["Student", "Points Received", "Rubric Breakdown", "Explanation"],
    ];

    gradedSubmissions.forEach((submission) => {
      detailedCsvData.push([
        submission.student_name,
        submission.points_received,
        submission.rubric_breakdown,
        submission.explanation,
      ]);
    });

    const detailedWorksheet = XLSX.utils.aoa_to_sheet(detailedCsvData);
    const detailedWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      detailedWorkbook,
      detailedWorksheet,
      "Detailed Graded Submissions"
    );
    XLSX.writeFile(detailedWorkbook, "detailed_graded_submissions.csv");
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          setRubricData(result.value);
          console.log("Rubric Data from .docx:", result.value);
          setRubricSource("uploaded");
        } catch (error) {
          console.error("Error reading .docx file:", error);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === "string") {
            setRubricData(content);
            console.log("Rubric Data from file:", content);
            setRubricSource("uploaded");
          }
        };
        reader.readAsText(file);
      }
    }
  };

  useEffect(() => {
    if (platform && user) {
      const service = PlatformServiceFactory.getInstance().getService(platform);
      setLoading(true);

      service
        .getSubmissions(token, courseId, assignmentId, user.email)
        .then((data) => {
          setSubmissionsData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [courseId, assignmentId, platform, user]);

  useEffect(() => {
    if (gradingStarted && !gradingInProgress) {
      alert("All done!");
      setGradingStarted(false);
    }
  }, [gradingInProgress, gradingStarted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-indigo-600">
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
          <XCircle className="h-6 w-6" />
          <span className="font-medium">Error loading submissions</span>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            {submissionsData.assignment_name}
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {gradingInProgress
                ? `${gradedCount} / ${totalCount} graded`
                : `${selectedSubmissions.size} / ${submissionsData.submissions.length} submissions selected`}
            </span>
            {rubricData && (
              <span
                className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 cursor-pointer"
                onClick={() => setRubricData(null)}
              >
                Rubric provided. Click to remove.
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {selectedSubmissions.size > 0 && (
            <button
              onClick={handleGradeSubmissions}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
            >
              {gradingInProgress
                ? `Now grading ${selectedSubmissions.size} assignments`
                : "Grade selected assignments"}
            </button>
          )}

          <button
            onClick={handleSelectAll}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>

          <button
            onClick={exportAllGradedSubmissionsToCSV}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {submissionsData.submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">
            No submissions found for this assignment
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissionsData.submissions.map((submission, index) => {
            const isGraded = gradedSubmissions.has(
              String(submission.submission_id)
            );
            if (isGraded) {
              console.log(
                `Rendering graded results for submission ID: ${submission.submission_id}`
              );
            }
            return (
              <div
                key={submission.submission_id || index}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200
                  ${
                    selectedSubmissions.has(submission.submission_id)
                      ? "border-indigo-500 ring-1 ring-indigo-500"
                      : "border-gray-100 hover:border-indigo-100"
                  }`}
                onClick={() => handleSubmissionClick(submission.submission_id)}
              >
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Header with student info and selection */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <h3 className="font-semibold text-gray-900">
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
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            submission.submission_status
                          )}`}
                        >
                          {getStatusIcon(submission.submission_status)}
                          <span className="ml-2">
                            {submission.submission_status || "Unknown"}
                          </span>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubmissionSelection(submission.submission_id);
                          }}
                          className={`p-2 rounded-md transition-colors
                            ${
                              selectedSubmissions.has(submission.submission_id)
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          aria-label={
                            selectedSubmissions.has(submission.submission_id)
                              ? "Deselect submission"
                              : "Select submission"
                          }
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
                    <div className="grid md:grid-cols-2 gap-4 py-4 border-y border-gray-100">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>
                            {submission.submission_title || "No title"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {platform === "manual"
                              ? "Manual upload"
                              : submission.submission_date
                              ? formatDate(submission.submission_date)
                              : "No date"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span>
                            Score:{" "}
                            {submission.points_possible
                              ? gradedSubmissions.has(
                                  String(submission.submission_id)
                                )
                                ? `${
                                    gradedSubmissions.get(
                                      String(submission.submission_id)
                                    ).points_received
                                  }/${
                                    gradedSubmissions.get(
                                      String(submission.submission_id)
                                    ).points_possible
                                  }`
                                : submission.submission_score !== "No score"
                                ? `${submission.submission_score}/${submission.points_possible}`
                                : "Not graded"
                              : "Not graded"}
                          </span>
                        </div>
                        {submission.submission_link && (
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmissionLinkClick(
                                submission.submission_id,
                                submission.submission_link
                              );
                            }}
                            className="inline-flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View Submission</span>
                          </a>
                        )}
                      </div>
                    </div>
                    {isGraded && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800">
                          Grading Results for{" "}
                          {
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).student_name
                          }
                        </h4>
                        <p>
                          <strong>Assignment Name:</strong>{" "}
                          {
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).assignment_name
                          }
                        </p>
                        <p>
                          <strong>Points Received:</strong>{" "}
                          {
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).points_received
                          }
                        </p>
                        <p>
                          <strong>Points Possible:</strong>{" "}
                          {
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).points_possible
                          }
                        </p>
                        <p>
                          <strong>Rubric Breakdown:</strong>{" "}
                          {
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).rubric_breakdown
                          }
                        </p>
                        <p>
                          <strong>Explanation:</strong>{" "}
                          {
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).explanation
                          }
                        </p>
                        <p>
                          <strong>Graded At:</strong>{" "}
                          {new Date(
                            gradedSubmissions.get(
                              String(submission.submission_id)
                            ).graded_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center space-x-4">
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Upload Rubric
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt,.json,.docx" // Adjust the accepted file types as needed
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <textarea
        value={rubricText}
        onChange={handleRubricTextChange}
        placeholder="Enter your assignment prompt if you'd like to generate a rubric. You can say things like 'give me a 10 point rubric on the prompt: what is the meaning of life, don't penalize for grammar'"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={generateRubricPreview}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        disabled={rubricLoading}
      >
        {rubricLoading ? "Generating..." : "Generate a rubric"}
      </button>
      <div className="mt-6">{rubricData && renderRubricTable(rubricData)}</div>
      <button
        onClick={scrollToBottom}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Click to add rubric
      </button>
    </div>
  );
};

export default Submissions;
