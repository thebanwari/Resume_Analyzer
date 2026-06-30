from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from parser import parse_resume, parse_job_description
from matcher import compute_tfidf_score, compute_skill_score, compute_final_score, generate_explanation

app = FastAPI(
    title="Smart Resume Screening API",
    description="AI-powered resume screening using TF-IDF + Cosine Similarity and skill extraction.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Resume(BaseModel):
    name: str = Field(..., example="Alice")
    text: str = Field(..., example="Python developer with 3 years of experience in Django and PostgreSQL.")


class ScreeningRequest(BaseModel):
    job_description: str = Field(..., example="Looking for a Python developer with Django, PostgreSQL, and REST API skills.")
    resumes: list[Resume] = Field(..., min_length=1)


class ResumeResult(BaseModel):
    name: str
    match_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    explanation: str


class ScreeningResponse(BaseModel):
    total_resumes: int
    results: list[ResumeResult]


@app.get("/")
def root():
    return {
        "message": "Smart Resume Screening API is running.",
        "docs": "http://localhost:8000/docs",
        "endpoint": "POST /screen",
    }


@app.post("/screen", response_model=ScreeningResponse)
def screen_resumes(request: ScreeningRequest):
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description cannot be empty.")

    jd_parsed = parse_job_description(request.job_description)
    results = []

    for resume in request.resumes:
        if not resume.text.strip():
            raise HTTPException(status_code=400, detail=f"Resume '{resume.name}' has empty text.")

        resume_parsed = parse_resume(resume.text)
        tfidf_score = compute_tfidf_score(request.job_description, resume.text)
        skill_score, matched, missing = compute_skill_score(
            jd_parsed["required_skills"], resume_parsed["skills"]
        )
        final_score = compute_final_score(tfidf_score, skill_score)
        explanation = generate_explanation(
            final_score, matched, missing,
            resume_parsed["experience_years"],
            jd_parsed["experience_years"],
        )

        results.append(ResumeResult(
            name=resume.name,
            match_score=final_score,
            matched_skills=matched,
            missing_skills=missing,
            explanation=explanation,
        ))

    results.sort(key=lambda r: r.match_score, reverse=True)
    return ScreeningResponse(total_resumes=len(results), results=results)
