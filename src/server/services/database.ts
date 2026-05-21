/**
 * @file src/server/services/database.ts
 * Сервис работы с базой данных SQLite через better-sqlite3.
 *
 * better-sqlite3 — синхронный драйвер. Это намеренно: синхронные операции
 * не блокируют event loop Node.js при использовании WAL-режима SQLite,
 * зато API становится проще и типобезопаснее.
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Путь к SQL-схеме */
const SCHEMA_PATH = resolve(__dirname, '../db/schema.sql');

/**
 * Singleton инстанс SQLite. Открывается один раз при старте сервера.
 * В тестах можно переопределить через DatabaseService.resetInstance().
 */
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(Config.DB_PATH, {
      verbose: Config.IS_DEV ? console.log : undefined,
    });

    // Применить схему (CREATE TABLE IF NOT EXISTS — идемпотентно)
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    _db.exec(schema);

    // Корректное завершение при сигналах ОС
    process.on('exit', () => _db?.close());
    process.on('SIGINT',  () => { _db?.close(); process.exit(0); });
    process.on('SIGTERM', () => { _db?.close(); process.exit(0); });
  }
  return _db;
}

/**
 * Типобезопасный хелпер: выполняет SELECT и возвращает массив T.
 * @example
 * const rows = queryAll<Project>(db, 'SELECT * FROM projects WHERE status=?', ['active']);
 */
export function queryAll<T>(
  db: Database.Database,
  sql: string,
  params: readonly unknown[] = [],
): T[] {
  return db.prepare(sql).all(...params) as T[];
}

/**
 * Типобезопасный хелпер: SELECT одной строки или undefined.
 */
export function queryOne<T>(
  db: Database.Database,
  sql: string,
  params: readonly unknown[] = [],
): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

/**
 * Выполняет INSERT/UPDATE/DELETE и возвращает количество затронутых строк.
 */
export function execute(
  db: Database.Database,
  sql: string,
  params: readonly unknown[] = [],
): Database.RunResult {
  return db.prepare(sql).run(...params);
}

/**
 * Выполняет несколько операций в одной транзакции.
 * При любой ошибке внутри fn транзакция откатывается.
 * @example
 * withTransaction(db, () => {
 *   execute(db, 'INSERT INTO tasks ...', [...]);
 *   execute(db, 'UPDATE projects SET updated_at=? WHERE id=?', [...]);
 * });
 */
export function withTransaction<T>(db: Database.Database, fn: () => T): T {
  return db.transaction(fn)();
}

/**
 * Генерирует UUID v4-подобный ID.
 * SQLite генерирует его сам (DEFAULT lower(hex(randomblob(16)))),
 * но иногда нужен ID заранее (для связей до INSERT).
 */
export function newId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // Формат: 8-4-4-4-12 hex
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
