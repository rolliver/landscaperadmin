import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCityForm from './AddCityForm';
import AddStateForm from './AddStateForm';

function AdminPage() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchStates();
    fetchCities();
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

  const fetchCities = () => {
    axios.get('http://localhost:5001/cities')
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error('Error fetching cities:', error);
      });
  };

  return (
    <div className="AdminPage">
      <h1>Admin Panel</h1>
      
      <div className="admin-section">
        <h2>States</h2>
        <ul>
          {states.map(state => (
            <li key={state.state_id}>{state.state_name} ({state.state_abbr})</li>
          ))}
        </ul>
        <AddStateForm onStateAdded={fetchStates} />
      </div>

      <div className="admin-section">
        <h2>Cities</h2>
        <ul>
          {cities.map(city => (
            <li key={city.city_id}>{city.city_name}, {city.state_name}</li>
          ))}
        </ul>
        <AddCityForm onCityAdded={fetchCities} />
      </div>
    </div>
  );
}

export default AdminPage;

