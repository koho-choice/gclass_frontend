import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Award,
  Loader2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Assignment } from "../../services/common";
import { PlatformServiceFactory } from "../../services/PlatformServiceFactory";
import { getJwtToken } from "../config";
import { ManualUploadService } from "../../services/ManualUploadService";

interface AssignmentsProps {
  courseId: string;
  onAssignmentSelect: (assignmentId: string) => void;
}

const Assignments: React.FC<AssignmentsProps> = ({
  courseId,
  onAssignmentSelect,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<string | null>(
    null
  );
  const { user, platform } = useAuth();
  const token = getJwtToken();
  const manualUploadService = new ManualUploadService();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!user?.email) return;

    if (
      !confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingAssignment(assignmentId);
    setOpenDropdown(null);

    try {
      await manualUploadService.deleteAssignment(
        token,
        assignmentId,
        user.email
      );

      // Remove the assignment from the local state
      setAssignments((prevAssignments) =>
        prevAssignments.filter((assignment) => assignment.id !== assignmentId)
      );
    } catch (err: any) {
      setError(err.message || "Failed to delete assignment");
      console.error("Error deleting assignment:", err);
    } finally {
      setDeletingAssignment(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  useEffect(() => {
    if (courseId && platform && user?.email) {
      setLoading(true);
      const service = PlatformServiceFactory.getInstance().getService(platform);

      service
        .getAssignments(token, courseId, user.email)
        .then((data) => {
          setAssignments(data.assignments);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching assignments:", err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [courseId, user?.email, platform]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 text-primary-600">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-medium">Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <AlertCircle className="h-6 w-6" />
          <span className="font-medium">Error loading assignments</span>
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
        <h2 className="text-2xl font-semibold text-gray-900">Assignments</h2>
        <div className="text-sm text-gray-500">{assignments.length} total</div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500">
            No assignments found for this course
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="w-full group bg-white rounded-xl p-6 shadow-sm border border-gray-100 
                         hover:border-primary-100 hover:shadow-md transition-all duration-200 relative"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => onAssignmentSelect(String(assignment.id))}
                  className="flex-1 text-left"
                >
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <h3
                        className="font-medium text-gray-900 group-hover:text-primary-600 
                                   transition-colors line-clamp-2"
                      >
                        {assignment.title}
                      </h3>
                      <ChevronRight
                        className="h-5 w-5 text-gray-400 group-hover:text-primary-600 
                                            transition-colors flex-shrink-0 ml-4"
                      />
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {platform === "manual"
                            ? "Manual upload"
                            : `Due ${formatDate(assignment.due_date)}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span>
                          {assignment.max_points ? assignment.max_points : "0"}{" "}
                          points
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Three dots menu - only show for manual platform */}
                {platform === "manual" && (
                  <div className="relative ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(
                          openDropdown === String(assignment.id)
                            ? null
                            : String(assignment.id)
                        );
                      }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={deletingAssignment === String(assignment.id)}
                    >
                      {deletingAssignment === String(assignment.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      ) : (
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      )}
                    </button>

                    {/* Dropdown menu */}
                    {openDropdown === String(assignment.id) && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignment(String(assignment.id));
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
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

export default Assignments;
