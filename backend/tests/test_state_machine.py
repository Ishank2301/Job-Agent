from app.models import ApplicationStatus
from app.services.state_machine import can_transition


def test_saved_can_move_to_applied():
    assert can_transition(ApplicationStatus.SAVED, ApplicationStatus.APPLIED)


def test_saved_cannot_move_to_offer():
    assert not can_transition(ApplicationStatus.SAVED, ApplicationStatus.OFFER)


def test_offer_is_terminal():
    assert not can_transition(ApplicationStatus.OFFER, ApplicationStatus.REJECTED)
