from django.shortcuts import render

# Create your views here.
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password
from django.contrib.auth.hashers import make_password
from algorithm import generate_conflict_numbers, schedule_courses
from django.core.files.storage import default_storage
from import_csv import *
from django.db import connection
from time_conversion import time_int2str
import json

from database_requests import (
    list_faculty,
    get_faculty_profile,
    update_faculty_profile,
    post_comment,
    list_comments,
    edit_comment,
    delete_comment,
    list_courses,
    create_course,
    update_course,
    delete_course,
    get_course_relations,
    get_configuration,
    save_configuration,
    load_possible_times,
)


@csrf_exempt
def upload_csv_view(request):
    if request.method == "POST" and request.FILES.get("csvFile"):
        file = request.FILES["csvFile"]
        path = default_storage.save(f"temp/{file.name}", file)
        csv_path = os.path.join(default_storage.location, path)

        try:
            main(csv_path)
            return JsonResponse(
                {"success": True, "message": "CSV uploaded and processed."}
            )
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "No file uploaded."}, status=400)


@csrf_exempt
def run_scheduler(request):
    if request.method == "POST":
        try:
            course_list = generate_conflict_numbers()
            output_log, course_list = schedule_courses(course_list)

            result = [
                {
                    "crn": c.crn,
                    "code": c.course_code,
                    "days": c.days,
                    "start_time": time_int2str(c.start_time),
                    "end_time": time_int2str(c.end_time),
                }
                for c in course_list
            ]

            # print(course_list)

            return JsonResponse({"success": True, "courses": result, "log": output_log})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Only POST allowed"})


# ------------------- FACULTY LOGIN -------------------


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT fid, email, password, name, auth_level FROM Faculty WHERE email = %s",
                [email],
            )
            row = cursor.fetchone()

        if row:
            fid, db_email, db_password, name, role = row
            if check_password(password, db_password):
                return JsonResponse({"role": role, "fid": fid, "name": name})
            else:
                return JsonResponse({"message": "Invalid password"}, status=401)
        else:
            return JsonResponse({"message": "User not found"}, status=401)


# ------------------- FACULTY SIGNUP -------------------
@csrf_exempt
def signup_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        auth_level = data.get("auth_level", "faculty")

        if not name or not email or not password:
            return JsonResponse({"message": "Missing fields"}, status=400)

        # Check if email exists
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Faculty WHERE email = %s", [email])
            if cursor.fetchone():
                return JsonResponse({"message": "Email already registered"}, status=400)

        # Hash the password
        hashed_password = make_password(password)

        # Insert the new faculty
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO Faculty (name, email, password, auth_level) VALUES (%s, %s, %s, %s)",
                [name, email, hashed_password, auth_level],
            )

        return JsonResponse({"message": "Signup successful"})


# ------------------- CHANGE PASSOWRD -------------------


