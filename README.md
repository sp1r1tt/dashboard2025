# Inventory Management System

This project is a web-based inventory management system built with Next.js, designed to manage products, groups, users, and settings with multilingual support (English and Russian). It includes features like authentication, dashboard analytics, and inventory tracking, with a responsive UI.

## Technologies Used

- **Next.js**: React framework for server-side rendering, API routes, and static site generation.
- **React**: For building interactive UI components.
- **TypeScript**: For type-safe JavaScript development.
- **MySQL**: Database for storing user, product, and group data.
- **mysql2/promise**: MySQL client for Node.js with promise-based API.
- **jsonwebtoken (JWT)**: For secure user authentication via tokens.
- **bcrypt**: For password hashing and verification.
- **React Bootstrap**: For responsive and styled UI components.
- **Chart.js & react-chartjs-2**: For visualizing data with bar and pie charts.
- **Next-Intl**: For internationalization (i18n) with English and Russian support.
- **date-fns**: For date formatting and localization.
- **Heroicons**: For SVG icons used in the UI.
- **Tailwind CSS**: For styling (referenced via custom variables like `--primary-green`).
- **Aiven MySQL**: Hosted MySQL database with SSL configuration.
- **ESLint & Prettier**: For code linting and formatting.

## Project Structure

The project is organized into several key directories and files:

- **/src/app**: Contains Next.js pages and API routes.
  - **/api**: API endpoints for authentication, inventory, products, groups, users, and profile management.
  - **/components**: Reusable React components like `Sidebar`, `Header`, `InventoryList`, `InventoryDetails`, and `LanguageSwitcher`.
  - **/pages**: Client-side pages for dashboard, login, groups, products, users, and settings.
- **/src/lib/db.ts**: Database connection logic using `mysql2/promise` with connection pooling and retry mechanism.
- **/messages**: JSON files for English (`en.json`) and Russian (`ru.json`) translations.
- **/types**: TypeScript interfaces for `Product`, `Group`, `User`, and `InventoryItem`.

## Features

### Authentication

- **Login**: 
  - Users log in via `/api/auth/login` with email and password.
  - Passwords are hashed using `bcrypt` and verified against the database.
  - Upon successful login, a JWT token is generated (valid for 1 hour) and stored in an HTTP-only cookie (`token`) with secure and `sameSite: strict` attributes.
  - The user is redirected to the `/dashboard` page.

- **Authorization**:
  - Protected routes (`/dashboard`, `/products`, `/groups`, `/users`, `/settings`) are guarded by middleware (`middleware.ts`) that checks for the presence of a valid JWT token.
  - If no token is found or the token is invalid, users are redirected to `/login`.

- **Logout**:
  - Triggered via the `Sidebar` component by calling `/api/auth/logout`.
  - The logout API clears the `token` cookie by setting its `maxAge` to 0.
  - Users are redirected to `/login` upon successful logout.

- **Token Expiry**:
  - JWT tokens expire after 1 hour (`expiresIn: '1h'`).
  - No automatic logout mechanism is implemented client-side; users must manually log out or wait for token expiry.
  - Upon token expiry, API requests will fail with a 401 status, and the client redirects to `/login`.

### Internationalization (i18n)

- **Next-Intl**: Handles translations for English and Russian.
- **Language Switching**:
  - The `LanguageSwitcher` and `LanguageSwitcherMobile` components allow users to switch languages.
  - The selected language is stored in a `NEXT_LOCALE` cookie and used to load the corresponding translation file (`en.json` or `ru.json`).
  - Titles and labels dynamically switch based on the locale (e.g., `title_ru` for Russian, `title_en` for English).
- **Dynamic Title Mapping**:
  - Group titles are mapped to translation keys (`titleLongVeryLong`, `titleLong`, `titleLongShort`) for consistent display.
  - Fallbacks ensure untranslated titles display raw values.

### Dashboard

