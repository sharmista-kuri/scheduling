import os, django
from time_conversion import time_str2int
from typing import List, Dict, Any

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CourseSchedulerBackend.settings")
django.setup()

from django.db import connection as dj_conn


def _get_connection():
    return dj_conn


def _dictfetchall(cur):
    cols = [c[0] for c in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


# ------------------------------------------------------------------#
# Faculty
# ------------------------------------------------------------------#
def list_faculty() -> List[Dict[str, Any]]:
    with _get_connection().cursor() as cur:
        cur.execute("SELECT * FROM Faculty;")
        return _dictfetchall(cur)


def get_faculty_profile(fid: int):
    with _get_connection().cursor() as cur:
        cur.execute("SELECT NAME, email FROM Faculty WHERE fid=%s;", (fid,))
        rows = _dictfetchall(cur)
        return rows[0] if rows else None


def update_faculty_profile(fid: int, name: str, email: str, password: str = None):
    with _get_connection().cursor() as cur:
        if password:
            cur.execute(
                "UPDATE Faculty SET NAME=%s, email=%s, PASSWORD=%s WHERE fid=%s;",
                (name, email, password, fid),
            )
        else:
            cur.execute(
                "UPDATE Faculty SET NAME=%s, email=%s WHERE fid=%s;",
                (name, email, fid),
            )
    return cur.rowcount


# ------------------------------------------------------------------#
# Comments
# ------------------------------------------------------------------#
def post_comment(crn: int, fid: int, text: str) -> int:
    with _get_connection().cursor() as cur:
        cur.execute(
            "INSERT INTO Comment (CRN,fid,comment_text,time_posted) "
            "VALUES (%s,%s,%s,NOW());",
            (crn, fid, text),
        )
        return cur.lastrowid


def list_comments(crn: int):
    with _get_connection().cursor() as cur:
        cur.execute(
            """
            SELECT c.cid, c.comment_text, c.time_posted,
                   f.NAME AS faculty_name, f.fid
            FROM Comment c
            JOIN Faculty f ON c.fid = f.fid
            WHERE c.CRN = %s
            ORDER BY c.time_posted DESC;
            """,
            (crn,),
        )
        return _dictfetchall(cur)


def _is_admin_or_owner(cur, cid: int, fid: int) -> str:
    cur.execute("SELECT fid FROM Comment WHERE cid=%s;", (cid,))
    row = cur.fetchone()
    if row is None:
        return "not-found"
    is_owner = int(row[0]) == int(fid)
    cur.execute("SELECT auth_level FROM Faculty WHERE fid=%s;", (fid,))
    is_admin = cur.fetchone()[0] == "admin"
    return "ok" if (is_owner or is_admin) else "not-authorized"


def edit_comment(cid: int, fid: int, text: str):
    with _get_connection().cursor() as cur:
        status = _is_admin_or_owner(cur, cid, fid)
        if status != "ok":
            return status
        cur.execute("UPDATE Comment SET comment_text=%s WHERE cid=%s;", (text, cid))
        return "updated"


def delete_comment(cid: int, fid: int):
    with _get_connection().cursor() as cur:
        status = _is_admin_or_owner(cur, cid, fid)
        if status != "ok":
            return status
        cur.execute("DELETE FROM Comment WHERE cid=%s;", (cid,))
        return "deleted"


# ------------------------------------------------------------------#
# Course CRUD & helpers
# ------------------------------------------------------------------#
def create_course(payload: Dict[str, Any]) -> int:
    # print("[DEBUG] delete request body:", payload)
    with _get_connection().cursor() as cur:
        cur.execute(
            """
            INSERT INTO Course (CRN,course_code,fid,NAME,duration,start_time,end_time,is_pinned)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s);
            """,
            (
                payload["crn"],
                payload["course_code"],
                payload["faculty_id"],
                payload["name"],
                payload["duration"],
                payload["start_time"],
                payload["end_time"],
                int(payload["is_pinned"]),
            ),
        )
        crn = payload["crn"]
        # Course_Days
        days_str = ",".join(payload.get("days", []))
        cur.execute(
            "INSERT INTO Course_Days (CRN, days) VALUES (%s, %s);", (crn, days_str)
        )

        # Prereqs
        # print("[DEBUG] delete request body:", payload["course_code"])
        # Resolve prereq CRNs to course codes
        crn_to_code = {}
        if payload.get("prereqs"):
            format_strings = ",".join(["%s"] * len(payload["prereqs"]))
            cur.execute(
                f"SELECT CRN, course_code FROM Course WHERE CRN IN ({format_strings})",
                payload["prereqs"],
            )
            crn_to_code = {row[0]: row[1] for row in cur.fetchall()}

        # Insert Prereqs using course codes
        for p in payload.get("prereqs", []):
            prereq_code = crn_to_code.get(p)
            if prereq_code:
                cur.execute(
                    "INSERT INTO Prereqs (prereq_course_code, course_code) VALUES (%s, %s);",
                    (prereq_code, payload["course_code"]),
                )

        # Coreqs

        for c in payload.get("coreqs", []):
            print("[DEBUG] Trying to insert coreq:", crn, c)
            cur.execute("INSERT INTO Coreqs (CRN1,CRN2) VALUES (%s,%s);", (crn, c))
    return crn


def list_courses():
    query = """
        SELECT c.CRN, c.course_code, c.NAME AS course_name, f.NAME AS faculty_name,
               f.fid AS faculty_id, c.start_time, c.end_time,
               c.duration, c.is_pinned, GROUP_CONCAT(cd.days) AS days
        FROM Course c
        JOIN Faculty f ON c.fid = f.fid
        LEFT JOIN Course_Days cd ON c.CRN = cd.CRN
        GROUP BY c.CRN;
    """
    with _get_connection().cursor() as cur:
        cur.execute(query)
        rows = _dictfetchall(cur)
        for r in rows:
            r["start_time"] = (
                time_str2int(str(r["start_time"])) if r["start_time"] else None
            )
            r["end_time"] = time_str2int(str(r["end_time"])) if r["end_time"] else None
        return rows


def get_course_relations(crn: int):
    out = {"prereqs": [], "coreqs": []}
    with _get_connection().cursor() as cur:
        cur.execute(
            """
            SELECT CRN2 FROM Coreqs WHERE CRN1 = %s
            UNION
            SELECT CRN1 FROM Coreqs WHERE CRN2 = %s;
        """,
            (crn, crn),
        )
        out["coreqs"] = [x[0] for x in cur.fetchall()]

        cur.execute(
            """
            SELECT prereq.CRN
            FROM Course c
            JOIN Prereqs p ON c.course_code = p.course_code
            JOIN Course prereq ON prereq.course_code = p.prereq_course_code
            WHERE c.CRN = %s;
            """,
            (crn,),
        )
        out["prereqs"] = [x[0] for x in cur.fetchall()]
    return out


def get_prereq_table():
    with _get_connection().cursor() as cur:
        cur.execute(
            """
            SELECT *
            FROM Prereqs
            """,
        )
        out = cur.fetchall()
    return out


def get_coreq_table():
    with _get_connection().cursor() as cur:
        cur.execute(
            """
            SELECT *
            FROM Coreqs
            """,
        )
        out = cur.fetchall()
    return out


def update_course(crn: int, patch: Dict[str, Any]):
    # print(f"[DEBUG] Updating course {crn} with patch: {patch}")
    fields, params = [], []
    mapping = {"name": "NAME", "faculty_id": "fid"}
    for k, v in patch.items():
        if k in ("days", "prereqs", "coreqs"):
            continue
        if k == "is_pinned":
            v = 1 if v else 0
        fields.append(f"{mapping.get(k, k)}=%s")
        params.append(v)
    params.append(crn)

    # print(fields, params)

    with _get_connection().cursor() as cur:
        if fields:
            cur.execute(f"UPDATE Course SET {', '.join(fields)} WHERE CRN=%s;", params)

        # Days
        if "days" in patch:
            cur.execute("DELETE FROM Course_Days WHERE CRN=%s;", (crn,))
            days_str = ",".join(patch.get("days", []))
            days_str = days_str.lstrip(",")  # ✅ removes any leading comma
            cur.execute(
                "INSERT INTO Course_Days (CRN,days) VALUES (%s,%s);", (crn, days_str)
            )

        # Prereqs
        if "prereqs" in patch:
            cur.execute(
                "SELECT course_code FROM Course WHERE CRN=%s;",
                (crn,),
            )
            code = patch.get("course_code") or cur.fetchone()[0]
            cur.execute("DELETE FROM Prereqs WHERE course_code=%s;", (code,))
            for crn_value in patch["prereqs"]:
                cur.execute(
                    "SELECT course_code FROM Course WHERE CRN=%s;", (crn_value,)
                )
                prereq_code_row = cur.fetchone()
                if prereq_code_row:  # only insert if valid
                    prereq_code = prereq_code_row[0]
                    cur.execute(
                        "INSERT INTO Prereqs (prereq_course_code, course_code) VALUES (%s, %s);",
                        (prereq_code, code),
                    )

        # Coreqs
        if "coreqs" in patch:
            cur.execute("DELETE FROM Coreqs WHERE CRN1=%s;", (crn,))
            for c in patch["coreqs"]:
                cur.execute("INSERT INTO Coreqs (CRN1,CRN2) VALUES (%s,%s);", (crn, c))

    return True


def delete_course(crn: int):
    with _get_connection().cursor() as cur:
        cur.execute("DELETE FROM Course_Days WHERE CRN=%s;", (crn,))
        cur.execute("DELETE FROM Comment WHERE CRN=%s;", (crn,))
        cur.execute("DELETE FROM Coreqs WHERE CRN1=%s OR CRN2=%s;", (crn, crn))
        cur.execute(
            """
            DELETE FROM Prereqs
            WHERE course_code = (SELECT course_code FROM Course WHERE CRN=%s);
            """,
            (crn,),
        )
        cur.execute("DELETE FROM Course WHERE CRN=%s;", (crn,))
    return True


# ------------------------------------------------------------------#
# Configuration
# ------------------------------------------------------------------#
def get_configuration(fid: int):
    query = """
        SELECT cfg.config_id,cfg.travel_time,
               GROUP_CONCAT(DISTINCT pd.days SEPARATOR ' ')  AS days,
               GROUP_CONCAT(DISTINCT pt.times) AS times
        FROM Configuration cfg
        JOIN Configured_by cb ON cfg.config_id=cb.config_id
        LEFT JOIN Preferred_Days pd ON cfg.config_id=pd.config_id
        LEFT JOIN Preferred_Start_Times pt ON cfg.config_id=pt.config_id
        WHERE cb.fid=%s
        GROUP BY cfg.config_id;
    """
    with _get_connection().cursor() as cur:
        cur.execute(query, (fid,))
        rows = _dictfetchall(cur)
        return rows[0] if rows else None


def save_configuration(fid: int, travel_time: int, days: list, times: list):
    with _get_connection().cursor() as cur:
        cur.execute(
            """
            INSERT INTO Configuration (config_id,travel_time)
            VALUES (%s,%s)
            ON DUPLICATE KEY UPDATE travel_time=%s;
            """,
            (fid, travel_time, travel_time),
        )

        cur.execute(
            "INSERT IGNORE INTO Configured_by (config_id,fid) VALUES (%s,%s);",
            (fid, fid),
        )

        cur.execute("DELETE FROM Preferred_Days WHERE config_id=%s;", (fid,))
        for d in days:
            cur.execute(
                "INSERT INTO Preferred_Days (config_id,days) VALUES (%s,%s);",
                (fid, d),
            )

        cur.execute("DELETE FROM Preferred_Start_Times WHERE config_id=%s;", (fid,))
        for t in times:
            cur.execute(
                "INSERT INTO Preferred_Start_Times (config_id,times) VALUES (%s,%s);",
                (fid, t),
            )
    return True


def load_possible_times(admin_fid):

    # print(admin_fid)

    config = get_configuration(admin_fid)

    time_strings = config["times"].split(",")
    times = [time_str2int(time[:-3]) for time in time_strings]
    # print(times)

    times.sort()

    day_strings = config["days"].split(" ")
    days = [day.split(",") for day in day_strings]

    single_days = [day for day in days if len(day) == 1]
    other_days = [day for day in days if len(day) != 1]

    # print(single_days, other_days)

    # print(times)

    # patterns_80 = [["M", "W"], ["T", "TH"]]
    set_80 = [(p, t) for t in times for p in other_days]

    # patterns_other = [["F"], ["W"], ["TH"]]
    set_other = [(p, t) for t in times for p in single_days]

    # print(set_80, set_other)

    return set_80, set_other, config["travel_time"]
