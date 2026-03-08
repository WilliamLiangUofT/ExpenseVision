"""FastAPI app – backend for ExpenseVision."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import receipts, budgets

app = FastAPI(
    title="ExpenseVision API",
    description="Backend for ExpenseVision expense tracking",
    version="1.0.0",
)

# CORS configuration so react native can call the api
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router, prefix="/api/receipts", tags=["receipts"])
app.include_router(budgets.router, prefix = "/api/budgets", tags=["budgets"])

