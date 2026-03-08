"""Chat service – uses Gemini for spending/budget advice."""
from google import genai

from app.config import GEMINI_API_KEY
from app.schema.chat import IntentCategorize
from app.supabase_client import get_supabase
from google.genai import types
import json

_SYSTEM_PROMPT = """You are an AI spending assistant for ExpenseVision, a personal expense tracking app. 
Help users understand their spending habits, find ways to save money, and manage their budget better. 
Keep responses concise, practical, and friendly. Focus on actionable advice."""

client = genai.Client(api_key=GEMINI_API_KEY)

def chat(prompt: str) -> str:
    """Send user prompt to Gemini and return the model response."""
    if not prompt or not prompt.strip():
        return "Please enter a question about your spending or budget."

    intent_result = categorize_intent(prompt=prompt)
    user_question_intent = intent_result.intent
    date_range_start = intent_result.date_range_start
    date_range_end = intent_result.date_range_end

    if user_question_intent == "spending_total":
        table_rows = get_total_spending(date_range_start, date_range_end)
    elif user_question_intent == "spending_category_breakdown":
        table_rows = get_spending_category_breakdown(date_range_start, date_range_end)
    elif user_question_intent == "receipt_details":
        table_rows = get_receipt_details(date_range_start, date_range_end)
    else:
        return "Sorry, please ask a question related to finance and budgeting."

    data_to_str = json.dumps(table_rows, default=str)

    full_prompt = f"""{_SYSTEM_PROMPT}\n\nUser: {prompt}\n\n
    Here is the relevant data that you may need. \n
    {data_to_str}\n
    Now, respond as a helpful Assistant to the user.
    Assistant:"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt,
    )
    return response.text or "Sorry, I couldn't generate a response. Please try again."

def categorize_intent(prompt: str) -> IntentCategorize:
    full_prompt = f"""{prompt}\n\n
    Pay close attention to the above prompt (it is the user's question).
    You are an intent classifier for a personal finance chatbot.

    Your job is to categorize the user's question into one of the following intents.

    INTENTS:

    1. spending_total
    - The user asks how much money they spent in a time range.
    - Example: "How much did I spend this week?"

    2. spending_category_breakdown
    - The user asks for spending broken down by category or asks for advice about cutting spending.
    - Example: "Where am I spending the most?"
    - Example: "How can I reduce my spending?"

    3. receipt_details
    - The user asks about receipts or items they purchased.
    - Example: "What did I buy yesterday?"
    - Example: "Show my receipts this week."

    If the question is unrelated to finance, budgeting, spending, or receipts, set the intent to:
    "unsupported"

    DATE RANGE RULES:

    If the user specifies a time range, extract it into:

    date_range_start
    date_range_end

    Use format:
    YYYY-MM-DD

    If no date is specified, return null for both fields.

    Examples:

    User: "How much did I spend this week?"

    Output:
    {{
        "intent": "spending_total",
        "date_range_start": null,
        "date_range_end": null
    }}

    User: "Show my receipts from March 1, 2026 to March 5, 2026"

    Output:
    {{
        "intent": "receipt_details",
        "date_range_start": "2026-03-01",
        "date_range_end": "2026-03-05"
    }}

    IMPORTANT RULES:

    - Respond ONLY with valid JSON.
    - Do NOT include explanations.
    - Do NOT include markdown.
    - Do NOT include extra text.
    - The JSON must match this schema exactly:

    {{
        "intent": string,
        "date_range_start": string | null,
        "date_range_end": string | null
    }}
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=IntentCategorize,
        ),
    )

    if response.parsed is not None:
        return response.parsed

    return IntentCategorize(
        intent="unsupported",
        date_range_start=None,
        date_range_end=None,
    )

def get_total_spending(date_range_start=None, date_range_end=None): # receipt table only
    supabase = get_supabase()
    response = supabase.table("receipts").select("*")

    if date_range_start and date_range_end:
        response = response.gte("date_of_transaction", str(date_range_start))
        response = response.lte("date_of_transaction", str(date_range_end))
    
    response = response.execute()
    return response.data

def get_spending_category_breakdown(date_range_start=None, date_range_end=None):
    supabase = get_supabase()
    response = supabase.table("receipts").select("*")

    if date_range_start and date_range_end:
        response = response.gte("date_of_transaction", str(date_range_start))
        response = response.lte("date_of_transaction", str(date_range_end))
    
    response = response.execute()
    return response.data

def get_receipt_details(date_range_start=None, date_range_end=None):
    supabase = get_supabase()
    response = supabase.table("receipts").select("*").order("date_of_transaction", desc=True)

    if date_range_start and date_range_end:
        response = response.gte("date_of_transaction", str(date_range_start))
        response = response.lte("date_of_transaction", str(date_range_end))
    
    response = response.execute()
    return response.data


