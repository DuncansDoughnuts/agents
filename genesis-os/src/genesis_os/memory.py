from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any


class MemoryStore:
    def __init__(self, path: str | Path = ":memory:") -> None:
        self.conn = sqlite3.connect(str(path))
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS episodes ("
            "run_id TEXT, capability TEXT, success INTEGER, score REAL, payload TEXT)"
        )
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS procedures ("
            "signature TEXT PRIMARY KEY, successes INTEGER NOT NULL, procedure TEXT NOT NULL)"
        )
        self.conn.commit()

    def remember_episode(
        self,
        run_id: str,
        capability: str,
        success: bool,
        score: float,
        payload: Any,
    ) -> None:
        self.conn.execute(
            "INSERT INTO episodes VALUES (?, ?, ?, ?, ?)",
            (run_id, capability, int(success), score, json.dumps(payload, default=str)),
        )
        self.conn.commit()

    def episodes(self, capability: str | None = None) -> list[dict[str, Any]]:
        if capability:
            rows = self.conn.execute(
                "SELECT run_id, capability, success, score, payload "
                "FROM episodes WHERE capability=?",
                (capability,),
            ).fetchall()
        else:
            rows = self.conn.execute(
                "SELECT run_id, capability, success, score, payload FROM episodes"
            ).fetchall()
        return [
            {
                "run_id": row[0],
                "capability": row[1],
                "success": bool(row[2]),
                "score": row[3],
                "payload": json.loads(row[4]),
            }
            for row in rows
        ]

    def record_procedure_success(self, signature: str, procedure: list[str]) -> int:
        row = self.conn.execute(
            "SELECT successes FROM procedures WHERE signature=?",
            (signature,),
        ).fetchone()
        if row:
            successes = int(row[0]) + 1
            self.conn.execute(
                "UPDATE procedures SET successes=? WHERE signature=?",
                (successes, signature),
            )
        else:
            successes = 1
            self.conn.execute(
                "INSERT INTO procedures(signature, successes, procedure) VALUES (?, ?, ?)",
                (signature, successes, json.dumps(procedure)),
            )
        self.conn.commit()
        return successes
