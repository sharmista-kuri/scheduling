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

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = 480 + i * 15; // 8:00 AM = 480 minutes
  const hour = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = moment({ hour, minute: minutes }).format(minutes === 0 ? 'h A' : 'h:mm');
  return { label: time.toLowerCase(), minutes: totalMinutes };
});

const CalendarPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const fetchCourses = useCallback(() => {
    axios.get(`${baseURL}/courses/get.php`)
      .then(res => {
        setCourses(res.data);
        setFilteredCourses(res.data);
      })
      .catch(err => console.error('Error loading courses:', err));
  }, [baseURL]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.faculty_name && course.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="🔍 Filter by course, name, or faculty"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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

                const startMin = moment.duration(course.start_time).asMinutes();
                const endMin = moment.duration(course.end_time).asMinutes();
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
                    <div>{moment(course.start_time, 'HH:mm:ss').format('h:mm A')}–{moment(course.end_time, 'HH:mm:ss').format('h:mm A')}</div>
                    <div style={{ fontSize: '11px' }}>{course.course_name}</div>

                    {/* 👨‍🏫 Faculty info */}
                    <div className="d-flex align-items-center mt-1">
                      <img
                        // src={course.faculty_pic || `${process.env.REACT_APP_API_BASE_URL}/default-faculty.png`}
                        src={course.faculty_pic || `${process.env.REACT_APP_API_BASE_URL}/profile.png`}
                        alt="faculty"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginRight: '5px'
                        }}
                      />
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
