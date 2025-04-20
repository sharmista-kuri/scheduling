import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import CourseModal from '../components/CourseModal'; 
import './calendar.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 8 PM


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

const CalendarPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const fetchCourses = () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    axios.get(`${baseURL}/courses/get.php`)
        .then(res => setCourses(res.data))
        .catch(err => console.error('Error loading courses:', err));
    };


  useEffect(() => {
    fetchCourses();
  }, []);
  
  

  return (
    <div className="calendar-container">
      <div className="calendar-grid">

        {/* Header row */}
        <div className="calendar-header"></div>
        {days.map(day => (
          <div className="calendar-header" key={day}>{day}</div>
        ))}

        {/* Time rows */}
        {hours.map((hour, rowIndex) => (
          <React.Fragment key={hour}>
            <div className="time-label">{hour}:00</div>
            {days.map((day, colIndex) => (
              <div
                className="calendar-cell"
                key={`${day}-${hour}`}
                style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Course blocks */}
        {courses.map(course => {
          const courseDays = parseDays(course.days);

          return courseDays.map(day => {
            const colIndex = days.indexOf(day);
            if (colIndex === -1) return null;

            const startMin = moment.duration(course.start_time).asMinutes();
            const endMin = moment.duration(course.end_time).asMinutes();
            const rowStart = Math.floor((startMin - 480) / 60) + 2; // 8 AM = row 2
            const durationRows = Math.ceil((endMin - startMin) / 60);
            const style = getCourseStyle(course.course_code);
            var span = '';
            

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
                <div>{course.start_time}–{course.end_time}</div>
                <div style={{ fontSize: '11px' }}>{course.course_name}</div>
                `{span}`
              </div>
            );
          });
        })}
      </div>
      <CourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onPinToggle={fetchCourses}
        />
    </div>
  );
};

export default CalendarPage;
