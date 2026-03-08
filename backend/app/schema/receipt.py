"""Pydantic schemas for expenses."""
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, field_validator

class ReceiptItem(BaseModel):
    name: str
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None

    @field_validator("quantity", "unit_price", "total_price", mode="before")
    @classmethod
    def empty_numeric_to_none(cls, value):
        if value == "" or value is None:
            return None
        return value
    
class ReceiptExtracted(BaseModel):
    merchant: Optional[str] = None
    date_of_transaction: Optional[date] = None
    category: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    items_purchased: List[ReceiptItem] = []

    @field_validator("date_of_transaction", "subtotal", "tax", "total", mode="before")
    @classmethod
    def empty_fields_to_none(cls, value):
        if value == "" or value is None:
            return None
        return value

class ReceiptCreateResponse(BaseModel):
    receipt_id: int
    receipt_items_inserted: int

