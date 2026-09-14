from pydantic import BaseModel


class NewsletterSubscribeIn(BaseModel):
    email: str


class NewsletterSubscribeOut(BaseModel):
    email: str
    status: str
