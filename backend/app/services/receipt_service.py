"""Expense business logic (Supabase table: expenses)."""
from fastapi import File, HTTPException, UploadFile
from pydantic import ValidationError
from backend.app.supabase_client import get_supabase
from backend.app.schema.receipt import ReceiptCreateResponse, ReceiptExtracted

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/heic"}

def list_receipts():
    """Return all expenses, newest first."""
    supabase = get_supabase()

    response = supabase.table("receipts").select("*").order("created_at", desc=True).execute()
    if not response.data:
        raise RuntimeError("Error fetching list_receipts data") # should probably replace with HTTP status codes

    return response.data


def create_receipt_with_input(payload: ReceiptExtracted):
    """Create receipt from payload JSON details."""
    supabase = get_supabase()

    receipt_data_to_insert = {
        "merchant": payload.merchant,
        "data_of_transaction": payload.data_of_transaction.isoformat() if payload.data_of_transaction else None,
        "category": payload.category,
        "subtotal": payload.subtotal,
        "tax": payload.tax,
        "total": payload.total
    }

    response = supabase.table("receipts").insert(receipt_data_to_insert).execute()
    if not response.data:
        raise RuntimeError("Failed to insert receipt into receipts table")

    receipt_id = response.data[0]["id"]
    list_of_items = payload.items_purchased;

    receipt_items_to_insert = []
    for item in list_of_items:
        receipt_items_to_insert.append({
            "receipt_id": receipt_id,
            "name": item.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "total_price": item.total_price
        })
    
    response = supabase.table("receipt_items").insert(receipt_items_to_insert).execute()
    if not response.data:
        raise RuntimeError("Failed to insert items in to receipt_items table")

    return ReceiptCreateResponse(
        receipt_id=receipt_id,
        receipt_items_inserted=len(receipt_items_to_insert)
    )


async def extract_receipt_image(image: UploadFile = File(...)):
    """Extract the receipt image and output a JSON schema."""
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WEBP images are allowed.",
        )
    
    file_bytes = await image.read()
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )
    
    raw_extracted_gemini_receipt_json = await gemini_extract_image(file_bytes=file_bytes)
    try:
        validated_json = ReceiptExtracted.model_validate(raw_extracted_gemini_receipt_json);
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail="Returned Gemini model JSON output is invalid and does not match the required schema.",
        )

    return validated_json

async def gemini_extract_image(file_bytes: bytes) -> ReceiptExtracted:
    pass

