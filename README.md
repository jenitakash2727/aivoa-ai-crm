# 🏥 AIVOA.AI – AI-First CRM for HCP Interactions

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Redux](https://img.shields.io/badge/Redux-Toolkit-purple.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)
![Groq](https://img.shields.io/badge/Groq-Gemma2--9B--IT-red.svg)
![LangGraph](https://img.shields.io/badge/LangGraph-AI-blue.svg)

</div>

---

# 📖 Overview

**AIVOA.AI CRM** is an AI-First Customer Relationship Management (CRM) application designed for Healthcare Professional (HCP) interactions.

The application enables medical representatives to log interactions using either:

- 📋 Structured Form Interface
- 💬 Conversational AI Chat Interface

The AI workflow is powered by **LangGraph** and **Groq LLM (Gemma2-9B-IT)** to summarize conversations, extract entities, analyze sentiment, recommend follow-ups, and manage HCP interaction history.

This project was developed as part of the **AIVOA.AI Full Stack Developer Assignment**.

---

# ✨ Features

## 🤖 AI Features

- Natural Language Understanding
- Conversational CRM
- Auto Form Filling
- AI Interaction Summary
- Entity Extraction
- Sentiment Analysis
- Follow-up Recommendation
- Intelligent Search

---

## 📋 CRM Features

- Log HCP Interaction
- Edit Existing Interaction
- Search HCP
- View Interaction History
- AI Follow-up Suggestions
- Redux State Management
- REST API Integration

---

# 🛠 Tech Stack

## Frontend

- React 18
- Redux Toolkit
- Material UI
- Axios
- Google Inter Font

---

## Backend

- Django
- Django REST Framework
- Python

---

## AI

- LangGraph
- Groq API
- Gemma2-9B-IT
- LLaMA-3.3-70B (optional)

---

## Database

- MySQL

---

## Version Control

- Git
- GitHub

---

# 🤖 LangGraph Agent

The LangGraph agent acts as the central AI coordinator of the CRM.

It receives user requests, determines which tool should be executed, communicates with the Groq LLM, processes structured data, and stores information inside the database.

Workflow:

```
User
      │
      ▼
React Frontend
      │
      ▼
Django REST API
      │
      ▼
LangGraph Agent
      │
 ┌────┼─────┬──────┬──────┬──────┐
 ▼    ▼     ▼      ▼      ▼
Tool1 Tool2 Tool3 Tool4 Tool5
      │
      ▼
Groq LLM
      │
      ▼
MySQL Database
      │
      ▼
Response to React UI
```

---

# 🛠 Five LangGraph Tools

---

## Tool 1 – Log Interaction

### Purpose

Capture HCP interactions using Form or Chat.

### AI Processing

- Extract Doctor Name
- Hospital
- Specialty
- Meeting Date
- Interaction Type
- Discussion Topics
- Sentiment
- Key Points
- Follow-up Actions

### Output

- Stores interaction
- Generates AI Summary
- Saves into MySQL

Example

```
Input:

Today I met Dr Rajesh Kumar from Apollo Hospital.
We discussed CardioMax trial.
Doctor showed positive interest.

Output:

✔ Interaction Saved
✔ Summary Generated
✔ Sentiment : Positive
✔ Next Follow-up Suggested
```

---

## Tool 2 – Edit Interaction

### Purpose

Modify an existing interaction.

Example

```
Edit Dr Rajesh Kumar interaction type to Call

OR

Update notes to discuss new clinical data.
```

Output

```
✔ Interaction Updated Successfully
```

---

## Tool 3 – Search HCP

### Purpose

Search Healthcare Professionals.

Supports

- Name
- Hospital
- Specialty

Example

```
Search Dr Rajesh Kumar
```

Output

```
Doctor Details

Hospital

Specialty

Interaction Count
```

---

## Tool 4 – Get HCP History

### Purpose

Retrieve complete interaction history.

Output

- Previous Meetings
- Call History
- Sentiment Trend
- Summary
- Timeline

Example

```
Show history for Dr Rajesh Kumar
```

---

## Tool 5 – Suggest Next Steps

### Purpose

Generate AI-powered recommendations.

Example

```
What should I do next with Dr Rajesh Kumar?
```

Output

```
Schedule Follow-up Meeting

Share Clinical Trial PDF

Discuss Product Benefits
```

---

# 🏗 Architecture

```
                React + Redux
                      │
                      ▼
              Django REST API
                      │
                      ▼
              LangGraph Agent
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
 Log Interaction   Edit Tool   Search Tool
        ▼             ▼              ▼
      Groq LLM    Entity Extraction
                      │
                      ▼
                 MySQL Database
                      │
                      ▼
               Response to UI
```

---

# 📂 Project Structure

```
aivoa-ai-crm/

│

├── backend/

│     ├── hcp/

│     ├── crm/

│     ├── api/

│     ├── langgraph/

│     ├── manage.py

│

├── frontend/

│     ├── src/

│     ├── components/

│     ├── redux/

│     ├── pages/

│

├── README.md

├── requirements.txt

├── package.json

└── .gitignore
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/jenitakash2727/aivoa-ai-crm.git
```

---

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file in the backend folder.

```env
GROQ_API_KEY=your_groq_api_key_here

DEBUG=True

SECRET_KEY=your_secret_key

DB_NAME=crm_db

DB_USER=your_db_user

DB_PASSWORD=your_db_password

DB_HOST=localhost

DB_PORT=3306
```

---

# 📡 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/chat` | AI Chat |
| POST | `/api/interactions/log` | Log Interaction |
| PUT | `/api/interactions/edit` | Edit Interaction |
| GET | `/api/hcps/search` | Search HCP |
| GET | `/api/hcps/{id}/history` | HCP History |
| GET | `/api/hcps/{id}/suggest` | AI Suggestions |

---

# 🗄 Database

## HCP Table

```
id

name

specialty

hospital

email

phone

created_at
```

---

## Interaction Table

```
id

hcp_id

interaction_date

interaction_type

summary

key_points

sentiment

next_steps

created_by

created_at

updated_at
```

---

# 🎥 Video Demonstration

The submitted demonstration video includes:

- Frontend Walkthrough
- Structured Form Demo
- Chat Interface Demo
- All Five LangGraph Tools
- AI Workflow
- Backend API
- Database Storage
- Project Structure
- Assignment Understanding

---

# ✅ Assignment Requirements Covered

- React Frontend
- Redux State Management
- Django Backend
- REST APIs
- LangGraph Integration
- Groq LLM
- Gemma2-9B-IT
- Five LangGraph Tools
- MySQL Database
- AI Chat Interface
- Structured Form
- Entity Extraction
- AI Summary
- Sentiment Analysis

---

# 🚀 Future Improvements

- JWT Authentication
- Multi-user CRM
- Dashboard Analytics
- Voice Interaction
- Calendar Integration
- Email Automation
- Mobile Application
- Advanced Reporting

---

