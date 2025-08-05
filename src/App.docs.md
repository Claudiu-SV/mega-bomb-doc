# Main Application Component (`App.tsx`)

`App.tsx` is the root component of the application. It acts as the central orchestrator, managing the application's overall state, controlling the user workflow, and rendering the appropriate child components based on the current step in the process.

## Table of Contents

-   Overview
-   State Management
-   Application Workflow
    -   Step 1: `job-requirements`
    -   Step 2: `resume-upload`
    -   Step 3: `generating`
    -   Step 4: `results`
-   Core Functions
    -   `handleJobRequirementsSubmit`
    -   `handleResumeUpload`
    -   `handleGenerateInterview`
    -   `handleStartOver`
-   Component Rendering

## Overview

This component is responsible for:

-   **Workflow Management**: It guides the user through a multi-step process, from entering job requirements to viewing the generated interview questions.
-   **State Orchestration**: It uses a `zustand` store (`useAppStore`) to manage global application state like the current step, user inputs, and API data.
-   **API Interaction**: It calls functions from the `api.ts` service to communicate with the backend for file uploads and data generation.
-   **Conditional Rendering**: It renders different UI components (`JobRequirementsForm`, `ResumeUpload`, `InterviewQuestions`, etc.) depending on the `currentStep` in the state.

## State Management

The component connects to `useAppStore` to get and set the following key pieces of state:

-   `currentStep`: The current stage of the application workflow.
-   `jobRequirements`: The job details entered by the user.
-   `resume`: The uploaded resume data.
-   `uploadProgress`: The status and percentage of the resume file upload.
-   `generatedInterview`: The final interview data received from the backend.
-   `isLoading`: A boolean to control loading states and disable UI elements.

## Application Workflow

The application flow is determined by the `currentStep` state value.

### Step 1: `job-requirements`

-   **Component**: `JobRequirementsForm`
-   **Action**: The user fills out the form with details about the job.
-   **Handler**: `handleJobRequirementsSubmit` is triggered on form submission. It saves the job requirements to the store and advances the `currentStep` to `resume-upload`.

### Step 2: `resume-upload`

-   **Component**: `ResumeUpload`
-   **Action**: The user uploads a resume file.
-   **Handler**: `handleResumeUpload` is triggered. This function:
    1.  Calls the `uploadResume` API service.
    2.  Tracks and updates the upload progress.
    3.  Uses `adaptResumeToFrontend` to convert the API response.
    4.  Saves the formatted resume data to the store.
    5.  Automatically calls `handleGenerateInterview` to proceed to the next step.

### Step 3: `generating`

-   **Component**: `LoadingSpinner`
-   **Action**: The application is waiting for the backend to generate questions.
-   **Handler**: `handleGenerateInterview` is executing. This function:
    1.  Calls the `generateInterview` API service with the job requirements and resume path.
    2.  Uses `createInterviewFromBackend` to adapt the response.
    3.  Saves the final `GeneratedInterview` object to the store.
    4.  Advances the `currentStep` to `results`.

### Step 4: `results`

-   **Component**: `InterviewQuestions`
-   **Action**: The user can view, filter, and interact with the generated questions.
-   **Handler**: The user can choose to `handleStartOver` to reset the application or `handleExport` (a placeholder for future PDF generation).

## Core Functions

### `handleJobRequirementsSubmit`

Takes the form data, adds an ID and timestamp, and updates the application state before moving to the next step.

### `handleResumeUpload`

Manages the entire resume upload process, including progress tracking, calling the API service, adapting the response, and handling errors.

### `handleGenerateInterview`

Orchestrates the call to the backend to generate interview questions. It ensures that both `jobRequirements` and `resume` data are present before making the API request.

### `handleStartOver`

Calls the `resetApp` action from the store to clear all state and return the user to the first step.

## Component Rendering

The `renderCurrentStep` function uses a `switch` statement based on the `currentStep` state to determine which main component to display. This keeps the main `return` statement of the `App` component clean and declarative.

The `Layout` and `Steps` components are rendered on every step to provide a consistent UI shell and progress indicator.

```jsx
return (
  <Layout>
    <Steps />
    {renderCurrentStep()}
  </Layout>
);
```

This structure ensures a clear separation of concerns, where `App.tsx` handles the "business logic" of the frontend, and the child components are responsible for the UI presentation of each step.