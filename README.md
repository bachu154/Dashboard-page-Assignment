# SWIFT Front-End Internship Assignment – React Dashboard Project

This project is part of the SWIFT Front-End Internship Assignment. The objective was to build a responsive React dashboard with two main screens: a Profile screen and a Comments Dashboard, using dummy API data. The app focuses on functionality, UI design, and custom logic implementation for pagination, sorting, and state persistence.

---

## 🔗 Links

- **Live Demo:** [Click to View](https://v0-react-dashboard-project-sigma.vercel.app/)
- **GitHub Repository:** [Click to View](https://github.com/bachu154/Dashboard-page-Assignment)
- **Screen Recording (Google Drive):** [Click to Watch](https://drive.google.com/file/d/1lh-UYt1ZJ7OEOJk7HvvpyBSjZ7quyk9s/view?usp=sharing)

---

## ✅ Key Features

### Profile Screen
- Fetches user data from `https://jsonplaceholder.typicode.com/users`
- Displays **only the first user record**
- Non-editable profile details
- Navigation back to Dashboard

### Comments Dashboard
- Fetches 500 comments from `https://jsonplaceholder.typicode.com/comments`
- Custom **pagination** (10, 50, 100 records per page)
- **Partial search** for `name`, `email`, `phone`
- Custom **sorting** for `Post ID`, `Name`, `Email` with 3-mode cycle:
  - No sort → Ascending → Descending → No sort
- Only one active sorting column at a time
- **State persistence** using localStorage for:
  - Current page, page size, search query, sort order

### UI & UX
- Responsive layout for desktop and mobile
- Fixed table overflow issue using `min-w-[800px]`
- Simple and intuitive user interface

---

## 🛠️ Tech Stack

- React + Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- LocalStorage (for filter persistence)
- Deployed on Vercel

---

## 📂 Project Setup

```bash
git clone https://github.com/bachu154/Dashboard-page-Assignment.git
cd Dashboard-page-Assignment
pnpm install      # or npm install
pnpm dev          # or npm run dev
