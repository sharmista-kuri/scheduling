from database_requests import *
from time_conversion import *
from graph import *
from Course import *
from import_csv import *
import random


def group_coreqs(coreq_list):
    """
    Input: List of coreq tuples

    Output: List of lists where all coreqs are grouped together
    """
    # Hashmap of current groupings
    groupings = {}
    # Current index for groupings
    index = 0
    # Intermediarry hashmap to track indexies of crns
    group_index = {}
    for course1, course2 in coreq_list:
        # If both courses don't have a group already, start a new list with both of them
        if course1 not in group_index and course2 not in group_index:
            group_index[course1] = index
            group_index[course2] = index
            groupings[index] = [course1, course2]
            index += 1
        # If course1 is in a group but course2 isn't, add course2 to course1's group
        elif course1 in group_index and course2 not in group_index:
            group_index[course2] = group_index[course1]
            groupings[group_index[course1]].append(course2)
        # If course2 is in a group but course1 isn't, add course1 to course2's group
        elif course2 in group_index and course1 not in group_index:
            group_index[course1] = group_index[course2]
            groupings[group_index[course2]].append(course1)

    # Return just the lists of grouped values
    return list(groupings.values())


def group_faculty(courses):
    """
    Input: List of courses

    Output: List of lists where each list contains courses with the same faculty
    """
    # Hashmap of current groupings
    groupings = {}

    for crn, course in courses.items():
        if course.fid not in groupings:
            groupings[course.fid] = []
        groupings[course.fid].append(course)

    # Return just the lists of grouped values
    return list(groupings.values())


def generate_conflict_numbers():
    """
    Step 1 of the algorithm, will generate all the conflict numbers to be used for scheduling. Returns list of course objects with populated conflict_numbers.
    """
    # Initialize conflict number counter
    current_conflict_number = 0
    # Load in all courses and create a hashmap mapping from course_code to list of Course objects with crn's corresponding to that code
    # Load all course tuples from database
    all_courses = list_courses()
    code_object_map, crn_object_map = get_course_map(all_courses)
    # Get the prereq information for generating graphs
    prereq_list = get_prereq_table()
    # Generate the graphs for both directions
    backward_graph = generate_graph(prereq_list)
    forward_graph = reverse_graph(backward_graph)
    # Get the depths for the forwards and backwards graph traversals
    backward_depths = calculate_depths(backward_graph)
    forward_depths = calculate_depths(forward_graph)

    # STEP 1 PART 1: DEPTH TRAVERSAL

    # Iterate over backwards depths and add conflict number to all courses with the same depth
    for depth, courses in backward_depths.items():
        for course in courses:
            # Skip courses not important to major
            if course not in code_object_map:
                continue
            # Get all courses with this course code from the mapping
            same_code_courses = code_object_map[course]
            for same_code_course_object in same_code_courses:
                # Give the course the current conflict number
                same_code_course_object.conflict_numbers.add(current_conflict_number)
        # Increment the global conflict number counter
        current_conflict_number += 1
    # Iterate over forward depths and add conflict number to all courses with the same depth
    for depth, courses in forward_depths.items():
        for course in courses:
            # Skip courses not important to major
            if course not in code_object_map:
                continue
            # Get all courses with this course code from the mapping
            same_code_courses = code_object_map[course]
            for same_code_course_object in same_code_courses:
                # Give the course the current conflict number
                same_code_course_object.conflict_numbers.add(current_conflict_number)
        # Increment the global conflict number counter
        current_conflict_number += 1

    # STEP 1 PART 2: FACULTY GROUPING

    # Load in the courses taught grouped by faculty teaching the course
    faculty_groups = group_faculty(crn_object_map)
    # Data is preformatted for faculty, simply add entire list to same group
    for group in faculty_groups:
        for course in group:
            # Make faculty conflict numbers negative to differentiate them
            course.conflict_numbers.add(-current_conflict_number)
        current_conflict_number += 1

    # STEP 1 PART 3: COREQ MERGING

    # Load in all coreq data
    coreq_list = get_coreq_table()
    # Merge CRN's into groups based on all courses that share a coreq
    coreq_groups = group_coreqs(coreq_list)

    for group in coreq_groups:
        # Set to construct new conflict lists
        new_conflict_list = set()
        # Add all conflict numbers from courses in the group to the new conflict list set
        for crn in group:
            course_object = crn_object_map[crn]
            new_conflict_list = new_conflict_list | course_object.conflict_numbers
        # Update all courses in group to the new set
        for crn in group:
            course_object = crn_object_map[crn]
            course_object.conflict_numbers = new_conflict_list

    # print(list(crn_object_map.values()))
    return list(crn_object_map.values())


