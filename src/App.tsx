import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  FileCheck,
  RefreshCw,
  Upload,
  AlertCircle,
  ChevronDown,
  LogIn,
  User,
  LogOut,
  Loader2,
  Check,
  X,
  EyeOff,
  MessageSquare,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Login from "./components/Login";
import { useAuth } from "./context/AuthContext";
import Courses from "./components/Courses";
import Assignments from "./components/Assignments";
import Submissions from "./components/Submissions";

type RubricFeedback = {
  criterionId: string;
  points: number;
  feedback: string;
  suggestions: string[];
};

type Submission = {
  id: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  attachments: string[];
  grade?: number;
  selected?: boolean;
  grading?: boolean;
  regrading?: boolean;
  feedback?: RubricFeedback[];
};

type GradingStatus = "pending" | "inProgress" | "completed";

function App() {
  const { isAuthenticated, setIsAuthenticated, user } = useAuth();
  // get the user name
  const userName = user?.name;
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [gradingStatus, setGradingStatus] = useState<GradingStatus>("pending");

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setGradingStatus("pending");
    setSelectedCourseId(null);
    setSelectedAssignmentId(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Crex Classroom Assistant
              </h1>
            </div>
            {!isAuthenticated ? (
              <Login />
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700">{userName}</span>
                </div>
                <button
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">
              Welcome to Crex Classroom Assistant
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Connect with Google Classroom to get started
            </p>
          </div>
        ) : (
          <>
            {!selectedCourseId ? (
              <Courses
                onCourseSelect={(courseId: string) =>
                  setSelectedCourseId(courseId)
                }
              />
            ) : (
              <>
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <button
                    className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
                    onClick={() => setSelectedCourseId(null)}
                  >
                    &larr; Back to Courses!
                  </button>
                  <Assignments
                    courseId={selectedCourseId}
                    onAssignmentSelect={(assignmentId: string) =>
                      setSelectedAssignmentId(assignmentId)
                    }
                  />
                </div>

                {selectedAssignmentId && (
                  <Submissions
                    courseId={selectedCourseId}
                    assignmentId={selectedAssignmentId}
                  />
                )}

                {gradingStatus === "completed" && (
                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      onClick={() => setShowCanvasModal(true)}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Upload to Canvas
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
