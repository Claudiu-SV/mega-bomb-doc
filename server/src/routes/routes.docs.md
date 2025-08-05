# API Routes

This directory contains the Express router modules that define the API endpoints for the application server.

## Table of Contents

-   [Interview Routes (`interview.ts`)](#interview-routes-interviewts)
    -   POST `/api/interview/generate`
-   File Upload Routes (`fileUpload.ts`)
    -   POST `/api/upload/resume`

---

## Interview Routes (`interview.ts`)

This module handles all endpoints related to generating interview content.

### POST `/api/interview/generate`

Generates a set of interview questions tailored to specific job requirements and a candidate's resume.

-   **Description**: This endpoint receives job requirements and a path to a previously uploaded resume. It then calls the `generateInterviewQuestions` service to create a customized interview.
-   **Middleware**:
    -   `validateJobRequirements`: Ensures the `jobRequirements` object in the request body is valid.
    -   `validateResumePath`: Ensures the `resumePath` string in the request body is valid and points to a real file.
-   **Request Body**:

    ```json
    {
      "jobRequirements": {
        "title": "Software Engineer",
        "description": "...",
        "skills": ["React", "Node.js", "TypeScript"]
      },
      "resumePath": "/uploads/resume-167...9.pdf"
    }
    ```

-   **Success Response (200)**:

    ```json
    {
      "interview": {
        "questions": [
          { "id": "...", "text": "...", "category": "...", ... }
        ]
      }
    }
    ```

-   **Error Responses**:
    -   `400 Bad Request`: If `jobRequirements` or `resumePath` are missing or invalid.
    -   `500 Internal Server Error`: If the interview generation service fails.

---

## File Upload Routes (`fileUpload.ts`)

This module, using `multer`, handles file uploads for the application.

### POST `/api/upload/resume`

Uploads a single resume file.

-   **Description**: Accepts `multipart/form-data` with a single file under the field name `resume`. It validates the file type (PDF, DOC, DOCX) and size (max 5MB) and saves it to the `/uploads` directory on the server.
-   **Request Body**: `FormData` containing a file with the key `resume`.
-   **Success Response (200)**:

    ```json
    {
      "message": "Resume uploaded successfully",
      "file": {
        "filename": "resume-167...9.pdf",
        "originalname": "my_resume.pdf",
        "path": "/uploads/resume-167...9.pdf",
        "size": 123456
      }
    }
    ```

-   **Error Responses**:
    -   `400 Bad Request`: If no file is provided.
    -   `500 Internal Server Error`: If there is an issue with saving the file.