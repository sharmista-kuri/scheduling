-- 1. Faculty
CREATE TABLE Faculty (
    fid INT AUTO_INCREMENT,
    NAME VARCHAR(100),
    auth_level VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    PASSWORD VARCHAR(100),
    PRIMARY KEY (fid)
);

-- 2. Course 
CREATE TABLE Course (
    CRN INT NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    fid INT NOT NULL,
    NAME VARCHAR(100) NOT NULL,
    duration INT NOT NULL,
    start_time TIME,
    end_time TIME,
    is_pinned BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (CRN),
    FOREIGN KEY (fid) REFERENCES Faculty(fid)
);

-- 3. Course_Days
CREATE TABLE Course_Days (
    CRN INT,
    days VARCHAR(10),
    PRIMARY KEY (CRN),
    FOREIGN KEY (CRN) REFERENCES Course(CRN)
);

-- 4. Conflict_no
CREATE TABLE Conflict_no (
    course_code VARCHAR(20),
    conflict_no INT,
    PRIMARY KEY (course_code, conflict_no)
);

-- 5. Coreqs
CREATE TABLE Coreqs (
    CRN1 INT,
    CRN2 INT,
    PRIMARY KEY (CRN1, CRN2),
    FOREIGN KEY (CRN1) REFERENCES Course(CRN),
    FOREIGN KEY (CRN2) REFERENCES Course(CRN)
);

-- 6. Prereqs
CREATE TABLE Prereqs (
    prereq_course_code VARCHAR(20),
    course_code VARCHAR(20),
    PRIMARY KEY (prereq_course_code, course_code)
);

-- 7. Comment
CREATE TABLE Comment (
    cid INT AUTO_INCREMENT,
    CRN INT,
    fid INT,
    time_posted TIMESTAMP NOT NULL,
    comment_text TEXT NOT NULL,
    PRIMARY KEY (cid,CRN,fid),
    FOREIGN KEY (CRN) REFERENCES Course(CRN),
    FOREIGN KEY (fid) REFERENCES Faculty(fid)
);

-- 8. Configuration
CREATE TABLE Configuration (
    config_id INT AUTO_INCREMENT,
    travel_time INT DEFAULT 0,
    PRIMARY KEY (config_id)
);

-- 9. Configured_by
CREATE TABLE Configured_by (
    config_id INT,
    fid INT,
    PRIMARY KEY (config_id),
    FOREIGN KEY (config_id) REFERENCES Configuration(config_id),
    FOREIGN KEY (fid) REFERENCES Faculty(fid)
);

-- 10. Preferred_Days
CREATE TABLE Preferred_Days (
    config_id INT,
    days VARCHAR(10),
    PRIMARY KEY (config_id, days),
    FOREIGN KEY (config_id) REFERENCES Configuration(config_id)
);

-- 11. Preferred_Start_Times
CREATE TABLE Preferred_Start_Times (
    config_id INT,
    times TIME,
    PRIMARY KEY (config_id, times),
    FOREIGN KEY (config_id) REFERENCES Configuration(config_id)
);


DROP TABLE Preferred_Start_Times;
DROP TABLE Preferred_Days;

DROP TABLE Configured_by;

DROP TABLE Configuration;
DROP TABLE Comment;
DROP TABLE Prereqs;
DROP TABLE Coreqs;
DROP TABLE Conflict_no;
DROP TABLE Course_Days;
DROP TABLE Course;
DROP TABLE Faculty;


