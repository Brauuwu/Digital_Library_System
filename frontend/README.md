Frontend (Vite + React)

1. Install dependencies: `npm install` inside `frontend`.
2. Start dev server: `npm run dev`.

Routes implemented:
- / - Dashboard
- /books - Books list
- /categories - Categories
- /profile - User profile (requires login token in localStorage)
- /admin/users - Admin users list (requires admin token)

The frontend uses backend at http://localhost:4000/api by default (see `src/api.js`).

The frontend expects backend at http://localhost:4000/api. Adjust `src/api.js` if needed.
