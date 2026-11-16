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
