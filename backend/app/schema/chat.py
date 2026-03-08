"""Pydantic schemas for chat API."""
from datetime import date
from typing import Optional
from pydantic import BaseModel, field_validator


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    response: str


class IntentCategorize(BaseModel):
    intent: str
    date_range_start: Optional[date] = None # "YYYY-MM-DD"
    date_range_end: Optional[date] = None # "YYYY-MM-DD"

    @field_validator("date_range_start", "date_range_end", mode="before")
    @classmethod
    def empty_field_to_none(cls, value):
        if value == "" or value is None:
            return None
        return value