@csrf_exempt
def change_password(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "message": "POST required"}, status=405)

    data = json.loads(request.body)
    user_id = data.get("user_id")
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not user_id or not old_password or not new_password:
        return JsonResponse({"success": False, "message": "Missing fields"}, status=400)

    try:
        with connection.cursor() as cursor:
            # Fetch current hashed password
            cursor.execute("SELECT PASSWORD FROM Faculty WHERE fid = %s", [user_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse(
                    {"success": False, "message": "Faculty not found"}, status=404
                )

            current_hashed = row[0]
            if not check_password(old_password, current_hashed):
                return JsonResponse(
                    {"success": False, "message": "Old password is incorrect"},
                    status=401,
                )

            # Hash new password
            new_hashed = make_password(new_password)

            # Update password
            cursor.execute(
                "UPDATE Faculty SET PASSWORD = %s WHERE fid = %s", [new_hashed, user_id]
            )

        return JsonResponse(
            {"success": True, "message": "Password updated successfully"}
        )

    except Exception as e:
        return JsonResponse(
            {"success": False, "message": f"Error: {str(e)}"}, status=500
        )


# ------------------- FACULTY -------------------


@csrf_exempt
def total_counts(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Faculty")
        faculty_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Course")
        course_count = cursor.fetchone()[0]

    return JsonResponse(
        {
            "faculty_count": faculty_count,
            "course_count": course_count,
        }
    )


def faculty_list_view(request):
    return JsonResponse(list_faculty(), safe=False)


@csrf_exempt
def courses_by_faculty(request, fid):

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT count(*) as numberofcourses
            FROM Course
            WHERE fid = %s
        """,
            (fid,),
        )
        course_count = cursor.fetchone()[0]
        print(course_count)

    return JsonResponse(
        {
            "course_count": course_count,
        }
    )


def faculty_list_view(request):
    return JsonResponse(list_faculty(), safe=False)


@csrf_exempt
def faculty_create_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        auth_level = data.get("auth_level")
        # print(auth_level);
        if not name or not email or not password:
            return JsonResponse(
                {"success": False, "message": "Missing fields"}, status=400
            )

        # Check if email already exists
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM Faculty WHERE email = %s", [email])
            if cursor.fetchone():
                return JsonResponse(
                    {"success": False, "message": "Email already exists"}, status=400
                )

            hashed_password = make_password(password)
            cursor.execute(
                "INSERT INTO Faculty (name, email, password, auth_level) VALUES (%s, %s, %s, %s)",
                [name, email, hashed_password, auth_level],
            )

        return JsonResponse({"success": True, "message": "Faculty created"})

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


@csrf_exempt
def faculty_all_update_view(request, fid):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "message": "POST method required"}, status=405
        )

    try:
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")  # Optional
        auth_level = data.get("auth_level")  # Optional
        if not name or not email:
            return JsonResponse(
                {"success": False, "message": "Missing fields"}, status=400
            )

        with connection.cursor() as cursor:
            if password and auth_level:
                hashed_password = make_password(password)
                cursor.execute(
                    "UPDATE Faculty SET name=%s, email=%s, password=%s, auth_level=%s WHERE fid=%s",
                    [name, email, hashed_password, auth_level, fid],
                )
            elif password:
                hashed_password = make_password(password)
                cursor.execute(
                    "UPDATE Faculty SET name=%s, email=%s, password=%s WHERE fid=%s",
                    [name, email, hashed_password, fid],
                )
            elif auth_level:
                cursor.execute(
                    "UPDATE Faculty SET name=%s, email=%s, auth_level=%s WHERE fid=%s",
                    [name, email, auth_level, fid],
                )
            else:
                cursor.execute(
                    "UPDATE Faculty SET name=%s, email=%s WHERE fid=%s",
                    [name, email, fid],
                )

            updated = cursor.rowcount

        return JsonResponse(
            {
                "success": True,
                "message": "Faculty updated successfully",
                "updated": updated,
            }
        )

    except Exception as e:
        return JsonResponse(
            {"success": False, "message": f"Server error: {str(e)}"}, status=500
        )


@csrf_exempt
def faculty_delete_view(request, fid):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)

    try:
        with connection.cursor() as cursor:
            # Delete related comments
            cursor.execute("DELETE FROM Comment WHERE fid = %s", [fid])

            # Delete related configurations (optional)
            cursor.execute("DELETE FROM Preferred_Days WHERE config_id = %s", [fid])
            cursor.execute(
                "DELETE FROM Preferred_Start_Times WHERE config_id = %s", [fid]
            )
            cursor.execute("DELETE FROM Configured_by WHERE fid = %s", [fid])
            cursor.execute("DELETE FROM Configuration WHERE config_id = %s", [fid])

            # Delete courses taught by this faculty (and cascade course-related cleanup)
            cursor.execute("SELECT CRN FROM Course WHERE fid = %s", [fid])
            course_crns = cursor.fetchall()
            for (crn,) in course_crns:
                # Delete course using your helper (which cascades)
                from database_requests import delete_course

                delete_course(crn)

            # Delete the faculty record last
            cursor.execute("DELETE FROM Faculty WHERE fid = %s", [fid])

        return JsonResponse(
            {"success": True, "message": "Faculty and associated data deleted"}
        )

    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)


def faculty_profile_view(request, fid):
    profile = get_faculty_profile(fid)
    if profile:
        return JsonResponse(profile)
    return JsonResponse({"error": "Faculty not found"}, status=404)


@csrf_exempt
def faculty_update_view(request, fid):
    if request.method != "POST":
        return JsonResponse(
            {"success": False, "message": "POST method required"}, status=405
        )

    try:
        data = json.loads(request.body)
        name = data.get("name")
        email = data.get("email")

        if not name or not email:
            return JsonResponse(
                {"success": False, "message": "Missing fields"}, status=400
            )

        updated = update_faculty_profile(fid, name, email)
        return JsonResponse(
            {
                "success": True,
                "message": "Profile updated successfully",
                "updated": updated,
            }
        )

    except Exception as e:
        return JsonResponse(
            {"success": False, "message": f"Server error: {str(e)}"}, status=500
        )


# ------------------- COMMENTS -------------------


@csrf_exempt
def comment_post_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    cid = post_comment(data["crn"], data["fid"], data["text"])
    return JsonResponse({"cid": cid})


@csrf_exempt
def comment_list_view(request, crn):
    return JsonResponse(list_comments(crn), safe=False)


@csrf_exempt
def comment_edit_view(request, cid):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    status = edit_comment(cid, data["fid"], data["text"])
    return JsonResponse({"status": status})


@csrf_exempt
def comment_delete_view(request, cid):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    # print("[DEBUG] delete request body:", data)
    status = delete_comment(cid, data["fid"])
    return JsonResponse({"status": status})


# ------------------- COURSES -------------------
@csrf_exempt
def course_list_view(request):
    return JsonResponse(list_courses(), safe=False)


@csrf_exempt
def course_create_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    crn = create_course(data)
    return JsonResponse({"crn": crn})


@csrf_exempt
def course_update_view(request, crn):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    patch = json.loads(request.body)
    update_course(crn, patch)
    return JsonResponse({"status": "updated"})


@csrf_exempt
def course_delete_view(request, crn):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)
    delete_course(crn)
    return JsonResponse({"status": "deleted"})


@csrf_exempt
def course_relation_view(request, crn):
    return JsonResponse(get_course_relations(crn))


@csrf_exempt
def get_courses_by_crns(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        crns = data.get("crns", [])
        if not isinstance(crns, list) or not crns:
            return JsonResponse({"error": "Invalid or empty CRNs list"}, status=400)

        placeholders = ",".join(["%s"] * len(crns))
        with connection.cursor() as cur:
            cur.execute(
                f"SELECT CRN, course_code, NAME AS course_name FROM Course WHERE CRN IN ({placeholders})",
                crns,
            )
            rows = [
                dict(zip([col[0] for col in cur.description], row))
                for row in cur.fetchall()
            ]
        return JsonResponse(rows, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ------------------- CONFIGURATION -------------------
@csrf_exempt
def configuration_view(request, fid):
    cfg = get_configuration(fid)
    return JsonResponse(cfg if cfg else {}, safe=False)


@csrf_exempt
def configuration_save_view(request, fid):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    data = json.loads(request.body)
    ok = save_configuration(fid, data["travel_time"], data["days"], data["times"])
    return JsonResponse({"status": "saved" if ok else "error"})


@csrf_exempt
def possible_times_view(request):
    return JsonResponse(load_possible_times(), safe=False)


@csrf_exempt
def list_configurations(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET required"}, status=405)

    result = []

    with connection.cursor() as cursor:
        cursor.execute("SELECT config_id, travel_time FROM Configuration")
        configs = cursor.fetchall()

        for config_id, travel_time in configs:
            cursor.execute(
                "SELECT days FROM Preferred_Days WHERE config_id = %s", [config_id]
            )
            days = [row[0] for row in cursor.fetchall()]

            cursor.execute(
                "SELECT times FROM Preferred_Start_Times WHERE config_id = %s",
                [config_id],
            )
            times = [str(row[0]) for row in cursor.fetchall()]

            result.append(
                {
                    "config_id": config_id,
                    "travel_time": travel_time,
                    "days": days,
                    "times": times,
                }
            )

    return JsonResponse(result, safe=False)


@csrf_exempt
def create_configuration(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)
    travel_time = data.get("travel_time", 0)
    days = data.get("days", [])
    times = data.get("times", [])

    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO Configuration (travel_time) VALUES (%s)", [travel_time]
        )
        cursor.execute("SELECT LAST_INSERT_ID()")
        config_id = cursor.fetchone()[0]

        for day in days:
            cursor.execute(
                "INSERT INTO Preferred_Days (config_id, days) VALUES (%s, %s)",
                [config_id, day],
            )

        for t in times:
            cursor.execute(
                "INSERT INTO Preferred_Start_Times (config_id, times) VALUES (%s, %s)",
                [config_id, t],
            )

    return JsonResponse({"message": "Created", "config_id": config_id})


@csrf_exempt
def update_configuration(request, config_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT required"}, status=405)

    data = json.loads(request.body)
    travel_time = data.get("travel_time", 0)
    days = data.get("days", [])
    times = data.get("times", [])

    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE Configuration SET travel_time = %s WHERE config_id = %s",
            [travel_time, config_id],
        )

        cursor.execute("DELETE FROM Preferred_Days WHERE config_id = %s", [config_id])
        for day in days:
            cursor.execute(
                "INSERT INTO Preferred_Days (config_id, days) VALUES (%s, %s)",
                [config_id, day],
            )

        cursor.execute(
            "DELETE FROM Preferred_Start_Times WHERE config_id = %s", [config_id]
        )
        for t in times:
            cursor.execute(
                "INSERT INTO Preferred_Start_Times (config_id, times) VALUES (%s, %s)",
                [config_id, t],
            )

    return JsonResponse({"message": "Updated"})


@csrf_exempt
def delete_configuration(request, config_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE required"}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM Preferred_Days WHERE config_id = %s", [config_id])
        cursor.execute(
            "DELETE FROM Preferred_Start_Times WHERE config_id = %s", [config_id]
        )
        cursor.execute("DELETE FROM Configured_by WHERE config_id = %s", [config_id])
        cursor.execute("DELETE FROM Configuration WHERE config_id = %s", [config_id])

    return JsonResponse({"message": "Deleted"})
