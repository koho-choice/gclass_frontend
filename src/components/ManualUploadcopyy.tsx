import React, { useState } from "react";
import Courses from "./Courses"; // Ensure this path is correct

const ManualUpload = ({ onCourseSelect }) => {
  const [courseName, setCourseName] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<any[]>([]); // Adjust type as needed

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile || !csvFile || !courseName || !assignmentName) {
      alert("Please fill in all fields and upload both files.");
      return;
    }

    const formData = new FormData();
    formData.append("course_name", courseName);
    formData.append("assignment_name", assignmentName);
    formData.append("assignment_zip", zipFile);
    formData.append("gradebook_csv", csvFile);

    try {
      const response = await fetch("/upload_zip", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
      // Assuming the response contains the course data
      setCourses([{ id: "manual", name: courseName, section: "", room: "" }]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Assignment Name"
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
          required
        />
        <input
          type="file"
          accept=".zip"
          onChange={(e) => handleFileChange(e, setZipFile)}
          required
        />
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileChange(e, setCsvFile)}
          required
        />
        <button type="submit">Upload</button>
      </form>

      {courses.length > 0 && (
        <Courses onCourseSelect={onCourseSelect} courses={courses} />
      )}
    </div>
  );
};

export default ManualUpload;
