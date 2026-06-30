# HireFilter — Candidate Ranking Tool

A full-stack candidate screening system built with **FastAPI** (backend) and **HTML/CSS/JS** (frontend). Paste a Job Description and candidate resumes — HireFilter ranks them by relevance using TF-IDF scoring, skill gap detection, and contextual keyword matching.

---

## Project Structure

```
mxpetz/
├── backend/
│   ├── main.py          # FastAPI app with POST /screen endpoint
│   ├── parser.py        # Extracts skills and experience from text
│   ├── matcher.py       # TF-IDF scoring, skill comparison, explanation
│   ├── skills_db.py     # Curated list of 80+ tech and soft skills
│   └── requirements.txt
│
├── frontend/
│   ├── index.html       # UI — open directly in browser
│   ├── style.css        # Light theme, Plus Jakarta Sans font
│   └── app.js           # Calls backend API, renders ranked results
│
└── README.md
```

---

## Approach

### 1. Resume Parsing

Resume text and Job Description are scanned against a hand-curated skills database (`skills_db.py`) using **regex word-boundary matching** to extract:

- **Skills** — matched from 80+ common tech and soft skills (Python, Docker, React, SQL, Agile, etc.)
- **Experience years** — extracted using patterns like `"3 years of experience"`, `"4+ yrs experience"`

### 2. Matching Logic — TF-IDF + Cosine Similarity

Two signals are combined into a final score:

| Signal | Weight | Purpose |
|---|---|---|
| **Skill Match Ratio** | 60% | Direct comparison of skills found in JD vs resume |
| **TF-IDF Cosine Similarity** | 40% | Captures contextual keyword overlap beyond listed skills |

```
final_score = round((0.6 × skill_score + 0.4 × tfidf_score) × 100)
```

- TF-IDF vectorizes both texts using unigrams + bigrams (`ngram_range=(1,2)`)
- Cosine Similarity is computed via `scikit-learn`
- Results are sorted by score (highest first)

### 3. Output Per Candidate

| Field | Description |
|---|---|
| `match_score` | Integer from 0–100 |
| `matched_skills` | Skills present in both JD and resume |
| `missing_skills` | Skills required by JD but absent from resume |
| `explanation` | 2–3 line human-readable summary |

---

## Setup

### Prerequisites

- Python 3.10+
- pip

### Install Dependencies

```bash
cd mxpetz/backend
pip install -r requirements.txt
```

---

## Running the App

### Start Backend

```bash
cd backend
uvicorn main:app --reload
```

API will be live at `http://127.0.0.1:8000`

### Open Frontend

```
frontend/index.html  →  double-click to open in browser
```

> Make sure the backend is running before using the frontend.

---

## API Reference

### `POST /screen`

Matches one or more resumes against a job description.

**Request Body:**
```json
{
  "job_description": "Looking for a Python developer with 3 years of experience in Django, PostgreSQL, REST API, and Docker.",
  "resumes": [
    {
      "name": "Alice",
      "text": "Python developer with 4 years of experience. Skilled in Django, PostgreSQL, REST API, Git, and Linux."
    },
    {
      "name": "Bob",
      "text": "Java developer with 2 years of experience in Spring Boot, MySQL, and Angular."
    }
  ]
}
```

**Response:**
```json
{
  "total_resumes": 2,
  "results": [
    {
      "name": "Alice",
      "match_score": 82,
      "matched_skills": ["django", "postgresql", "python", "rest api"],
      "missing_skills": ["docker"],
      "explanation": "Strong match with a score of 82/100. Candidate has 4 matching skill(s): django, postgresql, python, rest api. Missing key skill(s): docker. Candidate has 4 year(s) of experience, meeting the 3-year requirement."
    },
    {
      "name": "Bob",
      "match_score": 21,
      "matched_skills": ["java", "mysql", "spring boot"],
      "missing_skills": ["django", "docker", "postgresql", "python", "rest api"],
      "explanation": "Weak match with a score of 21/100. Candidate has 3 matching skill(s): java, mysql, spring boot. Missing key skill(s): django, docker, postgresql, python and 1 more. Candidate has 2 year(s) of experience, below the required 3 year(s)."
    }
  ]
}
```

### `GET /`

Health check — confirms the API is running.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.10+ |
| Matching | scikit-learn (TF-IDF + Cosine Similarity) |
| Parsing | Python `re` (regex) |
| Frontend | HTML, CSS, Vanilla JS |
| Server | Uvicorn |