def is_conflict_overlap(
    course, proposed_start_time, days, travel_time=0, conflict_override=0
):
    """
    Input: Course object, a start time to check if valid, list of days to check

    Output: True if the proposed start time is invalid, which means there is a conflict. False if no conflict
    """
    global conflict_table

    proposed_end_time = proposed_start_time + course.duration
    overlap_count = 0

    valid_days = set()

    for day in days:
        conflict_day = conflict_table[day]
        # Iterate over every conflict number in the course
        for conflict_number in course.conflict_numbers:
            # Check that conflict number is in the conflict table
            if conflict_number not in conflict_day:
                continue
            # Get each time already reserved for the given conflict number on the given day
            for time in conflict_day[conflict_number]:
                # Logic to check for time overlap, add 1 to the conflict count
                if not (
                    proposed_start_time - travel_time >= time[1]
                    or time[0] >= proposed_end_time + travel_time
                ):
                    # Only allow conflict overlaps on non-faculty related conflict numbers
                    if conflict_number > 0:
                        overlap_count += 1
                    # If the number of overlaps is greater than the maximum allowed, return True for conflict
                    if overlap_count > conflict_override:
                        valid_days.add(day)
                        if valid_days == set(days):
                            return True
    # At this point, all potential conflicts have been checked and there wasn't an overlap
    return False


def conflict_table_update(conflict_numbers, day, time):
    """
    Input: A list of conflict numbers to update, a day as a string and a time tuple (start_time, end_time) to insert into the conflict table

    Output: None, but the global conflict table will be updated
    """
    global conflict_table
    for conflict_number in conflict_numbers:
        if conflict_number not in conflict_table[day]:
            conflict_table[day][conflict_number] = []
        conflict_table[day][conflict_number].append(time)


def schedule_courses(course_list, seed, admin_fid):
    """
    Input: List of course objects to be scheduled

    Output: Updated list of course objects with start and end times populated
    """

    # Initialize conflict table
    """
    Conflict table has a dictionary for each day of the week, and those internal dictionaries will have key value pairs of conflict_number to list of time tuples that are already occupied by that number
    """
    global conflict_table
    # Make a copy for debug printing
    course_copy = []
    for course in course_list:
        course_copy.append(course)

    # Shuffle list based on seed for randomness
    random.seed(seed)
    random.shuffle(course_list)

    conflict_table = {"M": {}, "T": {}, "W": {}, "TH": {}, "F": {}}

    output_log = ""

    possible_times_80, possible_times_other, travel_time = load_possible_times(
        admin_fid
    )

    # STEP 2 PART 1: PLACE ALL PINNED COURSES INTO SCHEDULE

    for course in course_list:
        # Filter out non-pinned courses
        if not course.is_pinned:
            continue

        # Check for potential pinned course overlap
        if is_conflict_overlap(course, course.start_time, course.days, travel_time):
            output_log += (
                "Error: Pinned course produces overlap conflict, course scheduled\n"
            )
        # Update the conflict table
        for day in course.days:
            conflict_table_update(
                course.conflict_numbers, day, (course.start_time, course.end_time)
            )
        course_list.remove(course)

    # print(conflict_table)

    # STEP 2 PART 2: PLACE ALL UNPINNED COURSES INTO SCHEDULE

    # Try to schedule classes allowing more and more conflict overlap until all courses scheduled
    overlap_allowed = 0
    while len(course_list) != 0:
        for course in course_list:
            # Filter out pinned courses
            if course.is_pinned:
                continue

            scheduled = False

            if course.duration == 80:
                possible_times = possible_times_80
            else:
                possible_times = possible_times_other

            for days, time in possible_times:
                # Check for course overlap at proposed time. If there is overlap, continue to next potential time
                if is_conflict_overlap(
                    course, time, days, travel_time, overlap_allowed
                ):
                    continue

                # At this point the course is valid to be scheduled
                for day in days:
                    conflict_table_update(
                        course.conflict_numbers, day, (time, time + course.duration)
                    )
                course.schedule_course(days, time)
                scheduled = True
                break

            if not scheduled:
                output_log += f"Error scheduling {course.crn}\n"
            else:
                course_list.remove(course)
        overlap_allowed += 1

    # print(conflict_table)
    # print(course_list)

    # for course in course_copy:
    #     output_log += str(course)

    update_db(course_copy)
    # upsert_courses(course_copy)

    return output_log, course_copy


def update_db(courses):
    for course in courses:
        patch = {
            "days": course.days,
            "start_time": time_int2str(course.start_time),
            "end_time": time_int2str(course.end_time),
        }
        update_course(course.crn, patch)


def generate_schedule():
    course_list = generate_conflict_numbers()
    schedule_courses(course_list, 0, 1)


if __name__ == "__main__":
    # main()
    generate_schedule()
    # times = get_configuration(1)
    # times = load_possible_times(1)
    # print(times)
    # courses = list_courses()
    # crn_map, _ = get_course_map(courses)
    # # upload_dummy_data()
    # print(group_faculty(crn_map))
