# ReliefConnect Donation Platform

A responsive React single-page application for coordinating disaster relief donations. The platform allows four user roles:

* **Admin** – create and manage relief drives, approve donation pledges and recipient requests.
* **Donor** – register, pledge items to active drives, track donation status.
* **Recipient** – register, submit requests for aid, monitor delivery progress.
* **Logistics** – view approved donations and requests, mark items in transit or delivered.

The project is built with [Vite](https://vitejs.dev/) and connects to a REST backend through `VITE_API_URL`.

---

## Key Features

* Registration & login with role selection and credential validation
* Role-based routing with protected components via `react-router-dom`
* User persistence and simple CRUD helpers in `src/utils/storage.js`
* Four dashboards with statistics, forms, and list views
* Global header & sidebar navigation that adjusts based on authentication
* Responsive layout and utility-first CSS (custom stylesheet)
* Linting configuration (ESLint) for consistent code quality

Screenshots are included in the repository to illustrate UI states (landing page, donor dashboard, etc.).

---

## Installation & Development

1. Clone the repository:
   ```bash
   git clone <repo-url> DonationPlatform
   cd DonationPlatform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server (hot reload):
   ```bash
   npm run dev
   ```
   Open [http://localhost:5174](http://localhost:5174) in your browser (port may vary).

4. Check backend connection:
   ```bash
   npm run check:api
   ```

5. Lint the codebase:
   ```bash
   npm run lint
   ```

6. Build for production:
   ```bash
   npm run build
   npm run preview   # serve the built output locally
   ```

---

## Backend Requirements

The frontend expects a REST API with these endpoints:

```text
GET  /api/users
POST /api/users
GET  /api/drives
POST /api/drives
GET  /api/donations
POST /api/donations
PUT/PATCH /api/donations/:id
GET  /api/requests
POST /api/requests
PUT/PATCH /api/requests/:id
```

Required deployment rules:

* The backend must be running and publicly reachable for deployed/mobile use.
* If the frontend is `https://`, the backend must also be `https://`.
* Backend CORS must allow the frontend domain.
* The API base URL must include `/api`, but not endpoint names like `/users`.

Configure the frontend API URL:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

For local laptop development:

```env
VITE_API_URL=http://localhost:8081/api
```

For phone testing on the same Wi-Fi:

```env
VITE_API_URL=http://YOUR_LAPTOP_IP:8081/api
```

Then start Vite so the phone can access it:

```bash
npm run dev -- --host 0.0.0.0
```

Run this before testing login/register:

```bash
npm run check:api
```

All endpoints should show `OK`. If they show `FAIL`, the frontend is not connected to the backend yet.

---

## Project Structure

```
DonationPlatform/
├── public/                 # static assets served by Vite
├── src/
│   ├── components/         # UI components (Header, Sidebar, ProtectedRoute)
│   ├── context/            # React context (AuthContext)
│   ├── pages/              # route views (Login, Register, dashboards, Landing)
│   ├── utils/              # helper modules (storage.js)
│   ├── App.jsx             # main app with routing
│   ├── styles.css          # global styles and utilities
│   └── main.jsx            # React entrypoint
├── package.json            # npm metadata & scripts
├── eslint.config.js        # ESLint configuration
└── README.md               # project documentation
```

---

## Usage

1. Visit `/register` to create a new account (a role must be selected).
2. After registering you are automatically logged in and redirected to your dashboard.
3. Use the **Logout** link in the header to sign out.
4. Donors can pledge new donations via the form, admins can create drives and approve items, etc.

Credentials are validated against backend user records, and role mismatches are reported.

---

## Future Enhancements

* Replace localStorage with a real backend (Express, Firebase, etc.)
* Add form validation, error handling, and notifications
* Implement upload of images or attachments for drives and donations
* Integrate real-time updates via WebSockets
* Add automated tests and CI pipeline

---

## License

This code is provided as-is for educational/demo purposes.

Feel free to fork, extend, or deploy as needed.
