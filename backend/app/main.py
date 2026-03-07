"""FastAPI app – backend for ExpenseVision."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import receipts

app = FastAPI(
    title="ExpenseVision API",
    description="Backend for ExpenseVision expense tracking",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(receipts.router, prefix="/api/receipts", tags=["receipts"])

