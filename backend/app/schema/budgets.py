from datetime import date
from typing import Optional, List
from pydantic import BaseModel, Field


class BudgetCategoryBase(BaseModel):
    category: str = Field(..., max_length=100)
    percent: Optional[float] = None
    allocated_amount: Optional[float] = None

# incoming category data
class BudgetCategoryCreate(BudgetCategoryBase):
    category: str = Field(..., min_length = 1, max_length = 100)
    percent: float = Field(..., ge=0, le = 100)

# send back id and budget_id to the frontend after saving to database
class BudgetCategoryResponse(BudgetCategoryBase):
    id: int
    budget_id: int

    class Config:
        from_attributes = True


# creating the budget and the categories
# small example

# {
#   "month": "2026-03-01",
#   "total_budget": 2000,
#   "categories": [
#     {
#       "category": "Groceries",
#       "percent": 20,
#       "allocated_amount": 400
#     },
#     {
#       "category": "Dining",
#       "percent": 10,
#       "allocated_amount": 200
#     }
#   ]
# }
class BudgetCreate(BaseModel):
    month: date
    total_budget: float
    categories: List[BudgetCategoryCreate]


class BudgetUpdate(BaseModel):
    month: date
    total_budget: float
    categories: List[BudgetCategoryCreate]


# backend returns when the frontend fetches a month's budget
# {
#   "id": 1,
#   "month": "2026-03-01",
#   "total_budget": 2000,
#   "categories": [
#     {
#       "id": 1,
#       "budget_id": 1,
#       "category": "Groceries",
#       "percent": 20,
#       "allocated_amount": 400
#     },
#     {
#       "id": 2,
#       "budget_id": 1,
#       "category": "Dining",
#       "percent": 10,
#       "allocated_amount": 200
#     }
#   ]
# }

class BudgetResponse(BaseModel):
    id: int
    month: date
    total_budget: float
    categories: List[BudgetCategoryResponse]

    # let fastapi convert SQL objects into pydantic responses
    class Config:
        from_attributes = True

class BudgetComparisonCategoryResponse(BaseModel):
    category: str
    percent: float
    allocated_amount: float
    spent: float
    remaining: float


class BudgetComparisonResponse(BaseModel):
    id: int
    month: date
    total_budget: float
    total_spent: float
    categories: List[BudgetComparisonCategoryResponse]