import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddCityForm() {
  const [states, setStates] = useState([]);
  const [cityName, setCityName] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = () => {
    axios.get('http://localhost:5001/states')
      .then(response => {
        setStates(response.data);
      })
      .catch(error => {
        console.error('Error fetching states:', error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cityData = {
      city_name: cityName,
      state_id: selectedState
    };

    axios.post('http://localhost:5001/cities', cityData)
      .then(response => {
        console.log('City added successfully:', response.data);
        // Optionally clear the form or provide feedback
        setCityName('');
        setSelectedState('');
      })
      .catch(error => {
        console.error('Error adding city:', error);
      });
  };

  return (
    <div className="AddCityForm">
      <h2>Add New City</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>City Name:</label>
          <input
            type="text"
            name="city_name"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>State:</label>
          <select
            name="state_id"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.state_id} value={state.state_id}>
                {state.state_name} ({state.state_abbr})
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add City</button>
      </form>
    </div>
  );
}

export default AddCityForm;

