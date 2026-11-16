# Lab 4: Registration, Login and JWT

| Detail | Value |
|---|---|
| **Student Name** | M.shivaram |
| **Registration Number** | 252U1R5104 |
| **Class & Section** | 313 AI DE 2B |
| **Study Level** | UG |
| **Year & Term** | 2 & 2 |
| **Subject** | Backend Development Fundamentals |
| **Faculty** | Mr Yugandhar Gurjalwar |
| **Assessment** | LAB REPORT - 4 |
| **Submission Date** | 14/11/2026 |

---

## 1. Objective

To build a secure user authentication REST API using Node.js, Express.js, SQLite, bcrypt and JSON Web Tokens. The API supports user registration with input validation, duplicate username checking and password hashing, along with user login with credential verification and JWT token generation.

---

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime environment |
| Express.js | Web framework for building the REST API |
| SQLite3 | Lightweight relational database |
| bcrypt | Password hashing and comparison |
| jsonwebtoken | JWT token generation and verification |
| Postman | API testing tool |

---

## 3. Folder Structure

```
lab-04/
├── app.js
├── setupDb.js
├── users.db
├── package.json
├── .gitignore
├── README.md
└── screenshots/
    ├── register-success.png
    ├── register-duplicate.png
    ├── register-missing-fields.png
    ├── register-short-password.png
    ├── login-success.png
    ├── login-invalid-username.png
    ├── login-invalid-password.png
    ├── login-missing-fields.png
    └── sqlite-verification.png
```

---

## 4. Database Design

### Table: `users`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| username | TEXT | UNIQUE NOT NULL |
| name | TEXT | NOT NULL |
| password | TEXT | NOT NULL (stored as bcrypt hash) |

### Sample Users (10 Pre-Inserted)

| Username | Name | Password (Plain) |
|---|---|---|
| shivaram | M. Shivaram | Shiva@2026 |
| rahul_dev | Rahul Dev | Rahul@123 |
| anitha_k | Anitha Kumari | Anitha#456 |
| vijay_m | Vijay Mohan | Vijay$789 |
| priya_s | Priya Sharma | Priya@321 |
| karthik_r | Karthik Reddy | Karthik#654 |
| deepa_n | Deepa Nair | Deepa$987 |
| suresh_b | Suresh Babu | Suresh@111 |
| meena_g | Meena Gupta | Meena#222 |
| arjun_p | Arjun Patel | Arjun$333 |

---

## 5. Installation and Running Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/shivaram569/lab-01-node-express.git
cd lab-01-node-express/lab-04
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Initialize the Database

```bash
node setupDb.js
```

This creates `users.db` and inserts 10 sample users with bcrypt-hashed passwords.

### Step 4: Start the Server

```bash
node app.js
```

Server runs at: `http://localhost:3000/`

---

## 6. API Endpoints

| Method | Endpoint | Description | Success Status | Error Status |
|---|---|---|---|---|
| POST | `/register/` | Register a new user | 201 Created | 400 Bad Request |
| POST | `/login/` | Login and get JWT token | 200 OK | 400 Bad Request |

### POST `/register/`

**Request Body:**

```json
{
  "username": "new_user",
  "name": "New User",
  "password": "NewPass@123"
}
```

**Success Response (201):**

```json
{
  "message": "User registered successfully"
}
```

**Error Responses (400):**

```json
{ "error": "All fields are required" }
{ "error": "Password must be at least 6 characters" }
{ "error": "Username already exists" }
```

### POST `/login/`

**Request Body:**

```json
{
  "username": "shivaram",
  "password": "Shiva@2026"
}
```

**Success Response (200):**

```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses (400):**

```json
{ "error": "Username and password are required" }
{ "error": "Invalid username" }
{ "error": "Invalid password" }
```

---

## 7. Source Code

### app.js

```javascript
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = 3000;
const JWT_SECRET = "lab04_jwt_secret_key_2026";

app.use(express.json());

const dbPath = path.join(__dirname, "users.db");
const db = new sqlite3.Database(dbPath);

app.post("/register/", (request, response) => {
  const { username, name, password } = request.body;

  if (!username || !name || !password) {
    return response.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 6) {
    return response
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  db.get(
    "SELECT username FROM users WHERE username = ?",
    [username],
    (err, existingUser) => {
      if (existingUser) {
        return response.status(400).json({ error: "Username already exists" });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        db.run(
          "INSERT INTO users (username, name, password) VALUES (?, ?, ?)",
          [username, name, hashedPassword],
          (err) => {
            if (err) {
              return response
                .status(500)
                .json({ error: "Failed to register user" });
            }
            response
              .status(201)
              .json({ message: "User registered successfully" });
          }
        );
      });
    }
  );
});

