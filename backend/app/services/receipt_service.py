"""Expense business logic (Supabase table: expenses)."""
import json
import re
from fastapi import HTTPException, UploadFile
from pydantic import ValidationError

from app.supabase_client import get_supabase
from app.schema.receipt import ReceiptCreateResponse, ReceiptExtracted
from google import genai
from google.genai import types

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/heic"}

client = genai.Client()

def list_receipts():
    """Return all expenses, newest first."""
    supabase = get_supabase()

    response = supabase.table("receipts").select("*").order("date_of_transaction", desc=True).execute()
    return response.data if response.data is not None else []


def create_receipt_with_input(payload: ReceiptExtracted):
    """Create receipt from payload JSON details."""
    supabase = get_supabase()

    receipt_data_to_insert = {
        "merchant": payload.merchant,
        "date_of_transaction": payload.date_of_transaction.isoformat() if payload.date_of_transaction else None,
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
        });
    if receipt_items_to_insert:
        response = supabase.table("receipt_items").insert(receipt_items_to_insert).execute();
        if not response.data:
            raise RuntimeError("Failed to insert items in to receipt_items table")

    return ReceiptCreateResponse(
        receipt_id=receipt_id,
        receipt_items_inserted=len(receipt_items_to_insert)
    )


async def extract_receipt_image(image: UploadFile)-> ReceiptExtracted:
    """Extract the receipt image and output a JSON schema."""
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, JPG, and HEIC images are allowed.",
        )
    
    file_bytes = await image.read()
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )
    
    raw_json_str = await _gemini_extract_receipt_json(
        file_bytes=file_bytes, filetype=image.content_type
    )
    # Strip markdown code blocks if Gemini wrapped the JSON
    json_str = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_json_str).strip()
    # print("hello" + json_str)
    
    try:
        validated = ReceiptExtracted.model_validate_json(json_str)
    except ValidationError:
        raise HTTPException(
            status_code=422,
            detail="Returned Gemini model JSON output is invalid and does not match the required schema.",
        )

    return validated


async def _gemini_extract_receipt_json(file_bytes: bytes, filetype: str) -> str:
    prompt = """
    Extract receipt information from this image.
    Return STRICT JSON with this schema:

    {
        "merchant": string,
        "date_of_transaction": "YYYY-MM-DD",
        "category": string,
        "subtotal": number,
        "tax": number,
        "total": number,
        "items_purchased": [
            {
            "name": string,
            "quantity": number,
            "unit_price": number,
            "total_price": number
            }
        ]
    }

    RULES:
    - Return ONLY JSON
    - No explanation
    - NO MARKDOWN
    - For categories, you can only choose between these ones:
        - Groceries
        - Dining
        - Transportation
        - Shopping
        - Entertainment
        - Travel
        - Utilities
        - Other
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=filetype
            ),
            prompt
        ]
    )

    return response.text or "{}"



