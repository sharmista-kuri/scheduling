import os, django, csv
from typing import List, Dict, Any
from Course import Course

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CourseSchedulerBackend.settings")
django.setup()

from django.db import connection as dj_conn


def _get_connection():
    return dj_conn


# ---------------------------------------------------------------------------#
#  0.  Build Course objects from registrar CSV
# ---------------------------------------------------------------------------#


def build_course_objects(csv_path: str) -> List[Course]:
    # 1. Build a faculty‑name ➜ fid map once
    with _get_connection().cursor() as cur:
        cur.execute("SELECT fid, NAME FROM Faculty;")
        fid_map = {name: fid for fid, name in cur.fetchall()}

    courses: List[Course] = []

    with open(csv_path, newline="") as fh:
        rdr = csv.reader(fh)
        next(rdr)  # skip header row

        for row in rdr:
            crn = int(row[0].strip())
            code = row[1].strip()
            faculty_name = row[2].split(".")[0].strip()

            # Look up fid; default to None (upsert_courses will insert Faculty if missing)
            fid = fid_map.get(faculty_name)

            is_pinned = "FALSE"

            c = Course(crn=crn, course_code=code)
            c.fid = fid  # may be None
            c.faculty_name = faculty_name  # needed by upsert_courses
            c.NAME = faculty_name  # display name, matches schema
            c.duration = 80  # default
            c.start_time = None
            c.end_time = None
            c.days = []  # ignored for now
            c.is_pinned = is_pinned

            courses.append(c)

    return courses


# ---------------------------------------------------------------------------#
#  1. Faculty
# ---------------------------------------------------------------------------#
def upsert_faculty(faculty: List[Dict[str, Any]]):
    """
    faculty  = [{'fid': 1, 'name': 'Prof A', 'auth_level':'admin',
                 'email':'a@x.com', 'password':'hash'}, ...]
    """
    if not faculty:
        return
    conn = _get_connection()
    cur = conn.cursor()
    sql = """
        INSERT INTO Faculty (fid, NAME, auth_level, email, PASSWORD)
        VALUES (%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
            NAME = VALUES(NAME),
            auth_level = VALUES(auth_level),
            email = VALUES(email),
            PASSWORD = VALUES(PASSWORD)
    """
    cur.executemany(
        sql,
        [
            (
                f["fid"],
                f["name"],
                f.get("auth_level", "user"),
                f["email"],
                f.get("password", ""),
            )
            for f in faculty
        ],
    )
    conn.commit()
    cur.close()
    conn.close()


# ---------------------------------------------------------------------------#
#  2. Course  & 3. Course_Days
# ---------------------------------------------------------------------------#
def upsert_courses(course_objs: List[Course]):
    if not course_objs:
        return
    conn = _get_connection()
    cur = conn.cursor()

    # ensure Faculty rows exist (by name)
    for c in course_objs:
        cur.execute(
            "INSERT IGNORE INTO Faculty (NAME, auth_level, email) VALUES (%s,'user',%s);",
            (c.faculty_name, f"{c.faculty_name.replace(' ','').lower()}@example.com"),
        )
    cur.execute("SELECT fid, NAME FROM Faculty;")
    fid_map = {name: fid for fid, name in cur.fetchall()}

    # Check if course exists, if so, update it. Otherwise, insert it
    # for c in course_objs:
    #     sql = """
    #     SELECT CRN FROM Course WHERE CRN=%s;
    #     """
    #     data = c.crn
    #     cur.execute(sql, data)

    sql = """
        INSERT INTO Course
         (CRN, course_code, fid, NAME, duration, start_time, end_time, is_pinned)
        VALUES
         (%s,%s,%s,%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
         course_code = VALUES(course_code),
         fid         = VALUES(fid),
         NAME        = VALUES(NAME),
         duration    = VALUES(duration),
         start_time  = VALUES(start_time),
         end_time    = VALUES(end_time),
         is_pinned   = VALUES(is_pinned)
    """
    data = [
        (
            c.crn,
            c.course_code,
            fid_map[c.faculty_name],
            c.course_code,
            c.duration,
            c.start_time,
            c.end_time,
            c.is_pinned,
        )
        for c in course_objs
    ]
    cur.executemany(sql, data)

    # overwrite Course_Days
    cur.execute("DELETE FROM Course_Days;")
    cur.executemany(
        "INSERT INTO Course_Days (CRN,days) VALUES (%s,%s);",
        [(c.crn, d) for c in course_objs for d in c.days],
    )

    conn.commit()
    cur.close()
    conn.close()


