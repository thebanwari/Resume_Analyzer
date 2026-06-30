import re
from skills_db import SKILLS


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for skill in SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill)
    return found


def extract_experience_years(text: str) -> int | None:
    patterns = [
        r"(\d+)\+?\s*years?\s+of\s+experience",
        r"(\d+)\+?\s*years?\s+experience",
        r"experience\s+of\s+(\d+)\+?\s*years?",
        r"(\d+)\+?\s*yrs?\s+of\s+experience",
        r"(\d+)\+?\s*yrs?\s+experience",
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    return None


def parse_resume(text: str) -> dict:
    return {
        "skills": extract_skills(text),
        "experience_years": extract_experience_years(text),
    }


def parse_job_description(text: str) -> dict:
    return {
        "required_skills": extract_skills(text),
        "experience_years": extract_experience_years(text),
    }
