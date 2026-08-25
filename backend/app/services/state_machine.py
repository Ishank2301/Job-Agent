from app.models import ApplicationStatus

VALID_TRANSITIONS = {
    ApplicationStatus.SAVED: {
        ApplicationStatus.APPLIED,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.APPLIED: {
        ApplicationStatus.ASSESSMENT,
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.ASSESSMENT: {
        ApplicationStatus.INTERVIEW,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.INTERVIEW: {
        ApplicationStatus.OFFER,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.OFFER: set(),
    ApplicationStatus.REJECTED: set(),
}


def can_transition(current: ApplicationStatus, next_status: ApplicationStatus) -> bool:
    if current not in VALID_TRANSITIONS:
        return False

    return next_status in VALID_TRANSITIONS[current]
