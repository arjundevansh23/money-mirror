# Money Mirror 💰

A personal finance app that teaches you about money through your own spending data — not textbook examples.

## What it does

Most finance apps just track. Most finance courses just teach. Money Mirror does both at the same time.

- **Track expenses** by category and subcategory
- **Live AI insights** — peer benchmarks, overspend alerts, habit detection
- **Spending flip cards** — tap any category to see subcategory breakdown
- **Goals** — set targets, add funds, track progress
- **Financial health score** — recalculates every time you log an expense
- **Invest tab** — shows exactly what your spending leaks cost you over 10-20 years
- **Everything syncs live** — add one expense, 12+ elements update across all 5 tabs

## The education angle

When you overspend on food, Money Mirror doesn't just flag it — it explains:
- How much more you're spending vs peers your age
- What that gap becomes if invested at 12% over 10 years
- Exactly which subcategory (Delivery, Eating Out, Cafes) is driving it

Learning happens through your own real data, in context, not in a classroom.

## How to run

No install, no setup, no dependencies.

**Option 1 — Live demo:**  
👉 money-mirror-pink.vercel.app

**Option 2 — Run locally:**
1. Download or clone this repo
2. Open `index.html` in any browser
3. That's it

```bash
git clone https://github.com/yourusername/money-mirror
cd money-mirror
open index.html
```

## File structure

money-mirror/
├── index.html   # App structure (327 lines)
├── app.css      # All styles (264 lines)
└── app.js       # All logic — state, rendering, CRUD (977 lines)


## Built with

- HTML / CSS / Vanilla JavaScript — no frameworks, no libraries
- Raw SVG math for the dynamic donut chart
- localStorage for data persistence
- Built with Claud and ChatGPT

## Features

| Feature | Details |
|---|---|
| Expense tracking | Add, edit, delete with category + subcategory |
| 8 spending categories | Living, Food, Transport, Shopping, Utilities, Lifestyle, Health, Finance |
| Dynamic donut chart | Auto-ranks top categories by spend |
| Flip cards | Tap to reveal subcategory breakdown |
| AI Insights | Alerts, Benchmarks, Habits, Opportunity, Projections |
| Goals | Create, fund, track — with live progress |
| Health score | 0–100, recalculates on every expense |
| Data persistence | localStorage — survives page refresh |
