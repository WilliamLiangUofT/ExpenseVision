
from backend.app.schema.budgets import BudgetCreate, BudgetUpdate
from backend.app.supabase_client import get_supabase
from datetime import date

def create_budget_service(payload: BudgetCreate):
    supabase = get_supabase()
    
    existing = (
         supabase.table("budgets")
        .select("*")
        .eq("month", str(payload.month))
        .execute()
    )

    if existing.data:
        raise ValueError("Budget for this month already exists")

    total_percent = sum(cat.percent for cat in payload.categories)
    if total_percent > 100:
        raise ValueError("Total percent cannot exceed 100")
    
    # sends the month and total budget into the backend and supabase will store it in a row
    budget_result = (
        supabase.table("budgets")
        .insert({
            "month": str(payload.month),
            "total_budget": payload.total_budget
        })
        .execute()
    )

    budget_row = budget_result.data[0]
    budget_id = budget_row["id"]

    # creating the category rows
    category_rows = []
    for cat in payload.categories:
        allocated_amount = round(payload.total_budget * cat.percent / 100, 2)
        category_rows.append({
            "budget_id": budget_id,
            "category": cat.category,
            "percent": cat.percent,
            "allocated_amount": allocated_amount
        })

    # creates the category result and stores it into supabase
    category_result = (
        supabase.table("budget_categories")
        .insert(category_rows)
        .execute()
    )

    return {
        "id": budget_row["id"],
        "month": budget_row["month"],
        "total_budget": budget_row["total_budget"],
        "categories": category_result.data or []

    }

def get_budget_by_month_service(month: date):
    supabase = get_supabase()
    # gets the budgets result from the table that has the corresponding month
    budget_result = (
        supabase.table("budgets")
        .select("*")
        .eq("month", str(month))
        .execute()
    )

    if not budget_result.data:
        return None

    budget_row = budget_result.data[0]
    budget_id = budget_row["id"]

    category_result = (
        supabase.table("budget_categories")
        .select("*")
        .eq("budget_id", budget_id)
        .execute()
    )

    return {
        "id": budget_row["id"],
        "month": budget_row["month"],
        "total_budget": budget_row["total_budget"],
        "categories": category_result.data or []
    }

# change both the budget and the budget_categories accordingly.
def update_budget_service(budget_id: int, payload: BudgetUpdate):
    supabase = get_supabase()
    
    existing = (
        supabase.table("budgets")
        .select("*")
        .eq("id", budget_id)
        .execute()
    )

    if not existing.data:
        return None
    
    # update budget based on the given payload offered by the user
    update_budget = (
        supabase.table("budgets")
        .update({
            "month": str(payload.month),
            "total_budget": payload.total_budget
        })
        .eq("id", budget_id)
        .execute()
    )

    # delete the old budget_categories
    supabase.table("budget_categories").delete().eq("budget_id", budget_id).execute()

    # recreating the category rows
    category_rows = []

    for cat in payload.categories:
        allocated_amount = round(payload.total_budget * cat.percent / 100, 2)

        category_rows.append({
            "budget_id": budget_id,
            "category": cat.category,
            "percent": cat.percent,
            "allocated_amount": allocated_amount
        })
    category_result = (
        supabase.table("budget_categories")
        .insert(category_rows)
        .execute()
    )

    budget_row = update_budget.data[0]

    # return the newly edited budget and its associated categories
    return {
        "id": budget_row["id"],
        "month": budget_row["month"],
        "total_budget": budget_row["total_budget"],
        "categories": category_result.data or []
    }

def get_budget_comparison_service(month: date):
    supabase = get_supabase()

    # get budget for the month
    budget_result = (
        supabase.table("budgets")
        .select("*")
        .eq("month", str(month))
        .execute()
    )

    if not budget_result.data:
        return None
    budget_row = budget_result.data[0]
    budget_id = budget_row["id"]

    # 2. Get planned categories
    category_result = (
        supabase.table("budget_categories")
        .select("*")
        .eq("budget_id", budget_id)
        .execute()
    )

    planned_categories = category_result.data or []

     # 3. Get date range for this month
    start_date = month
    if month.month == 12:
        end_date = date(month.year + 1, 1, 1)
    else:
        end_date = date(month.year, month.month + 1, 1)

     # 4. Get receipts in this month
    receipt_result = (
        supabase.table("receipts")
        .select("category,total,date_of_transaction")
        .gte("date_of_transaction", str(start_date))
        .lt("date_of_transaction", str(end_date))
        .execute()
    )

    receipt_rows = receipt_result.data or []

    # 5. Sum spent by category
    spent_map = {}

    total_spent = 0.0
    for receipt in receipt_rows:
        category = receipt.get("category") or "Other"
        total = float(receipt.get("total") or 0)

        if category not in spent_map:
            spent_map[category] = 0.0

        spent_map[category] += total
        total_spent += total

    # 6. Merge planned + spent
    comparison_categories = []

    for cat in planned_categories:
        category_name = cat["category"]
        allocated_amount = float(cat["allocated_amount"])
        percent = float(cat["percent"])
        spent = round(spent_map.get(category_name, 0.0), 2)
        remaining = round(allocated_amount - spent, 2)

        comparison_categories.append({
            "category": category_name,
            "percent": percent,
            "allocated_amount": allocated_amount,
            "spent": spent,
            "remaining": remaining
        })
        
    return {
        "id": budget_row["id"],
        "month": budget_row["month"],
        "total_budget": float(budget_row["total_budget"]),
        "total_spent": round(total_spent, 2),
        "categories": comparison_categories
    }