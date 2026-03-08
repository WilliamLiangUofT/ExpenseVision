# 💰 ExpenseVision

### AI-Powered Expense Tracking & Budget Intelligence

> **Stop typing. Start scanning.** ExpenseVision eliminates the tediousness of manual expense tracking by leveraging AI to AUTOMATICALLY READ your receipts, manage your budgets, and answer your money questions—so you can focus on making smarter financial decisions. The **goal** of ExpenseVision is to **eliminate manual expense tracking** and help users **make smarter financial decisions**. With a snap of a photo, in seconds, ExpenseVision will extract all relevant information from receipts, so that you can categorize and visualize your spending across months.

---

## 🎬 See It In Action

**[📺 Watch the Demo Video →](https://youtube.com/shorts/rPsWiqZ-VNY)**

---

## 🔗 Links

- **📦 Repository:** [github.com/WilliamLiangUofT/ExpenseVision](https://github.com/WilliamLiangUofT/ExpenseVision)
- **🎥 Demo:** [YouTube Shorts](https://youtube.com/shorts/rPsWiqZ-VNY)

---

## 🚀 Features

### 📷 AI Receipt Scanning
Snap a photo of any receipt—ExpenseVision's AI instantly extracts:

- Merchant name  
- Transaction date  
- Category  
- Subtotal, tax, total  
- Itemized purchases  

NO MORE manual entry. NO MORE lost receipts.

### 🧾 Manual Expense Entry
Prefer typing? Add expenses manually when scanning isn't convenient.

### 📊 Smart Budgeting System
Create **monthly budgets** and allocate spending across categories:

- Groceries · Dining · Transportation · Shopping  
- Entertainment · Travel · Utilities · Other  

Each category tracks allocated budget, amount spent, and remaining funds.

### 📈 Budget vs Spending Analytics
See **planned vs actual** at a glance:

- Total monthly spending  
- Category breakdown  
- Remaining budget  
- Overspending alerts  

### 🤖 AI Financial Assistant
Ask questions. Get answers. Powered by your **real transaction and budget data**.

- *"Where am I overspending this month?"*  
- *"How can I save more money?"*  
- *"Which category do I spend the most on?"*  
- *"How much do I have left in my budget?"*  

---

## 🧩 Full Stack Architecture

ExpenseVision is a **full-stack system**: mobile app, backend API, database, and AI services working together.

---

## 🛠️ Tools, Libraries & Hardware

### Frontend
| Tool | Purpose |
|------|---------|
| **React Native** | Cross-platform mobile app |
| **Expo** | Development, build & deployment |
| **expo-router** | File-based routing |
| **expo-image-picker** | Receipt photo capture |
| **Axios** | API requests |

### Backend
| Tool | Purpose |
|------|---------|
| **FastAPI** | REST API |
| **Supabase** | PostgreSQL database & auth |
| **Pydantic** | Data validation |
| **Uvicorn** | ASGI server |
| **Python Multipart** | File upload handling |

### AI
| Tool | Purpose |
|------|---------|
| **Google GenAI** | Receipt extraction & financial assistant |

### Hardware
- **Smartphone** (iOS/Android) or **web browser** for running the app  
- **Camera** for receipt scanning  

---

## 🏷️ Hack Canada 2026

**Sponsor Category Tags:** `Best Use of Gemini API` ·

Built for [Hack Canada 2026](https://hackcanada.org/) — tackling real challenges with AI-powered financial intelligence.

---

## 📂 Project Structure

```
ExpenseVision/
├── app/              # React Native screens (Expo Router)
├── backend/          # FastAPI server + AI integration
├── lib/              # API client & utilities
└── assets/           # Icons, images, fonts
```

---

## 🏃 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/WilliamLiangUofT/ExpenseVision.git
   cd ExpenseVision
   ```

2. **Set up backend** (see `backend/README.md` for env vars)  
3. **Run frontend:** `npm install` → `npx expo start`  
4. **Scan receipts, manage budgets, ask the AI.**  

---

*Built with 💗 for Hack Canada 2026*
