import React, { useState } from 'react';
import axios from 'axios';

function AddStateForm() {
  const [stateName, setStateName] = useState('');
  const [stateAbbr, setStateAbbr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const stateData = {
      state_name: stateName,
      state_abbreviation: stateAbbr
    };

    axios.post('http://localhost:5001/states', stateData)
      .then(response => {
        console.log('State added successfully:', response.data);
        // Optionally clear the form or provide feedback
        setStateName('');
        setStateAbbr('');
      })
      .catch(error => {
        console.error('Error adding state:', error);
      });
  };

  return (
    <div className="AddStateForm">
      <h2>Add New State</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>State Name:</label>
          <input
            type="text"
            name="state_name"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>State Abbreviation:</label>
          <input
            type="text"
            name="state_abbr"
            value={stateAbbr}
            onChange={(e) => setStateAbbr(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add State</button>
      </form>
    </div>
  );
}

export default AddStateForm;

