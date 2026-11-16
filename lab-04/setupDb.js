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
