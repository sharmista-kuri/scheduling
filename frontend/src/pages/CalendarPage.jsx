import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import CourseModal from '../components/CourseModal';
import Navbar from '../components/Navbar';
import './calendar.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const parseDays = (dayStr) => {
  if (!dayStr) return [];
  return dayStr
    .split(',')
    .map(d => d.trim().toUpperCase())
    .map(code => {
      if (code === 'M') return 'Mon';
      if (code === 'T') return 'Tue';
      if (code === 'W') return 'Wed';
      if (code === 'TH') return 'Thu';
      if (code === 'F') return 'Fri';
      return null;
    })
    .filter(Boolean);
};

const getCourseStyle = (code) => {
  const palette = ['#e0f7fa', '#e8f5e9', '#fff3e0', '#fce4ec', '#ede7f6'];
  const textColors = ['#007c91', '#2e7d32', '#ef6c00', '#c2185b', '#5e35b1'];
  const index = Math.abs([...code].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % palette.length;

  return {
    background: `repeating-linear-gradient(
      45deg,
      ${palette[index]},
      ${palette[index]} 10px,
      #fff 10px,
      #fff 20px
    )`,
    color: textColors[index],
    borderLeft: `5px solid ${textColors[index]}`
  };
};

const timeSlots = Array.from({ length: 52 }, (_, i) => {
  const totalMinutes = 480 + i * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = moment({ hour, minute: minutes }).format(minutes === 0 ? 'h A' : 'h:mm');
  return { label: time.toLowerCase(), minutes: totalMinutes };
});

const CalendarPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [codeFilter, setCodeFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseURL = process.env.REACT_APP_API_BASE_URL;
  const authLevel = localStorage.getItem('auth_level');
  const isAdmin = authLevel === 'admin';

  const fetchCourses = useCallback(() => {
    axios.get(`${baseURL}/courses/`)
      .then(res => {
        setCourses(res.data);
        setFilteredCourses(res.data);
      })
      .catch(err => console.error('Error loading courses:', err));
  }, [baseURL]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Live filtering on input change
  useEffect(() => {
    const filtered = courses.filter(course =>
      course.course_code.toLowerCase().includes(codeFilter.toLowerCase()) &&
      course.course_name.toLowerCase().includes(titleFilter.toLowerCase()) &&
      (course.faculty_name || '').toLowerCase().includes(facultyFilter.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [codeFilter, titleFilter, facultyFilter, courses]);

  const handleReload = () => {
    setLoading(true);
    fetch(`${baseURL}/courses`)
      .then(res => res.json())
      .then(data => {
        console.log('Schedule reload triggered:', data);
        window.location.reload();
      })
      .catch(err => {
        console.error('Failed to reload schedule:', err);
        setLoading(false);
      });
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <div className="d-flex mb-3 gap-2 align-items-center flex-wrap">
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '160px', fontSize: '14px', padding: '6px 10px' }}
            placeholder="Course Code"
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
          />
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '160px', fontSize: '14px', padding: '6px 10px' }}
            placeholder="Course Title"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
          />
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: '160px', fontSize: '14px', padding: '6px 10px' }}
            placeholder="Faculty Name"
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
          />

          {isAdmin && (
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              style={{ fontSize: '13px', padding: '6px 10px' }}
              onClick={handleReload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Loading...
                </>
              ) : (
                <>🔄 Refresh Schedule</>
              )}
            </button>
          )}
        </div>

        <div className="calendar-container border rounded p-3 shadow bg-light">
          <div className="calendar-grid">
            <div className="calendar-header"></div>
            {days.map(day => (
              <div className="calendar-header" key={day}>{day}</div>
            ))}

            {timeSlots.map((slot, rowIndex) => (
              <React.Fragment key={slot.label + rowIndex}>
                <div
                  className="time-label"
                  style={{ fontWeight: slot.label.includes(':') ? 'normal' : 'bold' }}
                >
                  {slot.label}
                </div>
                {days.map((day, colIndex) => (
                  <div
                    className="calendar-cell"
                    key={`${day}-${slot.label}-${rowIndex}`}
                    style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
                  />
                ))}
              </React.Fragment>
            ))}

            {filteredCourses.map(course => {
              const courseDays = parseDays(course.days);
              return courseDays.map(day => {
                const colIndex = days.indexOf(day);
                if (colIndex === -1) return null;

                const startMin = course.start_time;
                const endMin = course.end_time;
                if (startMin < 480 || endMin <= startMin) return null;
                const rowStart = Math.floor((startMin - 480) / 15) + 3;
                const durationRows = Math.ceil((endMin - startMin) / 15);

                const style = getCourseStyle(course.course_code);

                return (
                  <div
                    key={`${course.CRN}-${day}`}
                    className="course-block"
                    style={{
                      gridColumn: colIndex + 2,
                      gridRow: `${rowStart} / span ${durationRows}`,
                      ...style
                    }}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="course-title">
                      <span className="info-icon">
                        {course.is_pinned === '1' || course.is_pinned === 1 ? '📌' : 'ℹ'}
                      </span> {course.course_code}
                    </div>
                    <div>
                      {moment().startOf('day').add(course.start_time, 'minutes').format('h:mm A')}–
                      {moment().startOf('day').add(course.end_time, 'minutes').format('h:mm A')}
                    </div>

                    <div style={{ fontSize: '11px' }}>{course.course_name}</div>

                    <div className="d-flex align-items-center mt-1">
                      <span style={{ fontSize: '11px' }}>{course.faculty_name}</span>
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>

        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onPinToggle={fetchCourses}
        />
      </div>
    </>
  );
};

export default CalendarPage;