app.post("/login/", (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    return response
      .status(400)
      .json({ error: "Username and password are required" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (!user) {
      return response.status(400).json({ error: "Invalid username" });
    }

    bcrypt.compare(password, user.password, (err, isPasswordValid) => {
      if (!isPasswordValid) {
        return response.status(400).json({ error: "Invalid password" });
      }

      const payload = { username: user.username };
      const jwt_token = jwt.sign(payload, JWT_SECRET);

      response.status(200).json({ jwt_token });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

### setupDb.js

```javascript
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const dbPath = path.join(__dirname, "users.db");
const db = new sqlite3.Database(dbPath);

const sampleUsers = [
  { username: "shivaram", name: "M. Shivaram", password: "Shiva@2026" },
  { username: "rahul_dev", name: "Rahul Dev", password: "Rahul@123" },
  { username: "anitha_k", name: "Anitha Kumari", password: "Anitha#456" },
  { username: "vijay_m", name: "Vijay Mohan", password: "Vijay$789" },
  { username: "priya_s", name: "Priya Sharma", password: "Priya@321" },
  { username: "karthik_r", name: "Karthik Reddy", password: "Karthik#654" },
  { username: "deepa_n", name: "Deepa Nair", password: "Deepa$987" },
  { username: "suresh_b", name: "Suresh Babu", password: "Suresh@111" },
  { username: "meena_g", name: "Meena Gupta", password: "Meena#222" },
  { username: "arjun_p", name: "Arjun Patel", password: "Arjun$333" },
];

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO users (username, name, password) VALUES (?, ?, ?)"
  );

  let completed = 0;

  sampleUsers.forEach((user) => {
    bcrypt.hash(user.password, 10, (err, hashedPassword) => {
      stmt.run(user.username, user.name, hashedPassword);
      completed++;
      if (completed === sampleUsers.length) {
        stmt.finalize();
        db.get("SELECT COUNT(*) AS total FROM users", (err, row) => {
          console.log(`Database initialized with ${row.total} users.`);
          db.close();
        });
      }
    });
  });
});
```

### package.json

```json
{
  "name": "lab-04-registration-login-jwt",
  "version": "1.0.0",
  "description": "Registration, Login and JWT Authentication API",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "setup": "node setupDb.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.7",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### .gitignore

```
node_modules/
.env
```

---

## 8. Screenshots

### 8.1 Registration - Successful

![Register Success](screenshots/register-success.png)

### 8.2 Registration - Duplicate Username

![Register Duplicate](screenshots/register-duplicate.png)

### 8.3 Registration - Missing Fields

![Register Missing Fields](screenshots/register-missing-fields.png)

### 8.4 Registration - Short Password

![Register Short Password](screenshots/register-short-password.png)

### 8.5 Login - Successful (JWT Token Returned)

![Login Success](screenshots/login-success.png)

### 8.6 Login - Invalid Username

![Login Invalid Username](screenshots/login-invalid-username.png)

### 8.7 Login - Invalid Password

![Login Invalid Password](screenshots/login-invalid-password.png)

### 8.8 Login - Missing Fields

![Login Missing Fields](screenshots/login-missing-fields.png)

### 8.9 SQLite Database Verification

![SQLite Verification](screenshots/sqlite-verification.png)

---

## 9. JWT (JSON Web Token) Explanation

### What is JWT?

JWT (JSON Web Token) is an open standard (RFC 7519) for securely transmitting information between two parties as a JSON object. It is compact, URL-safe and self-contained.

### JWT Structure

A JWT consists of three parts separated by dots (`.`):

```
Header.Payload.Signature
```

| Part | Description |
|---|---|
| **Header** | Contains the token type (`JWT`) and signing algorithm (`HS256`) |
| **Payload** | Contains the claims (data). In this lab, it contains `{ "username": "shivaram" }` |
| **Signature** | Created by signing the encoded header and payload with a secret key |

### Example JWT from This Lab

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNoaXZhcmFtIiwiaWF0IjoxNzk0ODAzMjQ3fQ.7gX66Rr33w_66OH0KpLJ7eriS7yfBuBL7p4fQ4JNr5s
```

**Decoded:**

- **Header:** `{ "alg": "HS256", "typ": "JWT" }`
- **Payload:** `{ "username": "shivaram", "iat": 1794803247 }`
- **Signature:** HMACSHA256 of header + payload using the secret key

### How JWT Works in This Lab

1. User sends username and password to `/login/`
2. Server verifies credentials against the database
3. If valid, server creates a JWT with the username in the payload
4. Server signs the JWT with a secret key and returns it
5. Client stores and sends the JWT in future requests for authentication

---

## 10. Viva Questions and Answers

**Q1: Why POST for login?**

POST is used for login because authentication credentials (username and password) are sensitive and must be sent securely in the request body rather than in the URL query string as in a GET request. URLs are routinely logged in plain text in browser histories, proxy servers, web server access logs, and network monitoring tools. Furthermore, POST requests are not subject to URL length limits and ensure that sensitive credentials are encrypted in transit when using HTTPS.

**Q2: Hash vs encrypt?**

Hashing is a one-way mathematical function (such as bcrypt) that converts plaintext data into a fixed-length string of characters that cannot be reversed or decrypted back into the original plaintext. It is ideal for storing passwords. Encryption is a two-way mathematical process where plaintext is scrambled into ciphertext and can be decrypted back into its original form using a secret key. Passwords should always be hashed, never encrypted.

**Q3: What does `jwt.sign()` need?**

`jwt.sign(payload, secretOrPrivateKey, [options, callback])` requires:
1. **Payload:** A JavaScript object containing the claims/data to be encoded (e.g., `{ username: user.username }`).
2. **Secret or Private Key:** A secret string (for HMAC SHA-256 algorithms like `HS256`) or private key (for asymmetric algorithms like `RS256`) used to cryptographically sign the token.
3. **Options (optional):** Additional settings such as `expiresIn` (token expiration time), `algorithm`, `issuer`, and `subject`.

**Q4: What should never go into the payload?**

Sensitive or confidential information should **never** go into the JWT payload, including:
- Passwords (neither plain text nor hashed)
- Credit card numbers, CVVs, or financial data
- Government identification numbers (Aadhaar, SSN, PAN)
- Secret API keys or encryption keys

This is because the JWT payload is only Base64URL-encoded, **not encrypted**. Anyone who intercepts or inspects the token can trivially decode and read the payload at websites like [jwt.io](https://jwt.io).

**Q5: What is bcrypt and why is it used for password storage?**

bcrypt is an adaptive password-hashing function based on the Blowfish cipher. It incorporates a salt to protect against rainbow table attacks and includes an adjustable work factor (salt rounds), allowing the hashing cost to increase over time as computer hardware becomes faster. Unlike fast general-purpose cryptographic hashes (such as MD5, SHA-1, or SHA-256), bcrypt is intentionally computationally slow, making brute-force and dictionary attacks impractical.

**Q6: What is a salt in bcrypt?**

A salt is a cryptographically strong random string appended to the password before hashing. It ensures that identical passwords produce completely different hash outputs, effectively neutralizing rainbow table attacks. In bcrypt, the salt and cost factor are embedded directly inside the resulting hash string (e.g., `$2b$10$...`).

**Q7: Why do we use parameterized queries instead of string concatenation?**

Parameterized queries (e.g., `SELECT * FROM users WHERE username = ?`, `[username]`) treat user input strictly as literal values rather than executable SQL commands. This prevents SQL injection attacks, where malicious actors input strings containing quotes or SQL statements (such as `' OR '1'='1`) to hijack the query structure.

**Q8: What happens if the JWT secret key is compromised?**

If the JWT secret key is compromised, an attacker can forge valid JWT tokens for any user (including administrators) and sign them legitimately. The server will accept the forged tokens as authentic, leading to total account takeover. Therefore, secret keys must be kept secure, stored in environment variables (`.env`), and never hardcoded or committed to version control.

**Q9: What is the purpose of the `iat` field in a JWT payload?**

`iat` stands for "Issued At". It is a standard JWT claim representing the Unix timestamp (seconds since January 1, 1970) at which the token was generated. It is automatically added by the `jsonwebtoken` library and is useful for determining token age and enforcing session longevity rules.

**Q10: Why do we return HTTP status code 201 for registration and 200 for login?**

- **HTTP 201 Created:** Specifies that the request has succeeded and led to the creation of a new resource (a new user record in the database).
- **HTTP 200 OK:** Specifies that the request has succeeded in retrieving or verifying information without creating a new persistent resource. Login verifies credentials and generates a token, so 200 is appropriate.

---

## 11. Debugging Notes

| Issue | Solution |
|---|---|
| `MODULE_NOT_FOUND` error for sqlite3 | Run `npm install` to install all dependencies |
| `SQLITE_CONSTRAINT: UNIQUE constraint failed` | The username already exists in the database. Use a different username |
| `Cannot read properties of undefined (reading 'username')` | Ensure `Content-Type: application/json` header is set in Postman and request body is valid JSON |
| bcrypt native build fails on Windows | Ensure Python and Visual Studio Build Tools are installed. Alternatively, use `bcryptjs` as a pure JavaScript fallback |
| `express.json()` not parsing body | Verify that `app.use(express.json())` is placed before the route definitions |
| JWT token not generated | Check that `jsonwebtoken` is installed and the secret key is defined |
| Database file not found | Run `node setupDb.js` before starting the server |

---

## 12. Conclusion

Successfully built a user authentication REST API with registration and login functionality using Node.js, Express.js, SQLite, bcrypt and JSON Web Tokens. Implemented input validation, duplicate username checking, secure password hashing with bcrypt and JWT token generation. All endpoints were tested using Postman covering both successful and unsuccessful scenarios. The database was verified using the SQLite CLI confirming proper storage of hashed passwords and user data.
