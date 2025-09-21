Backend (Express + Sequelize)

1. Ensure MySQL is running and root user has password 1234 (or update config in `src/models/index.js`).
2. Option A (recommended): use the Node seed script which hashes passwords and inserts sample data:

	- Install dependencies: `npm install`
	- Run the seed: `npm run seed` (this will sync models and insert sample data including an admin user with email `admin@ptit.edu.vn` and password `admin123`).

	Option B: Run the raw SQL scripts `backend/db/init.sql` and `backend/db/seed.sql` using MySQL CLI or Workbench. Note: the raw SQL seed contains plaintext passwords (not recommended).
3. Install dependencies: `npm install` inside `backend`.
4. Start server: `npm run dev` (nodemon) or `npm start`.

Server listens on port 4000 by default.