# ---------------------------------------------------------------------------#
#  4. Conflict_no   (list[(course_code, conflict_no)])
# ---------------------------------------------------------------------------#
def upsert_conflict_no(rows: List[tuple]):
    if rows:
        conn = _get_connection()
        cur = conn.cursor()
        cur.execute("TRUNCATE Conflict_no;")
        cur.executemany(
            "INSERT INTO Conflict_no (course_code, conflict_no) VALUES (%s,%s);", rows
        )
        conn.commit()
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------#
#  5. Coreqs   (list[(CRN1, CRN2)])
# ---------------------------------------------------------------------------#
def upsert_coreqs(rows: List[tuple]):
    if rows:
        conn = _get_connection()
        cur = conn.cursor()
        cur.execute("TRUNCATE Coreqs;")
        cur.executemany("INSERT INTO Coreqs (CRN1,CRN2) VALUES (%s,%s);", rows)
        conn.commit()
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------#
#  6. Prereqs   (list[(prereq_course_code, course_code)])
# ---------------------------------------------------------------------------#
def upsert_prereqs(rows: List[tuple]):
    if rows:
        conn = _get_connection()
        cur = conn.cursor()
        cur.execute("TRUNCATE Prereqs;")
        cur.executemany(
            "INSERT INTO Prereqs (prereq_course_code, course_code) VALUES (%s,%s);",
            rows,
        )
        conn.commit()
        cur.close()
        conn.close()


# ---------------------------------------------------------------------------#
#  7. Comment
# ---------------------------------------------------------------------------#
def upsert_comments(comments: List[Dict[str, Any]]):
    """
    comments = [{'cid':1,'CRN':10001,'fid':2,'text':'Hi','time':'2025-05-03 09:00:00'},...]
    """
    if not comments:
        return
    conn = _get_connection()
    cur = conn.cursor()
    sql = """
        INSERT INTO Comment (cid, CRN, fid, time_posted, comment_text)
        VALUES (%s,%s,%s,%s,%s)
        ON DUPLICATE KEY UPDATE
            comment_text = VALUES(comment_text),
            time_posted  = VALUES(time_posted)
    """
    cur.executemany(
        sql, [(c["cid"], c["CRN"], c["fid"], c["time"], c["text"]) for c in comments]
    )
    conn.commit()
    cur.close()
    conn.close()


# ---------------------------------------------------------------------------#
#  8. Configuration, 9. Configured_by,
# 10. Preferred_Days, 11. Preferred_Start_Times
# ---------------------------------------------------------------------------#
def upsert_configuration(cfg_rows: List[Dict[str, Any]]):
    """
    cfg_rows = [{'config_id':1,'travel_time':10,
                 'fid':2,'days':['M','W'],'times':['08:00:00','09:30:00']}, ...]
    """
    if not cfg_rows:
        return
    conn = _get_connection()
    cur = conn.cursor()

    conf_sql = """
        INSERT INTO Configuration (config_id, travel_time)
        VALUES (%s,%s)
        ON DUPLICATE KEY UPDATE travel_time = VALUES(travel_time)
    """
    pref_day_sql = "INSERT IGNORE INTO Preferred_Days (config_id,days) VALUES (%s,%s);"
    pref_time_sql = (
        "INSERT IGNORE INTO Preferred_Start_Times (config_id,times) VALUES (%s,%s);"
    )
    conf_by_sql = """
        INSERT IGNORE INTO Configured_by (config_id,fid) VALUES (%s,%s);
    """

    for row in cfg_rows:
        cur.execute(conf_sql, (row["config_id"], row.get("travel_time", 0)))
        for d in row.get("days", []):
            cur.execute(pref_day_sql, (row["config_id"], d))
        for t in row.get("times", []):
            cur.execute(pref_time_sql, (row["config_id"], t))
        cur.execute(conf_by_sql, (row["config_id"], row["fid"]))

    conn.commit()
    cur.close()
    conn.close()


# ---------------------------------------------------------------------------#
#  Master seeder
# ---------------------------------------------------------------------------#
def main(
    csv_path: str,
    prereqs: List[tuple] = None,
    coreqs: List[tuple] = None,
    conflict_rows: List[tuple] = None,
    faculty_seed: List[Dict[str, Any]] = None,
    comment_seed: List[Dict[str, Any]] = None,
    config_seed: List[Dict[str, Any]] = None,
):
    """Call with whatever starter data we have."""
    if faculty_seed:
        upsert_faculty(faculty_seed)

    courses = build_course_objects(csv_path)
    upsert_courses(courses)

    upsert_prereqs(prereqs or [])
    upsert_coreqs(coreqs or [])
    upsert_conflict_no(conflict_rows or [])
    upsert_comments(comment_seed or [])
    upsert_configuration(config_seed or [])

    print("All 11 tables seeded/refreshed.")


if __name__ == "__main__":
    import sys, json, pathlib

    if len(sys.argv) < 2:
        print("Usage: python import_csv.py <csv_path>")
        sys.exit(1)
    main(sys.argv[1])
