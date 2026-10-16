# 🧁 Cravory Playwright Automation Framework

> **A standalone, enterprise-grade End-to-End (E2E) and API automation testing suite built with Playwright and JavaScript for the Cravory multi-vendor artisan bakery marketplace.**

---

## 📌 Project Overview

This repository is an independent automated testing framework designed to validate the reliability, performance, security, and user experience of **Cravory**, a full-stack MERN e-commerce application.

- **Target Application:** [Cravory E-Commerce](https://github.com/Akshatha2312/cravory-mern-ecommerce)
- **Live Frontend:** [https://cravory-beta.vercel.app/](https://cravory-beta.vercel.app/)
- **Live Backend:** [https://cravory-mern-ecommerce.onrender.com](https://cravory-mern-ecommerce.onrender.com/)
- **Automation Stack:** Playwright Test, Node.js (JavaScript, ES Modules), dotenv

---

## 🎓 Mentor Engineering Insights: Architectural Best Practices

### 1. Page Object Model (POM) Structure
Rather than embedding raw selectors inside test specifications, we encapsulate UI structures and user actions in maintainable Page Object classes under `pages/`:
- **`BasePage.js`:** Shared browser operations, History API client-side navigation (`pushState`), and global header locators.
- **`LoginPage.js`:** Accessible locators for `/login`, credential inputs, error alert banners, and registration links.
- **`RegisterPage.js`:** Accessible locators for `/register`, input fields, HTML5 validation attributes, and login links.
- **`ProductsPage.js`:** Accessible locators for `/products`, category filter pills, keyword search input, sorting dropdown, and product card grid.
- **`ProductDetailsPage.js`:** Locators for `/product/:id`, product title, price display, bakery storefront link, customer review section, and guest action buttons.
- **`BakeriesPage.js`:** Locators for `/bakeries`, directory header, and partner bakehouse cards.
- **`BakeryPage.js`:** Locators for `/bakery/:id`, storefront header, verified bakehouse badge, about description, and fresh offerings grid.
- **`CheckoutPage.js`:** Locators for `/checkout`, delivery address management, client-side address form inputs, coupon application, order summary calculations, and payment hand-off triggers.
- **`VendorAdminPage.js`:** Locators for public "Become a Baker" onboarding, vendor management subroutes (`/vendor/orders`, `/vendor/products`, `/vendor/products/add`), and admin governance subroutes (`/admin/vendors`, `/admin/products`, `/admin/orders`, `/admin/analytics`, `/admin/users`).

### 2. Phase 6 Architecture Discoveries: Role Governance, Route Guards & Privacy
An audit of the Cravory source code (`AdminRoute.jsx`, `VendorRoute.jsx`, `authMiddleware.js`, `vendorMiddleware.js`, `adminMiddleware.js`) established the role architecture:

- **Role Taxonomy:** Cravory implements 3 distinct roles: `"user"` (default customer), `"vendor"` (artisan baker), and `"admin"` (system governance).
- **Authentication vs. Authorization:**
  - **Authentication ("Who are you?"):** Validates whether a visitor has an active session/JWT.
    - Frontend: Both `<AdminRoute>` and `<VendorRoute>` check `if (!user) return <Navigate to="/login" replace />;`.
    - Backend: `protect` middleware verifies `Bearer <token>`. Missing/invalid tokens return **`HTTP 401 Unauthorized`** (`{ message: "Not authorized, no token" }`).
  - **Authorization ("What are you permitted to do?"):** Validates whether an authenticated user has the necessary role and approval status.
    - Frontend:
      - `<AdminRoute>` checks `if (user.role !== "admin") return <Navigate to="/" replace />;` (authenticated non-admins are redirected to **Home (`/`)**, not Login).
      - `<VendorRoute>` checks `if (!vendorStatus || vendorStatus.status !== "APPROVED") return <Navigate to="/become-a-baker" replace />;` (unapproved users are redirected to **`/become-a-baker`**, not Login).
    - Backend:
      - `adminOnly` middleware checks `req.user.role === "admin"`. If unauthorized, returns **`HTTP 403 Forbidden`** (`{ message: "Admin access only" }`).
      - `requireVendor` middleware checks `req.user.role === "vendor"` and `vendor.isApproved`. If unauthorized, returns **`HTTP 403 Forbidden`** (`{ message: "Access denied. Vendor account required." }` or `{ message: "Vendor account pending admin approval" }`).
- **Public Vendor Directory Data Privacy:**
  - `GET /api/vendors` is public and returns approved, active bakeries.
  - The controller explicitly projects sanitized public fields (`_id`, `bakeryName`, `description`, `logo`, `coverImage`, `city`, `state`, `isApproved`, `isActive`, `productCount`, `createdAt`).
  - **Privacy Guarantee:** Private vendor information (user passwords, phone, street address, tax IDs, banking credentials) is strictly withheld from public responses.

---

## 🛡️ Safety Matrix & Test Classification

Every test in this repository is strictly classified according to its operational safety boundary:

| Classification | Meaning | Coverage in Framework |
| :--- | :--- | :--- |
| `SAFE_PUBLIC` | Read-only browser navigation against deployed frontend. | Route guard redirections to `/login` for `/checkout`, `/become-a-baker`, all `/vendor/*` subroutes, and all `/admin/*` governance subroutes. |
| `SAFE_LOCAL` | Isolated component test using Playwright network interception (`page.route()`). | Address form required field validation, coupon discount calculations, and payment failure/cancellation UI handling. |
| `SAFE_API` | Read-only API contract verification without authentication. | Validates HTTP 401 rejection on protected admin/vendor endpoints, root health status, products schema, and public vendor directory privacy. |
| `DEFERRED_AUTH` | Requires an authenticated customer, vendor, or admin test session. | Vendor/admin portal login, metric retrieval, and persistent address fetching. |
| `DEFERRED_AUTHZ` | Requires cross-role testing using live authenticated identities. | Authenticated customer attempting access to `/vendor/*` (redirect to `/become-a-baker`) or `/admin/*` (redirect to `/`). |
| `DEFERRED_MUTATION` | Creates or modifies persistent server records. | Vendor product creation/stock updates, admin vendor approval, order status updates, and live address creation. |
| `DEFERRED_PAYMENT` | Could initiate real payment processing or verification. | Live Razorpay checkout and server-side payment verification (`POST /api/payment/verify`). |

---

## 📂 Framework Directory Structure

```text
cravory-playwright-automation/
├── .github/                      # CI/CD Workflows (Configured in Phase 7)
├── data/                         # Static test data & mock response payloads
├── fixtures/                     # Playwright custom fixtures & isolated test components
│   └── checkout-address-fixture.html # Isolated checkout component reflecting real Checkout.jsx
├── pages/                        # Page Object Models (POM)
│   ├── BasePage.js               # Common base class for shared actions and SPA routing
│   ├── LoginPage.js              # Page Object for /login view
│   ├── RegisterPage.js           # Page Object for /register view
│   ├── ProductsPage.js           # Page Object for /products catalog & filter bar
│   ├── ProductDetailsPage.js     # Page Object for /product/:id deep-dive view
│   ├── BakeriesPage.js           # Page Object for /bakeries partner directory
│   ├── BakeryPage.js             # Page Object for /bakery/:id individual storefront
│   ├── CheckoutPage.js           # Page Object for /checkout & address management
│   └── VendorAdminPage.js        # Page Object for Vendor Portal & Admin Governance
├── tests/
│   ├── api/                      # Backend API contract & health check tests
│   │   ├── health.spec.js        # Backend server availability & uptime validation
│   │   └── products-api.spec.js  # Product API contract & schema validation
│   ├── auth/                     # Authentication & Security Test Suite (Phase 3)
│   │   ├── login.spec.js         # Login form validation & negative credential rejection
│   │   ├── register.spec.js      # Registration form visibility & client validation
│   │   └── rbac-guards.spec.js   # Route guards & unauthenticated access protection
│   ├── checkout/                 # Address Management & Safe Checkout Suite (Phase 5)
│   │   └── checkout-safety.spec.js # Safe checkout, address form validation, coupon & payment mocks
│   ├── customer/                 # Public Customer Journeys (Phase 4)
│   │   └── public-journey.spec.js# End-to-end read-only shopping exploration
│   ├── smoke/                    # High-priority smoke & sanity verification tests
│   │   ├── framework-validation.spec.js # Core browser launch & connectivity test
│   │   └── website-smoke.spec.js # Homepage, navigation, catalog, and directory smoke tests
│   └── vendor-admin/             # Vendor Portal & Admin Governance Suite (Phase 6)
│       └── vendor-admin-safety.spec.js # Vendor & admin subroute protection, API 401s, vendor data privacy
├── utils/                        # Shared utility helpers
├── .env.example                  # Environment configuration template
├── .gitignore                    # Version control exclusion rules (secrets, reports)
├── package.json                  # Dependencies and execution scripts
├── playwright.config.js          # Master Playwright configuration
└── README.md                     # Project documentation & architectural guide
```

---

## 🧪 Test Suites & Coverage (Phase 6.1 Status: 51 Discovered Tests)

### 1. Vendor Portal & Admin Governance (`tests/vendor-admin/`)
- **SAFE_PUBLIC (Public Onboarding Link):** Dedicated verification that the public "Become a Baker" onboarding link in `Navbar.jsx` (`/become-a-baker`) is visible to guests and navigates to the public onboarding view (which redirects unauthenticated guests to `/login`).
- **SAFE_PUBLIC (Vendor Subroutes):** Unauthenticated guest navigation to `/vendor/orders`, `/vendor/products`, and `/vendor/products/add` are intercepted by `<VendorRoute>` and redirected to `/login`.
- **SAFE_PUBLIC (Admin Subroutes):** Unauthenticated guest navigation to `/admin/vendors`, `/admin/products`, `/admin/orders`, `/admin/analytics`, and `/admin/users` are intercepted by `<AdminRoute>` and redirected to `/login`.
- **SAFE_API (Vendor Endpoint 401 Guard):** `GET /api/products/vendor/my-products` rejects unauthenticated requests with HTTP 401 (`"Not authorized, no token"`).
- **SAFE_API (Admin Endpoint 401 Guard):** `GET /api/admin/dashboard` rejects unauthenticated requests with HTTP 401 (`"Not authorized, no token"`).
- **SAFE_API (Vendor Directory Privacy):** `GET /api/vendors` returns HTTP 200 with sanitized `{ count, vendors }` schema envelope and verifies sensitive fields (`password`, `bankAccount`, `taxId`, `user`, `phone`, `email`, `address`) are never leaked, without logging sensitive data.
- **DEFERRED Tests:** Explicitly documents prerequisites for `DEFERRED_AUTH` (vendor/admin login), `DEFERRED_AUTHZ` (cross-role customer access), and `DEFERRED_MUTATION` (product/vendor updates).

### 2. Address Management & Safe Checkout (`tests/checkout/`)
- **10 Tests (7 Passed, 3 Deferred):** Guest checkout guard, non-existent `/addresses` safe handling, client address required validations, address creation mock, coupon discount calculations, and payment cancellation/decline mock handling.

### 3. Public Customer Journeys (`tests/customer/`)
- **7 Passing Tests:** Catalog navigation, search filter, category pills, product details, bakery directory, storefront exploration, and guest interaction route guards.

### 4. Authentication & Route Guards (`tests/auth/`)
- **9 Passing Tests:** Login form, credential rejection, registration form, client validation, and RBAC guards for admin, vendor, checkout, and baker onboarding.

### 5. Backend API Suite (`tests/api/`)
- **2 Passing Tests:** Root health check (`GET /`) and products API schema envelope contract (`GET /api/products`).

### 6. Website UI Smoke Suite (`tests/smoke/`)
- **6 Passing Tests:** Chromium launch, homepage loading, catalog smoke, bakery smoke, auth links, and baker onboarding links.

---

## ⏸️ Deferred Authenticated Tests & Prerequisites

| Deferred Feature | Classification | Reason for Deferral | Prerequisite to Unblock |
| :--- | :--- | :--- | :--- |
| **Vendor Portal Login & Dashboard Metrics** | `DEFERRED_AUTH` | Requires approved vendor credentials | Dedicated vendor test account (`TEST_VENDOR_EMAIL`) |
| **Admin Portal Login & Analytics** | `DEFERRED_AUTH` | Requires administrator credentials | Dedicated admin test account (`TEST_ADMIN_EMAIL`) |
| **Cross-Role Authorization Redirects** | `DEFERRED_AUTHZ` | Customer accessing `/vendor/*` or `/admin/*` | Dedicated customer test account |
| **Vendor Product & Inventory Manipulation** | `DEFERRED_MUTATION` | Mutates products collection in MongoDB | Staging sandbox database |
| **Admin Vendor Approval / User Suspension** | `DEFERRED_MUTATION` | Alters live vendor/user status in database | Staging sandbox database |
| **Order Document & Payment Lifecycle** | `DEFERRED_PAYMENT` | Live Razorpay orders and stock deduction | Staging database + Razorpay test mode keys |

---

## 🚀 Running Tests

| npm Command | Target Execution |
| :--- | :--- |
| `npm test` | Runs tests across configured browser projects (Chromium full suite + Firefox & WebKit smoke/API). |
| `npm run test:chromium` | Runs full suite (51 tests) on Desktop Chromium engine. |
| `npm run test:firefox` | Runs representative smoke & API contract suite (8 tests) on Mozilla Firefox (Gecko). |
| `npm run test:webkit` | Runs representative smoke & API contract suite (8 tests) on WebKit (Safari) with controlled concurrency (`--workers=2`). |
| `npm run test:cross-browser` | Runs combined Firefox and WebKit validation (16 tests) with controlled concurrency. |
| `npm run test:vendor-admin` | Runs only Phase 6 Vendor Portal & Admin Governance tests (`tests/vendor-admin/`). |
| `npm run test:checkout` | Runs only Phase 5 Address Management & Safe Checkout tests (`tests/checkout/`). |
| `npm run test:customer` | Runs only Public Customer Journey tests (`tests/customer/`). |
| `npm run test:auth` | Runs only Authentication and RBAC route guard tests (`tests/auth/`). |
| `npm run test:smoke` | Runs only UI smoke and navigation tests (`tests/smoke/`). |
| `npm run test:api` | Runs only backend API health and contract tests (`tests/api/`). |
| `npm run test:headed` | Runs tests with visible Chromium browser windows. |
| `npm run test:ui` | Launches interactive Playwright UI Mode for visual step-through debugging. |
| `npm run test:list` | Lists all 67 discovered tests across the 3 projects in the terminal without executing them. |
| `npm run report` | Serves and opens the generated HTML test report in your browser. |

---

## 🌐 Phase 7A: Cross-Browser Testing Architecture

### Strategic Multi-Browser Project Matrix
Rather than indiscriminately running every test across all browsers—which would generate 3x the network traffic against the live production backend (`cravory-beta.vercel.app` & Render free tier)—we employ an enterprise tiered execution strategy:

1. **Chromium (Primary Project):**
   - **Scope:** Full coverage (51 tests) across all phases (API, Smoke, RBAC, Customer Journeys, Safe Checkout, Vendor Portal & Admin Governance).
   - **Objective:** Exhaustive functional, security, and integration validation.
2. **Firefox (Auxiliary Project - Gecko):**
   - **Scope:** Scoped to Public Smoke & Backend API tests (`tests/smoke/`, `tests/api/` = 8 tests).
   - **Objective:** Verifies CSS rendering, layout engine stability, SPA routing, and navigation in Gecko.
3. **WebKit (Auxiliary Project - Safari):**
   - **Scope:** Scoped to Public Smoke & Backend API tests (`tests/smoke/`, `tests/api/` = 8 tests).
   - **Objective:** Verifies Apple WebKit rendering and standards compliance without risking production backend overloads.

### Engineering Insight: WebKit Windows Concurrency Tuning
- **Context:** Playwright runs WebKit on Windows through a custom build (Cairo/WPE port).
- **Challenge:** Under default parallel execution (6 simultaneous browser workers on Windows), concurrent WebKit process startup causes heavy CPU thread contention, leading to delayed React hydration and intermittent timeout warnings.
- **Solution:** Configured WebKit execution with controlled worker concurrency (`--workers=2`) and a generous cross-browser test timeout (`test.setTimeout(45000)`).
- **Result:** 100% deterministic, passing runs across all 8 WebKit tests in ~23 seconds.

---

## 📊 Actual Execution Results (Phase 6.1 Verification)

### Full Suite Run (`npm test`)
```text
> cravory-playwright-automation@1.0.0 test
> playwright test

Running 51 tests using 6 workers

  ok  1 [chromium] › tests\api\health.spec.js › Backend API - Health Check › GET / should return 200 and healthy status (1.2s)
  ok  2 [chromium] › tests\api\products-api.spec.js › Backend API - Products Contract › GET /api/products should return 200 and valid product list schema (1.5s)
  ok  3 [chromium] › tests\auth\login.spec.js › Authentication - Login Page › should render the login form with email, password fields and submit button (4.1s)
  ok  4 [chromium] › tests\auth\rbac-guards.spec.js › Authentication - Route Guards & Session Security › should protect /admin/dashboard and redirect unauthenticated guest to /login (3.5s)
  ok  5 [chromium] › tests\auth\rbac-guards.spec.js › Authentication - Route Guards & Session Security › should protect /vendor/dashboard and redirect unauthenticated guest to /login (3.5s)
  ok  6 [chromium] › tests\auth\rbac-guards.spec.js › Authentication - Route Guards & Session Security › should protect /checkout and redirect unauthenticated guest to /login (4.2s)
  ok  7 [chromium] › tests\auth\login.spec.js › Authentication - Login Page › should reject invalid credentials with HTTP 400 and display an error alert (5.3s)
  ok  8 [chromium] › tests\auth\rbac-guards.spec.js › Authentication - Route Guards & Session Security › should protect /become-a-baker and redirect unauthenticated guest to /login (5.1s)
  ok  9 [chromium] › tests\auth\rbac-guards.spec.js › Authentication - Route Guards & Session Security › should verify guest session has null authentication tokens in localStorage (6.2s)
  ok 10 [chromium] › tests\auth\register.spec.js › Authentication - Registration Page › should render registration form with name, email, password, and role fields (3.8s)
  ok 11 [chromium] › tests\auth\register.spec.js › Authentication - Registration Page › should enforce required field validations on empty submission (4.5s)
  ok 12 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_PUBLIC: Guest navigation to /checkout redirects to /login (4.1s)
  ok 13 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_PUBLIC: Unauthenticated direct access to /addresses handles route safely without crash (3.5s)
  -  14 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › DEFERRED_AUTH: Persistent address retrieval from production backend
  ok 15 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_LOCAL: Address form displays validation errors for missing required fields (2.4s)
  -  16 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › DEFERRED_MUTATION: Live address creation and order creation in MongoDB
  -  17 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › DEFERRED_PAYMENT: Live Razorpay gateway checkout and server-side payment verification
  ok 18 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_LOCAL: Address form successfully submits valid address payload via mocked endpoint (2.3s)
  ok 19 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_LOCAL: Order Summary calculates totals and updates discount on coupon application (1.8s)
  ok 20 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_LOCAL: Handles customer payment cancellation gracefully without live payment calls (1.9s)
  ok 21 [chromium] › tests\checkout\checkout-safety.spec.js › Phase 5: Address Management & Safe Checkout Suite › SAFE_LOCAL: Handles gateway payment decline and presents retry banner (1.7s)
  ok 22 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 1: Homepage to Product Catalog navigation and visible information check (10.6s)
  ok 23 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 2: Global Header Search filters products by keyword (9.9s)
  ok 24 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 3: Category filter pills update catalog view (8.9s)
  ok 25 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 4: Open Product Details and verify real product information (10.1s)
  ok 26 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 5: Bakery Directory discovery and storefront exploration (11.4s)
  ok 27 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 6: Cross-entity navigation from Product Details to Bakery Storefront (12.5s)
  ok 28 [chromium] › tests\customer\public-journey.spec.js › Public Customer Journeys - Read-Only E-Commerce Flows › Journey 7: Guest interaction safety check (Add to Cart & Wishlist redirect to /login) (12.2s)
  ok 29 [chromium] › tests\smoke\framework-validation.spec.js › Framework Validation - Smoke Suite › should launch Chromium and load Cravory home page successfully (4.3s)
  ok 30 [chromium] › tests\smoke\website-smoke.spec.js › Cravory Website - UI Smoke Suite › Homepage should load successfully with correct title, hero banner, and main navigation (5.6s)
  ok 31 [chromium] › tests\smoke\website-smoke.spec.js › Cravory Website - UI Smoke Suite › Product Catalog page should load via navigation and render catalog header (5.7s)
  ok 32 [chromium] › tests\smoke\website-smoke.spec.js › Cravory Website - UI Smoke Suite › Bakery Directory page should load via navigation and render directory header (8.4s)
  ok 33 [chromium] › tests\smoke\website-smoke.spec.js › Cravory Website - UI Smoke Suite › Public authentication links (Login and Register) should lead to their respective forms (7.8s)
  ok 34 [chromium] › tests\smoke\website-smoke.spec.js › Cravory Website - UI Smoke Suite › Become a Baker link should redirect unauthenticated guests to login (6.0s)
  ok 35 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Public "Become a Baker" onboarding link is visible to guest and navigates correctly (7.6s)
  ok 36 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /vendor/orders redirects to /login (7.3s)
  ok 37 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /vendor/products redirects to /login (13.7s)
  ok 38 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /vendor/products/add redirects to /login (11.4s)
  ok 39 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /admin/vendors redirects to /login (12.8s)
  ok 40 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /admin/products redirects to /login (12.2s)
  ok 41 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /admin/orders redirects to /login (14.0s)
  ok 42 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /admin/analytics redirects to /login (14.3s)
  ok 43 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_PUBLIC: Unauthenticated access to /admin/users redirects to /login (6.6s)
  ok 44 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_API: GET /api/products/vendor/my-products rejects unauthenticated requests with HTTP 401 (4.4s)
  ok 45 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_API: GET /api/admin/dashboard rejects unauthenticated requests with HTTP 401 (1.7s)
  ok 46 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › SAFE_API: GET /api/vendors returns public bakery directory without leaking sensitive data (3.4s)
  -  47 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › DEFERRED_AUTH: Vendor portal login and private dashboard metric retrieval
  -  48 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › DEFERRED_AUTH: Admin portal login and private governance dashboard access
  -  49 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › DEFERRED_AUTHZ: Cross-role authorization protection (Customer attempting Vendor/Admin access)
  -  50 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › DEFERRED_MUTATION: Vendor product creation, catalog modification, and stock adjustments
  -  51 [chromium] › tests\vendor-admin\vendor-admin-safety.spec.js › Phase 6: Vendor Portal & Admin Governance Safety Suite › DEFERRED_MUTATION: Admin vendor approval, user account suspension, and governance toggles

  8 skipped
  43 passed (53.9s)
```

---

## 🤖 Phase 7B: GitHub Actions CI/CD Pipeline

The framework includes a fully automated continuous integration workflow located at [`.github/workflows/playwright.yml`](file:///.github/workflows/playwright.yml).

### Workflow Triggers
- **Push:** Automatically triggers on every push to `main` or `master`.
- **Pull Request:** Runs regression checks against proposed code changes targeting `main` or `master`.
- **Manual Execution (`workflow_dispatch`):** Allows on-demand regression runs directly from the GitHub Actions web UI.

### Pipeline Stages
1. **Runner Environment:** Ubuntu Latest (`ubuntu-latest`) with a 25-minute guard timeout.
2. **Runtime Setup:** Node.js 20 LTS (`actions/setup-node@v4`) with deterministic `npm` dependency caching.
3. **Clean Installation:** `npm ci` verifies `package-lock.json` dependency integrity without altering lockfiles.
4. **Browser Provisioning:** `npx playwright install --with-deps` installs Chromium, Firefox, WebKit, and Linux system dependencies.
5. **Chromium Full Suite Execution:** `npm run test:chromium` executes the 51-test core regression suite.
6. **Cross-Browser Verification:** `npm run test:cross-browser` runs the representative smoke and API contracts on Firefox and WebKit with managed concurrency (`--workers=2`).
7. **Artifact Publishing (`if: always()`):**
   - **`playwright-html-report`:** Uploads the interactive HTML report (`playwright-report/`), retained for 14 days.
   - **`test-results-and-traces`:** Uploads failure screenshots, webm failure videos, and trace files (`test-results/`), retained for 14 days.

### Inspecting Failed CI Runs Locally
When a CI run fails or captures an unexpected regression:
1. Navigate to the GitHub repository's **Actions** tab and select the failed workflow run.
2. Scroll to the **Artifacts** section at the bottom of the summary page.
3. Download and extract `playwright-html-report.zip`.
4. Open the report in your local browser using:
   ```bash
   npx playwright show-report path/to/extracted-folder
   ```
5. For granular debugging, download `test-results-and-traces.zip` to review step-by-step screenshots (`.png`), failure videos (`.webm`), and drag-and-drop trace zips onto [trace.playwright.dev](https://trace.playwright.dev/).

---

## 🔧 Instructions for Future Authenticated Testing

To run full end-to-end authenticated vendor and admin governance workflows without endangering production:
1. **Dedicated Test Identities:** Set non-production credentials in `.env`:
   - Customer: `TEST_CUSTOMER_EMAIL`, `TEST_CUSTOMER_PASSWORD`
   - Vendor: `TEST_VENDOR_EMAIL`, `TEST_VENDOR_PASSWORD`
   - Admin: `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`
2. **Isolated Database Sandbox:** Point the backend to a dedicated test MongoDB database (`MONGODB_URI_TEST`) where vendor applications, products, and order mutations can be seeded and torn down cleanly.
3. **Cross-Role Matrix Validation:** Log in as Customer and assert redirect to `/` on `/admin/*` and `/become-a-baker` on `/vendor/*` with HTTP 403 API responses.

---

## 📈 Roadmap & Phase Progress

- [x] **Phase 0:** Project Planning, System Architecture & Safety Strategy
- [x] **Phase 1:** Framework Foundation & Scaffolding (Node.js, Playwright, Config, Validation Test)
- [x] **Phase 2:** API Contract & UI Smoke Test Suite (Health, Schema, Navigation, SPA Routing)
- [x] **Phase 3:** Authentication, Page Objects & Role-Based Access Control (RBAC)
- [x] **Phase 4:** Safe Public Customer Journey Automation (Catalog, Search, Details, Directory, Storefront)
- [x] **Phase 5:** Address Management & Safe Checkout Payment Simulation
- [x] **Phase 6:** Baker Vendor Portal & Admin Governance Flows
- [x] **Phase 7A:** Cross-Browser Testing Foundation (Chromium, Firefox, WebKit Architecture)
- [x] **Phase 7B:** GitHub Actions CI/CD Pipeline & Automated Matrix Workflows
- [ ] **Phase 8:** Comprehensive Portfolio Presentation & Interview Walkthrough