- Displays an overview with bar and pie charts for group and product status distribution.
- Fetches data from `/api/groups` and `/api/inventory` to populate charts and inventory lists.
- Uses `react-chartjs-2` for visualizations, with responsive design via React Bootstrap.

### Inventory Management

- **Groups**: 
  - Managed via `/groups` page and `/api/groups` endpoints.
  - Supports listing and deletion with confirmation modals.
  - Displays product counts, dates, and currency values (USD/UAH).
- **Products**:
  - Managed via `/products` page and `/api/products` endpoints.
  - Supports listing and deletion with confirmation modals.
  - Displays name, serial number, and status (`Свободен`, `В работе`, `Резерв`).
- **Inventory List and Details**:
  - The `InventoryList` component lists groups with their product counts and dates.
  - The `InventoryDetails` component shows details for a selected group or product, including related products.

### User Management

- **Users Page**: Lists users with options to delete via `/api/users/[id]` endpoint.
- **Profile Settings**:
  - Users can update their name, email, and password via `/api/user/update`.
  - Changes are confirmed via a modal to prevent accidental updates.
  - Email uniqueness is enforced to avoid duplicates.

### Search Functionality

- Implemented in the `Header` component.
- Searches across products (by name/serial), groups (by title), and users (by name/email).
- Supports multilingual search with translation-aware matching.
- Results are displayed in a dropdown and clicking a result navigates to the relevant page.

## Database

- **MySQL Schema**:
  - `users`: Stores user data (`id`, `name`, `email`, `password`, `created_at`).
  - `products`: Stores product data (`id`, `group_id`, `name`, `serial`, `status`, `date_code`, `date_text`, `created_at`).
  - `groups`: Stores group data (`id`, `title_en`, `title_ru`, `products`, `date_code`, `date_text`, `usd`, `created_at`).
- **Connection Pool**:
  - Uses `mysql2/promise` with a connection pool for efficient database access.
  - Configured with SSL for secure connections to Aiven MySQL.
  - Implements retry logic (up to 3 attempts) for handling transient connection issues.

## How to Run

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd inventory-management
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Create a `.env` file with the following:
   ```env
   DB_HOST=<your-mysql-host>
   DB_PORT=<your-mysql-port>
   DB_USER=<your-mysql-user>
   DB_PASSWORD=<your-mysql-password>
   DB_DATABASE=<your-mysql-database>
   DB_SSL_CA=<path-to-ssl-ca-cert>
   JWT_SECRET=<your-jwt-secret>
   NODE_ENV=development
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Access the Application**:
   Open `http://localhost:3000` in your browser.

## Deployment

- Deploy on Vercel or any Node.js-compatible hosting platform.
- Ensure environment variables are configured in the hosting environment.
- Use a production-grade MySQL database (e.g., Aiven) with proper SSL configuration.

## Security Considerations

- **JWT Tokens**: Stored in HTTP-only cookies to prevent XSS attacks.
- **Password Hashing**: Uses `bcrypt` for secure password storage.
- **Middleware**: Protects routes by validating JWT tokens.
- **SQL Injection**: Prevented by using parameterized queries in `db.ts`.
- **CORS**: API routes include credentials for secure cookie handling.

## Limitations

- **Token Expiry**: No client-side auto-logout mechanism; users rely on token expiry (1 hour) or manual logout.
- **Product Deletion**: The `InventoryDetails` component has a client-side-only delete implementation that doesn't call the API.
- **Error Handling**: Some error messages are generic and could be more specific.
- **No Add Product/Group**: The UI includes buttons for adding products, but the functionality is not implemented.
- **Database Retries**: Limited to 3 attempts; may need adjustment for production environments.

## Future Improvements

- Implement client-side auto-logout on token expiry with a timer.
- Add API endpoints and UI for creating products and groups.
- Enhance error messages for better user feedback.
- Add pagination for large datasets in `/users`, `/products`, and `/groups`.
- Implement role-based access control (e.g., admin vs. buyer roles).