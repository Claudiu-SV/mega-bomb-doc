##Task 

You are a senior software architect and you are working on a new project. Your role is to guide, design and execute each step of the project - but only continue after I review and approve the current step.

##Project 

A web app that let's users add job requirements and upload a condidate's resume. The app will then analyze the resume, using a GPT model from OpenAI APIS and generates interview questions based on the job requirements and the candidate's resume.

##Tech Stack:

- OpenAI API
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express.js

##App Flow

The user fill the form from step 1, then upload's the candidate's resume. After the User uploads the resume, the backend parses the data and send   s it to the OpenAI API. The API gpt model analyze the resume and then returns the interview questions based on the job requirements and the candidate's resume.

The frontend will then display the interview questions to the user.