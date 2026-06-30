from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_tfidf_score(jd_text: str, resume_text: str) -> float:
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    try:
        tfidf_matrix = vectorizer.fit_transform([jd_text, resume_text])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(score)
    except ValueError:
        return 0.0


def compute_skill_score(jd_skills: list[str], resume_skills: list[str]) -> tuple[float, list[str], list[str]]:
    if not jd_skills:
        return 0.0, [], []

    jd_set = set(jd_skills)
    resume_set = set(resume_skills)
    matched = sorted(jd_set & resume_set)
    missing = sorted(jd_set - resume_set)
    skill_score = len(matched) / len(jd_set)
    return skill_score, matched, missing


def compute_final_score(tfidf_score: float, skill_score: float) -> int:
    raw = (0.4 * tfidf_score) + (0.6 * skill_score)
    return min(100, round(raw * 100))


def generate_explanation(
    score: int,
    matched: list[str],
    missing: list[str],
    resume_exp: int | None,
    jd_exp: int | None,
) -> str:
    lines = []

    if score >= 65:
        lines.append(f"Strong match with a score of {score}/100.")
    elif score >= 35:
        lines.append(f"Moderate match with a score of {score}/100.")
    else:
        lines.append(f"Weak match with a score of {score}/100.")

    if matched:
        sample = ", ".join(matched[:5])
        suffix = f" and {len(matched) - 5} more" if len(matched) > 5 else ""
        lines.append(f"Candidate has {len(matched)} matching skill(s): {sample}{suffix}.")
    else:
        lines.append("No required skills matched.")

    if missing:
        sample = ", ".join(missing[:4])
        suffix = f" and {len(missing) - 4} more" if len(missing) > 4 else ""
        lines.append(f"Missing key skill(s): {sample}{suffix}.")

    if jd_exp is not None and resume_exp is not None:
        if resume_exp >= jd_exp:
            lines.append(f"Candidate has {resume_exp} yr(s) of experience, meeting the {jd_exp}-yr requirement.")
        else:
            lines.append(f"Candidate has {resume_exp} yr(s) of experience, below the required {jd_exp} yr(s).")

    return " ".join(lines)
