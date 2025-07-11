import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  MapPin,
  ChevronRight,
  Loader2,
  AlertCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Course } from "../../services/common";
import { PlatformServiceFactory } from "../../services/PlatformServiceFactory";
import { host, getJwtToken } from "../config";
import { ManualUploadService } from "../../services/ManualUploadService";

// Define props type
type CoursesProps = {
  onCourseSelect: (courseId: string) => void;
  courses?: Course[]; // Optional prop courses
  isManualUploadVisible: boolean;
  refreshTrigger: number;
};

const Courses: React.FC<CoursesProps> = ({
  onCourseSelect,
  courses: propCourses,
  isManualUploadVisible,
  refreshTrigger,
}) => {
  const { isAuthenticated, user, platform } = useAuth();
  const [courses, setCourses] = useState<Course[]>(propCourses || []);
  const [loading, setLoading] = useState(!propCourses || false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<string | null>(null);
  const perPage = 10; // Adjust perPage as needed
  const teacherEmail = user?.email;
  const manualUploadService = new ManualUploadService();
  const token = getJwtToken();

  const fetchCoursesData = async () => {
    if (!isAuthenticated || !user || !platform) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(""); // Clear error at the start of a fetch attempt

    try {
      const service = PlatformServiceFactory.getInstance().getService(platform);

      // Include the JWT token in the headers
      const data = await service.getCourses(
        token,
        teacherEmail || "",
        page,
        perPage
      );

      // Process successful fetch
      setCourses(data.courses || []);

      setError(""); // Clear error on successful fetch
    } catch (err: any) {
      setError(err.message || "Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCoursesCount = async () => {
    if (!teacherEmail) return;

    try {
      const response = await fetch(
        `${host}/courses/count?teacher_email=${teacherEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTotalCourses(data.total_courses);
    } catch (err) {
      console.error("Error fetching total courses count:", err);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!teacherEmail) return;

    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingCourse(courseId);
    setOpenDropdown(null);

    try {
      await manualUploadService.deleteCourse(token, courseId, teacherEmail);

      // Remove the course from the local state
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.id !== courseId)
      );

      // Update total courses count
      setTotalCourses((prev) => prev - 1);
    } catch (err: any) {
      setError(err.message || "Failed to delete course");
      console.error("Error deleting course:", err);
    } finally {
      setDeletingCourse(null);
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
    if (propCourses) {
      setCourses(propCourses);
      setLoading(false);
    } else {
      fetchCoursesData();
      fetchTotalCoursesCount();
    }
  }, [
    propCourses,
    isAuthenticated,
    user,
    platform,
    page,
    perPage,
    refreshTrigger,
  ]);

  // General loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  // Error display
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <div className="text-red-600 mt-2 mb-4">Error: {error}</div>
        <button
          onClick={() => fetchCoursesData()} // Allow retry on error
          className="btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No courses found message (after loading and no error)
  if (
    !loading &&
    courses.length === 0 &&
    !isManualUploadVisible &&
    page === 1
  ) {
    return (
      <div className="text-center py-12 text-gray-500">
        No courses found. Check back later or try uploading again if needed.
      </div>
    );
  }

  // Render courses list and pagination only if manual upload is not visible
  if (!isManualUploadVisible) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Your Courses</h2>
          <div className="text-sm text-gray-500">
            {courses.length} courses shown
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="card p-6 text-left hover:shadow-lg transition-all duration-200 group border border-gray-200 hover:border-indigo-300 relative"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => {
                    console.log("Selected course ID:", course.id);
                    onCourseSelect(String(course.id));
                  }}
                  className="flex items-start justify-between w-full"
                >
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                {/* Three dots menu */}
                <div className="relative ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(
                        openDropdown === String(course.id)
                          ? null
                          : String(course.id)
                      );
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={deletingCourse === String(course.id)}
                  >
                    {deletingCourse === String(course.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    ) : (
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {openDropdown === String(course.id) && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(String(course.id));
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  console.log("Selected course ID:", course.id);
                  onCourseSelect(String(course.id));
                }}
                className="w-full text-left"
              >
                <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {course.name}
                </h3>

                <div className="mt-4 space-y-2">
                  {course.section && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Section {course.section}</span>
                    </div>
                  )}
                  {course.room && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>Room {course.room}</span>
                    </div>
                  )}
                  {/* Display course code if available */}
                  {(course as any).course_code && (
                    <div className="flex items-center text-sm text-gray-600">
                      {/* Placeholder icon or remove if none fits */}
                      <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                        Code: {(course as any).course_code}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center space-x-4 pt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={loading || page * perPage >= totalCourses}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return null; // Return null if manual upload is visible
};

export default Courses;
