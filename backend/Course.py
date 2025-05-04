from time_conversion import *


# Object to store only the critical course information
class Course:
    def __init__(
        self,
        crn,
        course_code,
        is_pinned=False,
        duration=80,
        start_time=None,
        end_time=None,
        days=[],
        faculty=None,
        prereqs=[],
        coreqs=[],
    ):
        self.crn = crn
        self.course_code = course_code
        self.conflict_numbers = set()
        self.is_pinned = is_pinned
        self.duration = duration
        if start_time != None:
            self.start_time = time_str2int(start_time)
        else:
            self.start_time = start_time
        if end_time != None:
            self.end_time = time_str2int(end_time)
        else:
            self.end_time = end_time
        self.days = days
        self.faculty = faculty
        self.prereqs = prereqs
        self.coreqs = coreqs

    def schedule_course(self, days, time):
        self.days = days
        self.start_time = time
        self.end_time = time + self.duration

    def __repr__(self):
        # return f"(CRN: {self.crn} Course_Code: {self.course_code} Pinned: {self.is_pinned})"
        # return f"{self.crn}, {self.conflict_numbers}\n"
        return f"{'-'*30}\n{self.crn}   {self.days}: {time_int2str(self.start_time)} - {time_int2str(self.end_time)}\n{self.conflict_numbers}\n{'-'*30}\n"


def get_course_map(all_courses):
    """
    Input: None

    Output: Two Hashmaps. The first containing course codes as keys and a list of course objects who all share that course code as values.
    The second containing crns as keys and a single course object as the values.
    """

    # Output hashmaps
    code_map = {}
    crn_map = {}
    for course in all_courses:
        course_object = Course(
            crn=course[0],
            course_code=course[1],
            is_pinned=course[2],
            duration=course[3],
            start_time=course[4],
            end_time=course[5],
            days=course[6],
        )
        # Add object to code map
        if course_object.course_code not in code_map:
            code_map[course_object.course_code] = []
        code_map[course_object.course_code].append(course_object)
        # Add object to crn map
        crn_map[course_object.crn] = course_object
    return code_map, crn_map
