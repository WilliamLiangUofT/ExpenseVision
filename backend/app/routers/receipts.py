"""Expense API routes – delegate to services, use Pydantic schemas."""
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schema.receipt import ReceiptExtracted, ReceiptCreateResponse
from app.services.receipt_service import list_receipts, create_receipt_with_input, extract_receipt_image

router = APIRouter()


@router.get("", response_model=List[ReceiptExtracted])
def get_receipts():
    """List Receipts (newest first)."""
    try:
        return list_receipts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save", response_model=ReceiptCreateResponse)
def save_receipt(payload: ReceiptExtracted):
    """Create receipt from payload JSON details."""
    try:
        return create_receipt_with_input(payload=payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract", response_model=ReceiptExtracted)
async def extract_receipt(image: UploadFile = File(...)):
    """Extract the receipt image and output a JSON schema."""
    try:
        return await extract_receipt_image(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
