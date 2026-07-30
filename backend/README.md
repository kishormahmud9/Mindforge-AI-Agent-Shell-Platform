# Startup Template PostgreSQL Backend

This is a robust startup template for a backend application using Node.js, Express, PostgreSQL, and Prisma. It includes essential features like authentication (OAuth & Email), OTP verification, and user management.

## 🚀 Features

- **Authentication**: Secure login/registration using `bcrypt` and `jsonwebtoken`.
- **OAuth Integration**: Google Login support via `passport-google-oauth20`.
- **OTP System**: Send and verify OTPs for email verification and password resets.
- **User Management**: Profile management, user roles (System Owner, Business Owner, Staff, Customer), and details retrieval.
- **Validation**: Request body and parameter validation using `Zod`.
- **Database Architecture**: Managed by Prisma ORM with PostgreSQL.
- **Error Handling**: Centralized error management system using `catchAsync` utility for cleaner controller logic.
- **Mailing**: Integration with `nodemailer` for automated emails with modern, responsive EJS templates.
- **File Upload System**: Reusable Multer configuration supporting multiple categories (e.g., avatars) with automatic path handling and unique naming.
- **Static Assets**: Dedicated structure for serving uploaded files (e.g., user avatars) statically.
- **Security**: CORS, cookie-parser, and middleware-based authorization.

## 📦 Tech Stack & Packages

### Core
- **Framework**: `express`
- **ORM**: `prisma`
- **Database**: `postgresql` (via `pg`)
- **Runtime**: Node.js (ES Modules)

### Main Dependencies
- **Auth**: `passport`, `passport-google-oauth20`, `passport-local`, `jsonwebtoken`, `bcrypt`
- **Security**: `cors`, `cookie-parser`, `zod` (validation)
- **Utilities**: `axios`, `date-fns`, `dotenv`, `multer` (file uploads), `nodemailer`
- **Cache**: `redis`

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd StartupTemplatePostgreSql
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your configurations (Database URL, JWT secret, OAuth credentials, etc.).

4. **Prisma Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the application**:
   - Development: `npm run dev`
   - Production: `npm start`

## 🛣️ API Routes & CRUD
### BASE URL > http://localhost:8001/api/
### Auth Module (`/api/auth`)
| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/auth/login` | User login with credentials |
| POST | `/auth/refresh-token` | Get a new access token |
| POST | `/auth/logout` | Log out user and clear session |
| POST | `/auth/forgot-password` | Initiate forgot password flow |
| POST | `/auth/verify-forgot-password-otp` | Verify OTP for password reset |
| POST | `/auth/reset-password` | Reset user password (Auth required) |
| POST | `/auth/change-password` | Change user password (Auth required) |

### User Module (`/api/user`)
| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/user/register` | Register a new user |
| GET | `/user/profile/me` | Get current user profile |
| GET | `/user/user-details/:id` | Get specific user details |
| PATCH | `/user/update-profile` | Update current user profile |
| PATCH | `/user/upload-avatar` | Upload or update user avatar |

### OTP Module (`/api/otp`)
| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/otp/send` | Send OTP to user email |
| POST | `/otp/verify` | Verify the sent OTP |

### Agen Management Module (`/api/agen-management`)
| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/agen-management` | Create a new agent |
| GET | `/agen-management` | Get all agents |
| GET | `/agen-management/:id` | Get specific agent by ID |
| PATCH | `/agen-management/:id` | Update agent details |
| DELETE | `/agen-management/:id` | Delete an agent |

### Instances Module (`/api/instances`)
| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/instances` | Create a new instance |
| GET | `/instances` | Get all instances |
| GET | `/instances/:id` | Get specific instance |
| PATCH | `/instances/:id` | Update instance |
| DELETE | `/instances/:id` | Delete instance |

### Messages Module (`/api/messages`)
| Method | Route | Description |
| :--- | :--- | :--- |
| POST | `/messages` | Send a new message |
| GET | `/messages/:instance_id` | Get message history for an instance |
| GET | `/messages/all` | Get all messages |
| GET | `/messages/instances` | Get message instances |

### Admin Module (`/api/admin`)
| Method | Route | Description |
| :--- | :--- | :--- |
| GET | `/admin/users` | Get all users (Admin only) |
| GET | `/admin/user-instances/:id` | Get instances for a specific user |

---

## Postman Collection > [POSTMAN]StratupTemplate.postman.json
*Created with ❤️ for rapid development.* ©️ Ahanaf Mubasshir
