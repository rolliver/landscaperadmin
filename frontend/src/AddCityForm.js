import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddCityForm({ onCityAdded }) {
  const [cityName, setCityName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]);

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
        setCityName('');
        setSelectedState('');
        if (onCityAdded) onCityAdded();
      })
      .catch(error => {
        console.error('Error adding city:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        placeholder="City Name"
        required
      />
      <select
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        required
      >
        <option value="">Select a State</option>
        {states.map(state => (
          <option key={state.state_id} value={state.state_id}>
            {state.state_name}
          </option>
        ))}
      </select>
      <button type="submit">Add City</button>
    </form>
  );
}

export default AddCityForm;

