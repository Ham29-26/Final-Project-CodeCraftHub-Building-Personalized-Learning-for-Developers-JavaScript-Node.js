# CodeCraftHub

Personal learning goal tracker API built with Node.js and Express.

CodeCraftHub allows developers to create and manage courses they want to learn. Course data is stored in a local `courses.json` file, so no database is required.

## Features

- Create new courses
- View all courses
- View a specific course
- Update existing courses
- Delete courses
- Automatically generated numeric course IDs
- Automatically generated creation timestamps
- Course status validation
- Target completion date validation
- JSON file storage
- Automatic creation of `courses.json`
- Error handling for invalid requests and file errors

## Project Structure

```text
codecrafthub/
├── app.js
├── courses.json
├── package.json
└── README.md
The
courses.json
file is created automatically when the application starts or when the first request is made.

Course Fields
Each course contains the following fields:

Field	Description
id
Automatically generated numeric ID
name
Course name; required
description
Course description; required
target_date
Target completion date in
YYYY-MM-DD
format; required
status
Must be
Not Started
,
In Progress
, or
Completed
created_at
Automatically generated ISO timestamp
Example course:

{
  "id": 1,
  "name": "REST API Basics",
  "description": "Learn HTTP methods, routes, and JSON APIs.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-04T12:00:00.000Z"
}
Installation
1. Clone or create the project
Navigate to the project directory:

cd codecrafthub
2. Install dependencies
Install Express using npm:

npm install
This installs the dependencies listed in
package.json
.

Running the Application
Start the API with:

npm start
The server runs on port
5000
:

http://localhost:5000
You can also start the application directly with Node.js:

node app.js
When the server starts successfully, you should see a message similar to:

CodeCraftHub API is running on port 5000
API Documentation
Base URL:

http://localhost:5000
All API requests and responses use JSON.

Create a Course
POST /api/courses
Request
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "REST API Basics",
    "description": "Learn HTTP methods, routes, status codes, and JSON.",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }'
Successful Response
Status:
201 Created

{
  "message": "Course created successfully",
  "course": {
    "id": 1,
    "name": "REST API Basics",
    "description": "Learn HTTP methods, routes, status codes, and JSON.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-09-04T12:00:00.000Z"
  }
}
Required Fields
The request must include:

name
description
target_date
status
Get All Courses
GET /api/courses
Request
curl http://localhost:5000/api/courses
Successful Response
Status:
200 OK

[
  {
    "id": 1,
    "name": "REST API Basics",
    "description": "Learn HTTP methods, routes, status codes, and JSON.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-09-04T12:00:00.000Z"
  }
]
If there are no courses, the API returns an empty array:

[]
Get a Specific Course
GET /api/courses/:id
Replace
:id
with the numeric ID of the course.

Request
curl http://localhost:5000/api/courses/1
Successful Response
Status:
200 OK

{
  "id": 1,
  "name": "REST API Basics",
  "description": "Learn HTTP methods, routes, status codes, and JSON.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-04T12:00:00.000Z"
}
Course Not Found
Status:
404 Not Found

{
  "error": "Course not found"
}
Update a Course
PUT /api/courses/:id
The
PUT
request replaces the editable course information. Include all required fields.

Request
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "REST API Basics with Node.js",
    "description": "Build REST APIs using Node.js and Express.",
    "target_date": "2027-01-15",
    "status": "In Progress"
  }'
Successful Response
Status:
200 OK

{
  "message": "Course updated successfully",
  "course": {
    "id": 1,
    "name": "REST API Basics with Node.js",
    "description": "Build REST APIs using Node.js and Express.",
    "target_date": "2027-01-15",
    "status": "In Progress",
    "created_at": "2026-09-04T12:00:00.000Z"
  }
}
The
id
and
created_at
values are preserved by the server.

Delete a Course
DELETE /api/courses/:id
Request
curl -X DELETE http://localhost:5000/api/courses/1
Successful Response
Status:
200 OK

{
  "message": "Course deleted successfully",
  "course": {
    "id": 1,
    "name": "REST API Basics",
    "description": "Learn HTTP methods, routes, and JSON APIs.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-09-04T12:00:00.000Z"
  }
}
Valid Status Values
The
status
field must be one of the following exact values:

Not Started
In Progress
Completed
Example:

{
  "status": "Completed"
}
An invalid value returns:

Status:
400 Bad Request

{
  "error": "Invalid status. Status must be one of: Not Started, In Progress, Completed"
}
Error Responses
Missing Required Field
Status:
400 Bad Request

{
  "error": "The \"name\" field is required"
}
Invalid Date Format
Status:
400 Bad Request

{
  "error": "The \"target_date\" field must use YYYY-MM-DD format"
}
Invalid JSON
Status:
400 Bad Request

{
  "error": "Request body contains invalid JSON"
}
Course Not Found
Status:
404 Not Found

{
  "error": "Course not found"
}
Unknown Endpoint
Status:
404 Not Found

{
  "error": "Endpoint not found"
}
Server or File Error
Status:
500 Internal Server Error

{
  "error": "An internal server error occurred"
}
Testing the API
You can test the API using any of the following tools:

curl
Postman
Insomnia
Thunder Client for Visual Studio Code
A simple test sequence is:

Create a course using
POST /api/courses
Retrieve all courses using
GET /api/courses
Retrieve the new course using
GET /api/courses/1
Update it using
PUT /api/courses/1
Delete it using
DELETE /api/courses/1
Troubleshooting
npm start
Does Not Work
Make sure dependencies are installed:

npm install
Also confirm that
package.json
contains this script:

{
  "scripts": {
    "start": "node app.js"
  }
}
Cannot Find Module 'express'
Install Express:

npm install express
Port 5000 Is Already in Use
Another application may already be using port
5000
.

On macOS or Linux, identify the process with:

lsof -i :5000
On Windows, use:

netstat -ano | findstr :5000
Stop the other process, then run the application again.

courses.json
Is Not Created
Check that the application has permission to write files in the project directory.

Make sure you are running the application from the correct project folder:

node app.js
The application creates
courses.json
automatically if it does not already exist.

courses.json
Contains Invalid JSON
The file must contain a valid JSON array. A valid empty file looks like this:

[]
You can delete the corrupted
courses.json
file and restart the application. The server will create a new empty file automatically.

Deleting the file removes the courses stored in it.

Requests Return “Course Not Found”
Check that the course ID exists:

curl http://localhost:5000/api/courses
Then use one of the returned numeric IDs in the URL:

curl http://localhost:5000/api/courses/1
Request Body Is Not Being Read
Make sure the request includes the JSON content type header:

Content-Type: application/json
Example:

curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript Fundamentals",
    "description": "Learn the basics of JavaScript.",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }'
Limitations
This project uses a JSON file instead of a database. It is suitable for learning and small local projects, but it is not designed for:

Multiple users
High traffic
Simultaneous file writes
Advanced searching or filtering
Production-scale data storage
undefined
