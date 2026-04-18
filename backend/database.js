const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Database file path
const dbPath = path.join(__dirname, "retailpulse.db");

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ SQLite database connected:", dbPath);
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Create reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        userEmail TEXT NOT NULL,
        originalText TEXT,
        processedText TEXT,
        text TEXT,
        language TEXT,
        category TEXT,
        source TEXT,
        overallSentiment TEXT,
        overallConfidence REAL,
        aspects TEXT,
        aspectsArray TEXT,
        explanation TEXT,
        priority TEXT,
        impactAnalysis TEXT,
        department TEXT,
        insights TEXT,
        suggestedActions TEXT,
        spamAnalysis TEXT,
        isDuplicate BOOLEAN,
        isSpamFlagged BOOLEAN,
        createdAt DATETIME,
        FOREIGN KEY (userEmail) REFERENCES users(email)
      )
    `);

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT,
        plan TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Database tables initialized");
  });
}

// Helper functions
function addReview(review) {
  return new Promise((resolve, reject) => {
    const {
      id,
      userEmail,
      originalText,
      processedText,
      text,
      language,
      category,
      source,
      overallSentiment,
      overallConfidence,
      aspects,
      aspectsArray,
      explanation,
      priority,
      impactAnalysis,
      department,
      insights,
      suggestedActions,
      spamAnalysis,
      isDuplicate,
      isSpamFlagged,
      createdAt,
    } = review;

    db.run(
      `INSERT INTO reviews (
        id, userEmail, originalText, processedText, text, language, category,
        source, overallSentiment, overallConfidence, aspects, aspectsArray,
        explanation, priority, impactAnalysis, department, insights,
        suggestedActions, spamAnalysis, isDuplicate, isSpamFlagged, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userEmail,
        originalText,
        processedText,
        text,
        language,
        category,
        source,
        overallSentiment,
        overallConfidence,
        JSON.stringify(aspects),
        JSON.stringify(aspectsArray),
        explanation,
        priority,
        JSON.stringify(impactAnalysis),
        department,
        JSON.stringify(insights),
        JSON.stringify(suggestedActions),
        JSON.stringify(spamAnalysis),
        isDuplicate ? 1 : 0,
        isSpamFlagged ? 1 : 0,
        createdAt,
      ],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      },
    );
  });
}

function getReviewsByUser(userEmail) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM reviews WHERE userEmail = ? ORDER BY createdAt DESC`,
      [userEmail],
      (err, rows) => {
        if (err) reject(err);
        else {
          // Parse JSON fields
          const parsed = rows.map((r) => ({
            ...r,
            aspects: JSON.parse(r.aspects || "{}"),
            aspectsArray: JSON.parse(r.aspectsArray || "[]"),
            impactAnalysis: JSON.parse(r.impactAnalysis || "{}"),
            insights: JSON.parse(r.insights || "[]"),
            suggestedActions: JSON.parse(r.suggestedActions || "[]"),
            spamAnalysis: JSON.parse(r.spamAnalysis || "{}"),
            isDuplicate: Boolean(r.isDuplicate),
            isSpamFlagged: Boolean(r.isSpamFlagged),
          }));
          resolve(parsed);
        }
      },
    );
  });
}

function getReviewById(id, userEmail) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM reviews WHERE id = ? AND userEmail = ?`,
      [id, userEmail],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          ...row,
          aspects: JSON.parse(row.aspects || "{}"),
          aspectsArray: JSON.parse(row.aspectsArray || "[]"),
          impactAnalysis: JSON.parse(row.impactAnalysis || "{}"),
          insights: JSON.parse(row.insights || "[]"),
          suggestedActions: JSON.parse(row.suggestedActions || "[]"),
          spamAnalysis: JSON.parse(row.spamAnalysis || "{}"),
          isDuplicate: Boolean(row.isDuplicate),
          isSpamFlagged: Boolean(row.isSpamFlagged),
        });
      },
    );
  });
}

function deleteReviewById(id, userEmail) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM reviews WHERE id = ? AND userEmail = ?`,
      [id, userEmail],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      },
    );
  });
}

function deleteReviewsByUser(userEmail) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM reviews WHERE userEmail = ?`,
      [userEmail],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      },
    );
  });
}

function deleteAllReviews() {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM reviews`, function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

function addUser(email, name, plan = "Pro") {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO users (email, name, plan) VALUES (?, ?, ?)`,
      [email, name, plan],
      function (err) {
        if (err) reject(err);
        else resolve();
      },
    );
  });
}

module.exports = {
  db,
  addReview,
  getReviewsByUser,
  getReviewById,
  deleteReviewById,
  deleteReviewsByUser,
  deleteAllReviews,
  addUser,
};
