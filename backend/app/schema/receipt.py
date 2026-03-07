"""Pydantic schemas for expenses."""
from datetime import date
from typing import List, Optional

from pydantic import BaseModel

class ReceiptItem(BaseModel):
    name: str
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    
class ReceiptExtracted(BaseModel):
    merchant: Optional[str] = None
    data_of_transaction: Optional[date] = None
    category: Optional[str] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: Optional[float] = None
    items_purchased: List[ReceiptItem]

class ReceiptCreateResponse(BaseModel):
    receipt_id: str
    receipt_items_inserted: int

class ReceiptExtractResponse(BaseModel):
    extracted_receipt_json: ReceiptExtracted

