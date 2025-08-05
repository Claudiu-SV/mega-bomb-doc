# Interview Utilities (`src/utils/interviewUtils.ts`)

This module provides a collection of utility functions designed to format and style data related to interview questions within the application. These helpers are primarily used in the UI components to ensure consistent presentation of time, categories, and difficulties.

## Table of Contents

- Overview
- Functions
  - `formatTime(minutes)`
  - `getCategoryColor(category)`
  - `getDifficultyColor(difficulty)`
- Usage Example

## Overview

The functions in this file are pure, stateless helpers that take a specific piece of data (like time in minutes or a category name) and return a formatted or styled output. This approach centralizes display logic and makes UI components cleaner and more reusable.

## Functions

### `formatTime(minutes)`

Converts a numerical value of minutes into a human-readable string format.

-   **Parameters**:
    -   `minutes: number`: The total time in minutes.
-   **Returns**: `string` - A formatted time string (e.g., "45m", "1h 30m", "2h").
-   **Example**:
    ```typescript
    import { formatTime } from './interviewUtils';

    console.log(formatTime(45));  // "45m"
    console.log(formatTime(90));  // "1h 30m"
    console.log(formatTime(120)); // "2h"
    ```

### `getCategoryColor(category)`

Returns a set of Tailwind CSS classes to apply a specific color scheme based on the question category. This is used for styling UI elements like badges or pills.

-   **Parameters**:
    -   `category: string`: The category of the question (e.g., 'technical', 'behavioral', 'experience').
-   **Returns**: `string` - A string of Tailwind CSS classes for background and text color. If the category is not found, it returns a default gray color.
-   **Example**:
    ```typescript
    import { getCategoryColor } from './interviewUtils';

    const className = getCategoryColor('technical'); // "bg-blue-100 text-blue-800"
    // <span className={className}>Technical</span>
    ```

### `getDifficultyColor(difficulty)`

Returns a set of Tailwind CSS classes to apply a specific color scheme based on the question difficulty.

-   **Parameters**:
    -   `difficulty: string`: The difficulty of the question (e.g., 'easy', 'medium', 'hard').
-   **Returns**: `string` - A string of Tailwind CSS classes for background and text color. If the difficulty is not found, it returns a default gray color.
-   **Example**:
    ```typescript
    import { getDifficultyColor } from './interviewUtils';

    const className = getDifficultyColor('hard'); // "bg-red-100 text-red-800"
    // <span className={className}>Hard</span>
    ```

## Usage Example

Here is an example of how these utilities might be used within a React component to display question details.

```jsx
import { getCategoryColor, getDifficultyColor, formatTime } from './interviewUtils';

function QuestionCard({ question }) {
  return (
    <div className="question-card">
      <p>{question.text}</p>
      <div className="pills">
        <span className={`pill ${getCategoryColor(question.category)}`}>{question.category}</span>
        <span className={`pill ${getDifficultyColor(question.difficulty)}`}>{question.difficulty}</span>
        <span className="pill time-pill">{formatTime(question.suggestedTime)}</span>
      </div>
    </div>
  );
}
```