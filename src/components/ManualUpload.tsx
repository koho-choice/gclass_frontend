import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Upload, FileUp, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { host, getJwtToken } from "../config";
import { useAuth } from "../context/AuthContext";
import { ManualUploadService } from "../../services/ManualUploadService";

interface Course {
  id: string;
  name: string;
  section: string;
  room: string;
}

interface ManualUploadProps {
  onCourseSelect: (course: Course) => void;
  onUploadComplete: () => void;
}

const ManualUpload: React.FC<ManualUploadProps> = ({
  onCourseSelect,
  onUploadComplete,
}) => {
  const [courseName, setCourseName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [existingCourses, setExistingCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [assignmentName, setAssignmentName] = useState("");
  const [pointsPossible, setPointsPossible] = useState<number>(0.0);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingCourseAdded, setIsCheckingCourseAdded] = useState(false);
  const { user } = useAuth();
  const email = user?.email;
  const [isValidZip, setIsValidZip] = useState(false);
  const [isValidCsv, setIsValidCsv] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const token = getJwtToken();
  const manualUploadService = new ManualUploadService();

  // Fetch existing courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      if (!email) return;

      setLoadingCourses(true);
      try {
        // First, get a reasonable number of courses to check total
        const initialData = await manualUploadService.getCourses(
          token,
          email,
          1,
          50
        );

        let allCourses = [...initialData.courses];

        // If there are more courses, fetch them in batches
        if (initialData.total_courses > 50) {
          const totalPages = Math.ceil(initialData.total_courses / 50);

          // Fetch remaining pages
          for (let page = 2; page <= totalPages; page++) {
            const pageData = await manualUploadService.getCourses(
              token,
              email,
              page,
              50
            );
            allCourses.push(...pageData.courses);
          }
        }

        // Convert courses to match the local interface
        const convertedCourses: Course[] = allCourses.map((course) => ({
          id: String(course.id),
          name: course.name,
          section: course.section || "",
          room: course.room || "",
        }));

        setExistingCourses(convertedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        // Don't show error to user, just continue with new course option
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [email, token]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    fileType: string,
    setIsValid: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isValidType =
        (fileType === "application/zip" &&
          (file.type === "application/zip" ||
            file.type === "application/x-zip-compressed" ||
            file.type === "application/x-zip" ||
            file.type === "multipart/x-zip")) ||
        (fileType === "text/csv" && file.type === "text/csv");

      const isValidName =
        fileType === "application/zip"
          ? file.name.includes("submissions")
          : true;

      //console.log("file.type", file.type, "file.name", file.name);
      if (!isValidType || !isValidName) {
        setError(
          `Please upload a valid ${fileType} file${
            fileType === "application/zip"
              ? ' with "submissions" in its name'
              : ""
          }.`
        );
        setIsValid(false);
        return;
      }

      setFile(file);
      setIsValid(true);
      setError(null);
    }
  };

  const handleCourseSelection = (value: string) => {
    if (value === "new_course") {
      setIsNewCourse(true);
      setSelectedCourseId("");
      setCourseName("");
    } else {
      setIsNewCourse(false);
      setSelectedCourseId(value);
      const selectedCourse = existingCourses.find(
        (course) => course.id === value
      );
      setCourseName(selectedCourse?.name || "");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!zipFile || !csvFile || !assignmentName) {
      setError("Please fill in all fields and upload both files.");
      return;
    }

    if (!isNewCourse && !selectedCourseId) {
      setError("Please select a course or choose to create a new one.");
      return;
    }

    if (isNewCourse && !courseName) {
      setError("Please enter a course name for the new course.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("course_name", courseName);
    formData.append("assignment_name", assignmentName);
    formData.append("points_possible", pointsPossible.toString());
    formData.append("assignment_zip", zipFile);
    formData.append("gradebook_csv", csvFile);
    formData.append("teacher_email", email || "");

    try {
      const response = await fetch(`${host}/upload_zip`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed. Please try again.");
      }

      const data = await response.json();
      console.log(data);

      // Start polling to check if the course was added successfully
      setIsCheckingCourseAdded(true);
      const pollingInterval = setInterval(async () => {
        try {
          const courseAddedResponse = await fetch(
            `${host}/manual/course_added`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                course_name: courseName,
                email,
              }),
            }
          );

          if (!courseAddedResponse.ok) {
            console.error(
              "Failed to add course:",
              courseAddedResponse.statusText
            );
            return;
          }

          const responseData = await courseAddedResponse.json();

          if (
            responseData &&
            responseData.message === "Course has been added"
          ) {
            console.log("Course successfully added!");
            clearInterval(pollingInterval); // Stop polling once the course is added
            setIsCheckingCourseAdded(false);
            onUploadComplete();
          } else {
            console.log("Waiting for course to be added...");
          }
        } catch (error) {
          console.error("Error polling course status:", error);
        }
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Course Upload</h1>
          <p className="text-muted-foreground">
            Upload your course materials and gradebook
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseSelection">Course</Label>
                {loadingCourses ? (
                  <div className="text-sm text-muted-foreground">
                    Loading courses...
                  </div>
                ) : (
                  <>
                    <select
                      id="courseSelection"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={isNewCourse ? "new_course" : selectedCourseId}
                      onChange={(e) => handleCourseSelection(e.target.value)}
                      required
                    >
                      <option value="">Select a course...</option>
                      {existingCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                      <option value="new_course">+ Create New Course</option>
                    </select>

                    {isNewCourse && (
                      <div className="mt-2">
                        <Input
                          placeholder="Enter new course name"
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignmentName">Assignment Name</Label>
                <Input
                  id="assignmentName"
                  placeholder="Enter assignment name"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsPossible">Max Points</Label>
                <Input
                  id="pointsPossible"
                  type="number"
                  placeholder="Enter points possible"
                  value={pointsPossible}
                  onChange={(e) =>
                    setPointsPossible(parseFloat(e.target.value))
                  }
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipFile">Assignment ZIP File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="zipFile"
                    type="file"
                    accept=".zip"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setZipFile,
                        "application/zip",
                        setIsValidZip,
                        setZipError
                      )
                    }
                    required
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <FileUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">Gradebook CSV</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        setCsvFile,
                        "text/csv",
                        setIsValidCsv,
                        setCsvError
                      )
                    }
                    required
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <FileUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {zipError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{zipError}</AlertDescription>
              </Alert>
            )}

            {csvError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{csvError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isUploading ||
                isCheckingCourseAdded ||
                !isValidZip ||
                !isValidCsv ||
                (zipFile && !zipFile.name.includes("submissions")) ||
                loadingCourses
              }
            >
              {isUploading || isCheckingCourseAdded ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Checking..."}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ManualUpload;
