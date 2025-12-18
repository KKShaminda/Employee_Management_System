# Employee Management System

Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud) and connection URI

1) Environment
- Create a `.env` file in `server/` with at least:
  - MONGO_URI=<your-mongo-uri>
  - JWT_SECRET=<strong-secret>


2) Install dependencies
From project root (Windows PowerShell):
```
cd server
npm install

cd ..\client
npm install
```

3) Create Admin account (seeder)
- A seeder script is provided at `server/userSeed.js`. Run it after setting `.env` to create a default Admin user (it will skip if the admin already exists).

Run the seeder (PowerShell):
```
cd server
node --env-file=.env userSeed.js
```

Default credentials created (if not change)
- Email: admin@example.com
- Password: Admin@123
- Role: Admin

4) Start servers
Server:
```
cd server
npm run start
```
Client (Vite):
```
cd client
npm run dev
```

5) Verify
- Login at the admin dashboard using the Admin credentials above.
- In admin dashboard you can see add employee form and using it you can ceate new employee users. 
- If you prefer a different admin email/password, edit `server/userSeed.js` before running.

Security notes
- Do not use the example credentials in production.
- Use a secure `JWT_SECRET` and protect your `.env`.
