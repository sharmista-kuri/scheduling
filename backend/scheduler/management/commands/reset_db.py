from django.core.management.base import BaseCommand
from pathlib import Path
from django.db import connection as dj_conn
from django.conf import settings

SQL_FILE = Path(settings.BASE_DIR, "Milestone2CreateTable.sql")


class Command(BaseCommand):
    help = "Drops and recreates all Milestone‑2 tables."

    def handle(self, *args, **opts):
        drops = [
            "DROP TABLE IF EXISTS Preferred_Start_Times;",
            "DROP TABLE IF EXISTS Preferred_Days;",
            "DROP TABLE IF EXISTS Configured_by;",
            "DROP TABLE IF EXISTS Configuration;",
            "DROP TABLE IF EXISTS Comment;",
            "DROP TABLE IF EXISTS Prereqs;",
            "DROP TABLE IF EXISTS Coreqs;",
            "DROP TABLE IF EXISTS Conflict_no;",
            "DROP TABLE IF EXISTS Course_Days;",
            "DROP TABLE IF EXISTS Course;",
            "DROP TABLE IF EXISTS Faculty;",
        ]

        # Read and split the file once
        creates = [
            stmt.strip().rstrip(";")
            for stmt in SQL_FILE.read_text().split(";")
            if stmt.strip() and not stmt.lstrip().upper().startswith("DROP")
        ]

        with dj_conn.cursor() as cur:
            for stmt in drops:
                cur.execute(stmt)
            for stmt in creates:
                cur.execute(stmt + ";")  

        self.stdout.write(self.style.SUCCESS("Database reset"))
