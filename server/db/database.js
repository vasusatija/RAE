import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || '/tmp/rae.db';

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let _db = null;

// Save the database to disk
function saveToDisk() {
  if (_db) {
    const data = _db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Auto-save every 5 seconds
let saveInterval = null;

// Wrapper to make sql.js look like better-sqlite3's synchronous API
class DBWrapper {
  constructor(sqlJsDb) {
    this._db = sqlJsDb;
  }

  exec(sql) {
    this._db.run(sql);
    saveToDisk();
  }

  pragma(str) {
    try { this._db.run(`PRAGMA ${str}`); } catch(e) { /* ignore pragma errors */ }
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        self._db.run(sql, params);
        saveToDisk();
        return { changes: self._db.getRowsModified() };
      },
      get(...params) {
        const stmt = self._db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const results = [];
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }

  close() {
    if (saveInterval) clearInterval(saveInterval);
    saveToDisk();
    this._db.close();
  }
}

export async function initDB() {
  const SQL = await initSqlJs();

  let fileBuffer = null;
  if (fs.existsSync(dbPath)) {
    fileBuffer = fs.readFileSync(dbPath);
  }

  const sqlDb = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
  _db = sqlDb;

  const db = new DBWrapper(sqlDb);

  // Auto-save periodically
  saveInterval = setInterval(saveToDisk, 5000);

  return db;
}

let dbInstance = null;

export function setDB(db) {
  dbInstance = db;
}

export function getDB() {
  if (!dbInstance) throw new Error('Database not initialized. Call initDB() first.');
  return dbInstance;
}

export function initializeDatabase(db) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      organization TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      formAccess TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Access Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      empId TEXT NOT NULL,
      department TEXT NOT NULL,
      requestedRole TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      formAccess TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      actedAt TEXT,
      actedBy TEXT
    );
  `);

  // Forms table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      businessUnit TEXT NOT NULL,
      description TEXT,
      fields TEXT NOT NULL,
      approvalLogic TEXT NOT NULL,
      amountLogic TEXT NOT NULL,
      autoAction TEXT NOT NULL DEFAULT 'none',
      rejectionReasonConfig TEXT NOT NULL DEFAULT 'optional',
      limitBasedApproval TEXT,
      slaConfig TEXT,
      assignedRequestors TEXT NOT NULL,
      assignedApprovers TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdByEmail TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Form Approvals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS form_approvals (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      rejectionReason TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      actedAt TEXT,
      actedBy TEXT
    );
  `);

  // Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      formId TEXT NOT NULL,
      requestorId TEXT NOT NULL,
      requestorEmail TEXT NOT NULL,
      data TEXT NOT NULL,
      amount REAL,
      status TEXT NOT NULL DEFAULT 'pending',
      currentApprover TEXT,
      approvalChain TEXT,
      approvedBy TEXT,
      rejectionReason TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      actedAt TEXT,
      slaBreached TEXT
    );
  `);

  // Audit Trail table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_trail (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      targetType TEXT NOT NULL,
      targetId TEXT NOT NULL,
      userId TEXT,
      userEmail TEXT NOT NULL,
      description TEXT,
      details TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      updatedBy TEXT,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Slack Config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS slack_config (
      id TEXT PRIMARY KEY,
      webhookUrl TEXT,
      enabledEvents TEXT NOT NULL DEFAULT '["access_request","form_submission","request_action"]',
      updatedBy TEXT,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('Database schema initialized');
}

// Proxy default export that delegates to getDB()
const dbProxy = new Proxy({}, {
  get(target, prop) {
    const db = getDB();
    if (typeof db[prop] === 'function') {
      return db[prop].bind(db);
    }
    return db[prop];
  }
});

export default dbProxy;
