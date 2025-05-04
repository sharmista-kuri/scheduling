import React, { useState, useEffect } from 'react';
import './modal.css'; // optional if you want custom styles

const ConfigurationModal = ({ show, onClose, onSubmit, editData }) => {
  const [travelTime, setTravelTime] = useState(10);
  const [days, setDays] = useState([]);
  const [times, setTimes] = useState([]);
  const [newDay, setNewDay] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (editData) {
      setTravelTime(editData.travel_time || 10);
      setDays(editData.days || []);
      setTimes(editData.times || []);
    } else {
      setTravelTime(10);
      setDays([]);
      setTimes([]);
    }
  }, [editData]);

  const addDay = () => {
    if (newDay && !days.includes(newDay)) {
      setDays([...days, newDay]);
      setNewDay('');
    }
  };

  const removeDay = (day) => {
    setDays(days.filter(d => d !== day));
  };

  const addTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime]);
      setNewTime('');
    }
  };

  const removeTime = (time) => {
    setTimes(times.filter(t => t !== time));
  };

  const handleSubmit = () => {
    const fid = localStorage.getItem("fid");
    onSubmit({
      travel_time: travelTime,
      days,
      times,
      fid: parseInt(fid),
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h4>{editData ? 'Edit Configuration' : 'Add Configuration'}</h4>

        <div className="mb-3">
          <label>Travel Time (minutes):</label>
          <input
            type="number"
            className="form-control"
            value={travelTime}
            onChange={(e) => setTravelTime(Number(e.target.value))}
          />
        </div>

        <div className="mb-3">
          <label>Preferred Days:</label>
          <div className="input-group">
            <input
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="form-control"
              placeholder="e.g. MW"
            />
            <button className="btn btn-outline-secondary" onClick={addDay}>Add</button>
          </div>
          <div className="mt-2">
            {days.map((d) => (
              <span key={d} className="badge bg-secondary me-2">
                {d} <button className="btn-close btn-close-white btn-sm" onClick={() => removeDay(d)} />
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label>Preferred Start Times:</label>
          <div className="input-group">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="form-control"
            />
            <button className="btn btn-outline-secondary" onClick={addTime}>Add</button>
          </div>
          <div className="mt-2">
            {times.map((t) => (
              <span key={t} className="badge bg-secondary me-2">
                {t} <button className="btn-close btn-close-white btn-sm" onClick={() => removeTime(t)} />
              </span>
            ))}
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSubmit}>
            {editData ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationModal;
