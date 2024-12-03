import React, { useEffect, useState } from 'react';

const DataFetcher = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // console.log(data)
    fetch('http://localhost:5001/api/users/patient_info')
      .then(response => response.json())
      .then(response => setData(response.patients))
    //   .then(console.log(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Patient Data</h1>
      <ul>
        {data.map((patient) => (
          <li key={patient.patient_id}>
            <strong>{patient.first_name} {patient.last_name}</strong>
            <div>DOB: {patient.dob}</div>
            <div>Last Visit: {patient.last_visit}</div>
            <div>Status: {patient.status}</div>
            <div>Action Required: {patient.action_required}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataFetcher;