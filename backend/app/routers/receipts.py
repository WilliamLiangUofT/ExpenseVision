"""Expense API routes – delegate to services, use Pydantic schemas."""
from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.app.schema.receipt import ReceiptExtracted, ReceiptCreateResponse, ReceiptExtractResponse
from backend.app.services.receipt_service import list_receipts, create_receipt_with_input, extract_receipt_image

router = APIRouter()


@router.get("", response_model=ReceiptExtracted)
def list_receipts():
    """List Receipts (newest first)."""
    try:
        return list_receipts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save", response_model=ReceiptCreateResponse)
def create_receipt_with_input(payload: ReceiptExtracted):
    """Create receipt from payload JSON details."""
    try:
        return create_receipt_with_input(payload=payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract", response_model=ReceiptExtractResponse)
async def extract_receipt_image(image: UploadFile = File(...)):
    """Extract the receipt image and output a JSON schema."""
    try:
        extract_receipt_image(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
