"""
Migration Manager - Gestor de Migraciones SQL
Aplica automáticamente las migraciones 001, 002 y 003 a la base de datos SQLite
manteniendo compatibilidad total con bases de datos preexistentes.
"""

import os
import sqlite3

class MigrationManager:
    def __init__(self, db_path="audit_database.sqlite", sql_dir="sql"):
        self.db_path = db_path
        self.sql_dir = sql_dir

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_migration_table(self):
        with self.get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    migration_name TEXT UNIQUE,
                    applied_at TEXT
                )
            """)
            conn.commit()

    def apply_all_migrations(self):
        self.init_migration_table()
        if not os.path.exists(self.sql_dir):
            return []

        files = sorted([f for f in os.listdir(self.sql_dir) if f.endswith(".sql")])
        applied = []

        with self.get_connection() as conn:
            cursor = conn.cursor()
            for sql_file in files:
                cursor.execute("SELECT 1 FROM schema_migrations WHERE migration_name = ?", (sql_file,))
                if cursor.fetchone():
                    continue

                full_path = os.path.join(self.sql_dir, sql_file)
                with open(full_path, "r", encoding="utf-8") as f:
                    script = f.read()

                # Ejecución tolerante a columnas ya existentes
                statements = [s.strip() for s in script.split(";") if s.strip()]
                for st in statements:
                    try:
                        cursor.execute(st)
                    except sqlite3.OperationalError as e:
                        # Si la columna ya existe por migración previa, continuar
                        if "duplicate column name" in str(e).lower():
                            continue
                        raise e

                cursor.execute(
                    "INSERT INTO schema_migrations (migration_name, applied_at) VALUES (?, datetime('now'))",
                    (sql_file,)
                )
                conn.commit()
                applied.append(sql_file)

        return applied
