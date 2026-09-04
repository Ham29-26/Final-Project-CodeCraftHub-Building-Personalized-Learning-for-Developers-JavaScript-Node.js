// app.js

// Import required packages
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Create the Express application
const app = express();

// The server will run on port 5000
const PORT = 5000;

// Store courses.json in the same directory as this file
const DATA_FILE = path.join(__dirname, "../data/courses.json");

// Allowed course status values
const VALID_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed"
];

/*
  express.json() allows the server to read JSON request bodies.

  For example, it allows this request body to be accessed through req.body:

  {
    "name": "REST API Basics",
    "description": "Learn how REST APIs work",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }
*/
app.use(express.json());

/**
 * Make sure courses.json exists.
 *
 * If the file does not exist, create it with an empty array.
 */
async function ensureDataFileExists() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // If the file does not exist, create it
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
    } else {
      // Re-throw other file system errors
      throw error;
    }
  }
}

/**
 * Read all courses from courses.json.
 *
 * @returns {Promise<Array>} An array of courses
 */
async function readCourses() {
  await ensureDataFileExists();

  const fileContents = await fs.readFile(DATA_FILE, "utf8");

  try {
    const courses = JSON.parse(fileContents);

    // Make sure the file contains an array
    if (!Array.isArray(courses)) {
      throw new Error("courses.json must contain a JSON array");
    }

    return courses;
  } catch (error) {
    // This catches invalid JSON syntax
    const jsonError = new Error("Could not parse courses.json");
    jsonError.statusCode = 500;
    throw jsonError;
  }
}

/**
 * Write courses to courses.json.
 *
 * @param {Array} courses The courses to save
 */
async function writeCourses(courses) {
  const fileContents = JSON.stringify(courses, null, 2);

  try {
    await fs.writeFile(DATA_FILE, fileContents, "utf8");
  } catch (error) {
    const writeError = new Error("Could not write to courses.json");
    writeError.statusCode = 500;
    throw writeError;
  }
}

/**
 * Check whether a date is in YYYY-MM-DD format
 * and represents a real calendar date.
 *
 * Examples:
 * - 2026-12-31: valid
 * - 2026-02-30: invalid
 * - 31-12-2026: invalid
 */
function isValidDate(dateString) {
  if (typeof dateString !== "string") {
    return false;
  }

  // First check the exact format
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Validate the fields required to create or replace a course.
 *
 * @param {Object} courseData Course data from the request body
 * @returns {string|null} An error message, or null if valid
 */
function validateCourseData(courseData) {
  const requiredFields = [
    "name",
    "description",
    "target_date",
    "status"
  ];

  // Check for missing required fields
  for (const field of requiredFields) {
    if (
      courseData[field] === undefined ||
      courseData[field] === null ||
      courseData[field] === ""
    ) {
      return `The "${field}" field is required`;
    }
  }

  // Check that name and description are strings
  if (typeof courseData.name !== "string") {
    return "The \"name\" field must be a string";
  }

  if (typeof courseData.description !== "string") {
    return "The \"description\" field must be a string";
  }

  // Check that the target date is valid
  if (!isValidDate(courseData.target_date)) {
    return "The \"target_date\" field must use YYYY-MM-DD format";
  }

  // Check that the status is one of the allowed values
  if (!VALID_STATUSES.includes(courseData.status)) {
    return (
      `Invalid status. Status must be one of: ` +
      `${VALID_STATUSES.join(", ")}`
    );
  }

  return null;
}

/**
 * GET /
 *
 * A simple welcome route to confirm that the API is running.
 */
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the CodeCraftHub API"
  });
});

/**
 * POST /api/courses
 *
 * Create a new course.
 */
