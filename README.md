# ReliefConnect Donation Platform

A responsive React single-page application for coordinating disaster relief donations. The platform allows four user roles:

* **Admin** – create and manage relief drives, approve donation pledges and recipient requests.
* **Donor** – register, pledge items to active drives, track donation status.
* **Recipient** – register, submit requests for aid, monitor delivery progress.
* **Logistics** – view approved donations and requests, mark items in transit or delivered.

The project is built with [Vite](https://vitejs.dev/) and uses browser **localStorage** for persistence; it is structured to allow easy backend integration later.

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

4. Lint the codebase:
   ```bash
   npm run lint
   ```

5. Build for production:
   ```bash
   npm run build
   npm run preview   # serve the built output locally
   ```

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

The login page will redirect to registration if no users exist; credentials are validated against stored user records, and role mismatches are reported.

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
