import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
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
import ManualUpload from "./components/ManualUpload";
import { host } from "./config";
import ScrollToTopButton from "./components/ScrollToTopButton";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsofService";
import Success from "./payments/Success";
import Cancel from "./payments/Cancel";
import PortalButton from "./components/PortalButton";
import Modal from "react-modal";

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
  const {
    isAuthenticated,
    setIsAuthenticated,
    user,
    platform,
    subMessage,
    setSubMessage,
  } = useAuth();
  // get the user name
  const userName = user?.name;
  const email = user?.email;
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [gradingStatus, setGradingStatus] = useState<GradingStatus>("pending");

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isManualUploadVisible, setIsManualUploadVisible] =
    useState<boolean>(false);

  const [rubricPreview, setRubricPreview] = useState<string | null>(null);
  const [showRubricPreview, setShowRubricPreview] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [courseAdded, setCourseAdded] = useState<boolean>(false);
  const [coursesRefreshTrigger, setCoursesRefreshTrigger] = useState<number>(0);

  const [upgradeModalIsOpen, setUpgradeModalIsOpen] = useState(false);
  const { fetchSubscriptionStatus } = useAuth();

  const [trialModalIsOpen, setTrialModalIsOpen] = useState(false);

  useEffect(() => {
    // Reset state when platform changes
    setSelectedCourseId(null);
    setIsManualUploadVisible(false);
  }, [platform]);

  useEffect(() => {
    if (courseAdded) {
      console.log("Course added, refreshing courses...");
      setCoursesRefreshTrigger((prev) => prev + 1); // Increment to trigger refresh
      setCourseAdded(false); // Reset the state after refreshing
      // Logic to refresh courses
    }
  }, [courseAdded]);

  useEffect(() => {
    const checkSubscription = async () => {
      fetchSubscriptionStatus();
    };
    checkSubscription();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (isAuthenticated) {
      const checkSubscription = async () => {
        if (subMessage === "trialing") {
          setTrialModalIsOpen(true);
        } else if (subMessage && subMessage !== "paid") {
          console.log("subMessage", subMessage);
          setUpgradeModalIsOpen(true);
        } else {
          setUpgradeModalIsOpen(false);
        }
      };
      checkSubscription();
    }
  }, [isAuthenticated, subMessage]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setGradingStatus("pending");
    setSelectedCourseId(null);
    setSelectedAssignmentId(null);
    sessionStorage.removeItem("user");
    setIsManualUploadVisible(false);
    sessionStorage.removeItem("jwtToken");
    sessionStorage.removeItem("platform");
    sessionStorage.removeItem("subMessage");
    setSubMessage(null); // Add this line to reset the subscription message state
    setTrialModalIsOpen(false);
    setUpgradeModalIsOpen(false);
  };

  const handleCoursesLoaded = () => {
    console.log("Courses component reported loaded after processing.");
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setSelectedAssignmentId(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="w-full mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <h1 className="ml-3 text-2xl font-bold text-gray-900">
                  Crex Grader
                </h1>
              </Link>
              {!isAuthenticated ? (
                <Login />
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end text-sm">
                    <div className="flex items-center mb-1">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-700">{userName}</span>
                    </div>
                    <PortalButton />
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

        <main className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900">
                      Welcome to Crex Grader
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Sign in to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {!selectedCourseId ? (
                      <>
                        <Courses
                          refreshTrigger={coursesRefreshTrigger}
                          isManualUploadVisible={isManualUploadVisible}
                          onCourseSelect={(courseId: string) =>
                            setSelectedCourseId(courseId)
                          }
                        />
                        {platform === "manual" && !isManualUploadVisible && (
                          <button
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsManualUploadVisible(true)}
                          >
                            Add Manual Class
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                          <button
                            className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
                            onClick={handleBackToCourses}
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
                            setRubricPreview={setRubricPreview}
                            setShowRubricPreview={setShowRubricPreview}
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

                    {platform === "manual" && isManualUploadVisible && (
                      <>
                        <button
                          className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
                          onClick={() => setIsManualUploadVisible(false)}
                        >
                          &larr; Back
                        </button>
                        <ManualUpload
                          onCourseSelect={() => {}}
                          onUploadComplete={() => {
                            console.log(
                              "Upload complete, setting courseAdded to true"
                            );
                            setIsManualUploadVisible(false);
                            setCourseAdded(true); // Trigger course refresh
                          }}
                        />
                      </>
                    )}
                  </>
                )
              }
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
          </Routes>
        </main>

        <footer className="bg-white shadow-sm">
          <div className="w-full mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <Link
                to="/privacy-policy"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="text-sm text-gray-600 hover:text-gray-800 ml-2"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>

        <ScrollToTopButton />

        <Modal
          isOpen={upgradeModalIsOpen}
          contentLabel="Upgrade Modal"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "80%",
              maxWidth: "400px",
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
            },
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Upgrade Required</h2>
            <button
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <p className="mb-4">
            Your current subscription does not allow access. Please upgrade to
            continue.
          </p>
          <PortalButton />
        </Modal>

        <Modal
          isOpen={trialModalIsOpen}
          onRequestClose={() => setTrialModalIsOpen(false)}
          contentLabel="Trial Expiration Modal"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              width: "80%",
              maxWidth: "400px",
            },
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
            },
          }}
        >
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            onClick={() => setTrialModalIsOpen(false)}
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-2">
            Trial Expiration Notice
          </h2>
          <p className="mb-4">
            Your 14 day trial expires soon. Please upgrade to continue using
            Crex after the trial.
          </p>
          <PortalButton />
        </Modal>
      </div>
    </Router>
  );
}

export default App;