app.post("/api/courses", async (req, res, next) => {
  try {
    // Validate the request body
    const validationError = validateCourseData(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const courses = await readCourses();

    /*
      Generate the next numeric ID.

      Starting with 1 means the first course gets ID 1.
      Using Math.max also works if courses have been deleted.
    */
    const highestId = courses.reduce((highest, course) => {
      const courseId = Number(course.id);

      return courseId > highest ? courseId : highest;
    }, 0);

    const newCourse = {
      id: highestId + 1,
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);

    await writeCourses(courses);

    res.status(201).json({
      message: "Course created successfully",
      course: newCourse
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses
 *
 * Get all courses.
 */
app.get("/api/courses", async (req, res, next) => {
  try {
    const courses = await readCourses();

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/:id
 *
 * Get one course by its ID.
 */
app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();

    const courseId = Number(req.params.id);

    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/courses/:id
 *
 * Replace the editable information for an existing course.
 *
 * The request must include:
 * - name
 * - description
 * - target_date
 * - status
 *
 * The id, created_at, and other system fields are preserved by the server.
 */
app.put("/api/courses/:id", async (req, res, next) => {
    try {
      const courses = await readCourses();
      const courseId = Number(req.params.id);
  
      const courseIndex = courses.findIndex(
        (course) => course.id === courseId
      );
  
      if (courseIndex === -1) {
        return res.status(404).json({
          error: "Course not found"
        });
      }
  
      const existingCourse = courses[courseIndex];
  
      // Merge existing course data with incoming fields (use new value if provided, else keep existing)
      const updatedCourse = {
        ...existingCourse,
        name: req.body.name !== undefined ? req.body.name : existingCourse.name,
        description: req.body.description !== undefined ? req.body.description : existingCourse.description,
        target_date: req.body.target_date !== undefined ? req.body.target_date : existingCourse.target_date,
        status: req.body.status !== undefined ? req.body.status : existingCourse.status,
        // Ensure system fields are strictly preserved
        id: existingCourse.id,
        created_at: existingCourse.created_at
      };
  
      courses[courseIndex] = updatedCourse;
  
      await writeCourses(courses);
  
      res.status(200).json({
        message: "Course updated successfully",
        course: updatedCourse
      });
    } catch (error) {
      next(error);
    }
  });

/**
 * DELETE /api/courses/:id
 *
 * Delete a course by its ID.
 */
app.delete("/api/courses/:id", async (req, res, next) => {
  try {
    const courses = await readCourses();

    const courseId = Number(req.params.id);

    const courseIndex = courses.findIndex(
      (course) => course.id === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({
        error: "Course not found"
      });
    }

    // Remove one course from the array
    const deletedCourse = courses.splice(courseIndex, 1)[0];

    await writeCourses(courses);

    res.status(200).json({
      message: "Course deleted successfully",
      course: deletedCourse
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/courses/stats
 *
 * Retrieve summary statistics for all courses.
 *
 * Returns an object containing:
 * - total: The total count of courses.
 * - by_status: An object with counts broken down by status 
 *   ("Not Started", "In Progress", "Completed").
 */
app.get("/api/courses/stats", async (req, res, next) => {
    try {
      const courses = await readCourses();
  
      const statistics = {
        total: courses.length,
        by_status: {
          "Not Started": 0,
          "In Progress": 0,
          "Completed": 0
        }
      };
  
      courses.forEach((course) => {
        if (statistics.by_status[course.status] !== undefined) {
          statistics.by_status[course.status]++;
        }
      });
  
      res.status(200).json(statistics);
    } catch (error) {
      next(error);
    }
  });

/**
 * Handle invalid JSON sent in a request body.
 *
 * For example, this handles malformed JSON such as:
 *
 * {
 *   "name": "Course"
 * 
 * The closing brace is missing.
 */
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: "Request body contains invalid JSON"
    });
  }

  next(error);
});

/**
 * Global error-handling middleware.
 *
 * This catches errors from:
 * - Reading courses.json
 * - Writing courses.json
 * - Parsing courses.json
 * - Unexpected server errors
 */
app.use((error, req, res, next) => {
  console.error("Error:", error.message);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error:
      statusCode === 500
        ? "An internal server error occurred"
        : error.message
  });
});

/**
 * Handle requests to endpoints that do not exist.
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found"
  });
});

/**
 * Start the server on port 5000.
 */
app.listen(PORT, () => {
  console.log(`CodeCraftHub API is running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
