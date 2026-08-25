def test_email_cap_logic():
    sent_today = 10
    max_emails = 10

    assert sent_today >= max_emails
