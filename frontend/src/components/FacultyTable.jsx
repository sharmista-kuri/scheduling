// src/components/FacultyTable.jsx
import React from 'react';

const FacultyTable = ({ facultyList, onEdit, onDelete, onSort, sortConfig }) => {
  const getHeaderStyle = (key) => ({
    cursor: 'pointer',
    fontWeight: sortConfig.key === key ? 'bold' : 'normal',
  });

  const getSortSymbol = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '🔼' : '🔽';
  };

  return (
    <table className="table table-bordered table-striped">
      <thead className="table-dark">
        <tr>
          <th onClick={() => onSort('fid')} style={getHeaderStyle('fid')}>
            ID {getSortSymbol('fid')}
          </th>
          <th onClick={() => onSort('NAME')} style={getHeaderStyle('NAME')}>
            Name {getSortSymbol('NAME')}
          </th>
          <th onClick={() => onSort('email')} style={getHeaderStyle('email')}>
            Email {getSortSymbol('email')}
          </th>
          <th onClick={() => onSort('auth_level')} style={getHeaderStyle('auth_level')}>
            Auth Level {getSortSymbol('auth_level')}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {facultyList.length > 0 ? (
          facultyList.map((f) => (
            <tr key={f.fid}>
              <td>{f.fid}</td>
              <td>{f.NAME}</td>
              <td>{f.email}</td>
              <td>{f.auth_level}</td>
              <td>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(f)}>
                   Edit ✏️
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(f.fid)}>
                  Delete 🗑️
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">No faculty found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default FacultyTable;
