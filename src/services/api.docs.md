# API Service Module (`src/services/api.ts`)

This module is responsible for all communication with the backend server. It handles API requests for uploading resumes, generating interview questions, and adapting the data received from the backend into a format suitable for the frontend application.

## Table of Contents

- Overview
- Setup
- API Functions
  - `uploadResume(file, onProgress)`
  - `generateInterview(jobRequirements, resumePath)`
- Data Adaptation
  - `adaptResumeToFrontend(backendResume, file)`
  - `adaptQuestionToFrontend(backendQuestion)`
  - `createInterviewFromBackend(backendInterview, jobRequirements, resume)`
- Type Definitions
- Helper Functions

## Overview

The service module provides a set of asynchronous functions to interact with the backend API. It uses `axios` for making HTTP requests. Key functionalities include:

- Uploading resume files.
- Generating tailored interview questions based on job requirements and a resume.
- Transforming backend data structures into frontend-compatible types.

## Setup

An `axios` instance is created with a base URL pointing to the backend server.

-   **Base URL**: `http://localhost:5000/api`
-   **Default Headers**: `Content-Type: 'application/json'`

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## API Functions

### `uploadResume(file, onProgress)`

Uploads a resume file to the backend.

-   **Parameters**:
    -   `file: File`: The resume file to be uploaded.
    -   `onProgress?: (progress: number) => void`: An optional callback function to track upload progress. It receives a number from 0 to 100.
-   **Returns**: `Promise<BackendResume>` - A promise that resolves with the backend representation of the uploaded resume.

### `generateInterview(jobRequirements, resumePath)`

Requests the generation of interview questions from the backend.

-   **Parameters**:
    -   `jobRequirements: JobRequirements`: An object containing the job title, description, and required skills.
    -   `resumePath: string`: The path to the previously uploaded resume on the backend.
-   **Returns**: `Promise<BackendGeneratedInterview>` - A promise that resolves with the generated interview questions from the backend.

## Data Adaptation

This module includes several "adapter" functions to convert data structures from the backend format to the frontend format. This separation of concerns keeps the frontend components clean and unaware of the backend's data schema.

### `adaptResumeToFrontend(backendResume, file)`

Converts a `BackendResume` object to a frontend `Resume` object.

-   **Parameters**:
    -   `backendResume: BackendResume`: The resume object from the backend.
    -   `file?: File`: The original `File` object, used to supplement information if needed.
-   **Returns**: `Resume` - The frontend-compatible resume object.

### `adaptQuestionToFrontend(backendQuestion)`

Converts a `BackendInterviewQuestion` object to a frontend `InterviewQuestion` object. It also maps categories, difficulties, and estimates a suggested time.

-   **Parameters**:
    -   `backendQuestion: BackendInterviewQuestion`: The question object from the backend.
-   **Returns**: `InterviewQuestion` - The frontend-compatible question object.

### `createInterviewFromBackend(backendInterview, jobRequirements, resume)`

Creates a complete `GeneratedInterview` object for the frontend, combining the generated questions with the original job requirements and resume data.

-   **Parameters**:
    -   `backendInterview: BackendGeneratedInterview`: The interview data from the backend.
    -   `jobRequirements: JobRequirements`: The job requirements used for generation.
    -   `resume: Resume`: The frontend resume object.
-   **Returns**: `GeneratedInterview` - A complete interview object ready for use in the UI.

## Type Definitions

The module defines both frontend and backend types to ensure type safety and clarity when handling data from the API.

-   **Frontend Types**: `GeneratedInterview`, `InterviewQuestion`, `JobRequirements`, `Resume`. These are imported from a central `../types` file.
-   **Backend Types**: `BackendResume`, `BackendInterviewQuestion`, `BackendGeneratedInterview`. These are defined locally within `api.ts` to represent the shape of the data coming from the server.

## Helper Functions

Internal helper functions are used for mapping values between backend and frontend models:

-   `mapCategory(backendCategory)`: Maps backend category strings to frontend enum-like types.
-   `mapDifficulty(backendDifficulty)`: Maps backend difficulty strings to frontend enum-like types.
-   `estimateSuggestedTime(difficulty)`: Provides a default time suggestion based on question difficulty.