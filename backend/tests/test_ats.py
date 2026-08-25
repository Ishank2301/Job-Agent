from app.services.ats_service import score_resume


def test_ats_score_weighting():
    resume = {
        "summary": "python machine learning",
        "skills": ["Python", "Machine Learning"],
        "experience_entries": [
            {
                "bullets": ["Built python models"],
            }
        ],
        "projects": [],
        "personal": {
            "name": "Test",
            "email": "test@example.com",
            "phone": "123",
            "linkedin": "li",
            "github": "gh",
        },
        "education": [],
    }

    result = score_resume(resume, "We need Python and machine learning experience.")

    assert result["score"] > 0
    assert "python" in result["matched_keywords"]
