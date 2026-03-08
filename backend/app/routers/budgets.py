from fastapi import APIRouter, HTTPException
from backend.app.schema.budgets import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetComparisonResponse
)
from backend.app.services.budget_service import (
    create_budget_service,
    get_budget_by_month_service,
    update_budget_service,
    get_budget_comparison_service
)
from datetime import date

router = APIRouter(tags=["budgets"])

@router.post("/", response_model = BudgetResponse)
def create_budget(payload: BudgetCreate):
    try:
        return create_budget_service(payload)
    except ValueError as e:
        raise HTTPException(status_code = 400, detail=str(e))

@router.get("/comparison/{month}", response_model=BudgetComparisonResponse)
def get_budget_comparison(month: date):
    result = get_budget_comparison_service(month)

    if result is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return result

@router.get("/{month}", response_model=BudgetResponse)
def get_budget_by_month(month: date):
    result = get_budget_by_month_service(month)

    if result is None:
        raise HTTPException(status_code=404, detail = "Budget not found")
    return result

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, payload: BudgetUpdate):
    try:
        result = update_budget_service(budget_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if result is None:
        raise HTTPException(status_code=404, detail="Budget not found")

    return result



