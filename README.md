# Mega Bomb Doc - AI-Powered RecruitAI

> An intelligent web application that analyzes candidate resumes against job requirements and generates tailored interview questions using OpenAI's GPT models.

## 🚀 Features

### Core Functionality

- **Smart Job Requirements Form** with 35+ predefined IT job titles and descriptions
- **Resume Upload & Analysis** with drag-and-drop interface
- **AI-Powered Interview Generation** using OpenAI GPT models
- **PDF Export** of generated interview questions
- **Responsive Design** optimized for desktop and mobile

### Key Highlights

- ✅ **Predefined IT Jobs Database** - Quick selection from Software Engineer, Data Scientist, DevOps Engineer, and 32+ other roles
- ✅ **Auto-fill Job Descriptions** - Automatically populate job descriptions when selecting predefined roles
- ✅ **Resume Parsing** - Upload PDF/DOC resumes with progress tracking
- ✅ **Contextual Interview Questions** - AI generates questions based on job requirements and candidate's background
- ✅ **Export Functionality** - Download interview questions as PDF
- ✅ **Form Validation** - Comprehensive validation with error handling
- ✅ **State Management** - Persistent application state with Zustand

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **React Query** for server state management
- **React Hot Toast** for notifications

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **OpenAI API** for interview question generation
- **Multer** for file upload handling
- **CORS** enabled for cross-origin requests

### Development Tools

- **ESLint** with TypeScript support
- **Concurrently** for running frontend and backend
- **ts-node-dev** for backend development

## 📦 Installation

### Prerequisites

- Node.js (v20.19.0 or higher)
- npm or yarn
- OpenAI API key

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mega-bomb-doc
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**

   ```bash
   cd server
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

5. **Build the backend**
   ```bash
   npm run server:build
   ```

## 🚀 Usage

### Development Mode

Run both frontend and backend concurrently:

```bash
npm start
      },
      // other options...
    },
  },
])
```
