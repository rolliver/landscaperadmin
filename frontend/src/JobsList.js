import React, { useState, useEffect } from 'react';

import axios from 'axios';

function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null); // State to track the job being edited


  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1); // Set to tomorrow
  const formattedDate = defaultDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [newJob, setNewJob] = useState({
      address: '',
      duration: '',
      tasks: 'Visit',
      date: formattedDate,
      start_time: '09:00',
      postal_code: '',
      city_name: 'Woodstock',
      state_name: 'Ontario',
      validated: false
        });

const [availableTasks, setAvailableTasks] = useState([
    'Cut Grass', 
    'Weeding', 
    'Trimming', 
    'Mulching', 
    'Planting',
    'Visit',
  ]); // Add more tasks as needed

  useEffect(() => {
    fetchJobs();
    fetchCities();
    fetchStates();
  }, []);


  const fetchJobs = () => {
    axios.get('http://localhost:5001/jobs')
      .then(response => {
        setJobs(response.data);
      })
      .catch(error => {
        console.error('Error fetching jobs:', error);
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

  const fetchStates = () => {
    axios.get('http://localhost:5001/states')
      .then(response => {
        setStates(response.data);
      })
      .catch(error => {
        console.error('Error fetching states:', error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewJob({
      ...newJob,
      [name]: value
    });
  }


  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingJob) {
      // Update existing job
      axios.put(`http://localhost:5001/jobs/${editingJob.job_id}`, newJob)
        .then(response => {
          console.log('Job updated successfully:', response.data);
          resetForm(); // Reset the form after editing
          fetchJobs(); // Refresh the job list after updating a job
        })
        .catch(error => {
          console.error('Error updating job:', error);
        });
    } else {
    axios.post('http://localhost:5001/jobs', newJob)
      .then(response => {
        console.log('Job added successfully:', response.data);
        // Optionally clear the form or provide feedback
        setNewJob({
          address: '',
          duration: '',
          tasks: 'Visit',
          date: formattedDate,
          start_time: '09:00',
          postal_code: '',
          city_name: 'Woodstock',
          state_name: 'Ontario',
          validated: false,
        });
        fetchJobs(); // Refresh the job list after adding a new job
      })
      .catch(error => {
        console.error('Error adding job:', error);
      });
    }
  };

  const resetForm = () => {
    setNewJob({
      address: '',
      coordinates: '',
      duration: '',
      tasks: '',
      date: formattedDate, // Reset to default date
      start_time: '09:00', // Reset to default time
      postal_code: '',
      city_name: 'Woodstock', // Reset to default city
      state_name: 'Ontario', // Reset to default state
      validated: false,
    });
    setEditingJob(null); // Exit edit mode
  };

  const handleTaskChange = (task) => {
    setNewJob(prevState => {
      const tasks = [...prevState.tasks];
      if (tasks.includes(task)) {
        // Remove the task if it's already selected
        return { ...prevState, tasks: tasks.filter(t => t !== task) };
      } else {
        // Add the task if it's not selected
        return { ...prevState, tasks: [...tasks, task] };
      }
    });
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setNewJob({
      address: job.address,
      coordinates: job.coordinates,
      duration: job.duration,
      tasks: job.tasks,
      date: job.date,
      start_time: job.start_time,
      postal_code: job.postal_code,
      city_name: job.city_name,
      state_name: job.state_name,
      validated: job.validated,
    });
  };

const handleDeleteClick = (job) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      axios.delete(`http://localhost:5001/jobs/${job.job_id}`)
        .then(response => {
          console.log('Job deleted successfully:', response.data);
          fetchJobs(); // Refresh the job list after deletion
        })
        .catch(error => {
          console.error('Error deleting job:', error);
        });
    }
  };

  return (
    <div>
    <div className="JobsList">
      <h1>Jobs List</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>Address</th>
            <th>City</th>
            <th>State</th>
            <th>Postal Code</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Duration (mins)</th>
            <th>Tasks</th>
            <th>Validated</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.job_id}>
              <td>{job.date}</td>
              <td>{job.start_time}</td>
              <td>{job.address}</td>
              <td>{job.city_name}</td>
              <td>{job.state_name}</td>
              <td>{job.postal_code}</td>
              <td>{job.latitude}</td>
              <td>{job.longitude}</td>
              <td>{job.duration}</td>
              <td>{job.tasks.join(', ')}</td>
              <td>{job.validated ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingJob ? 'Edit Job' : 'Add New Job'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Address:</label>
          <input type="text" name="address" value={newJob.address} onChange={handleChange} required />
        </div>
        <div>
          <label>Tasks:</label>
          <div>
            {availableTasks.map((task, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`task-${index}`}
                  name="tasks"
                  value={task}
                  checked={newJob.tasks.includes(task)}
                  onChange={() => handleTaskChange(task)}
                />
                <label htmlFor={`task-${index}`}>{task}</label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label>Duration (mins):</label>
          <input type="number" name="duration" value={newJob.duration} onChange={handleChange} required />
        </div>
        <div>
          <label>Date:</label>
          <input type="date" name="date" value={newJob.date} onChange={handleChange} />
        </div>
        <div>
          <label>Start Time:</label>
          <input type="time" name="start_time" value={newJob.start_time} onChange={handleChange} />
        </div>

<div>
          <label>Postal Code:</label>
          <input type="text" name="postal_code" value={newJob.postal_code} onChange={handleChange} required />
        </div>

        <div>
          <label>State:</label>
          <select name="state_name" value={newJob.state_name} onChange={handleChange} required>
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.state_id} value={state.state_name}>
                {state.state_name}
              </option>
            ))}
          </select>
        </div>

 
       <div>
          <label>City:</label>
          <select name="city_name" value={newJob.city_name} onChange={handleChange} required>
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.city_id} value={city.city_name}>
                {city.city_name}
              </option>
            ))}
          </select>
        </div>
       <div>
          <label>
            Validated:
            <input type="checkbox" name="validated" checked={newJob.validated} onChange={(e) => setNewJob({ ...newJob, validated: e.target.checked })} />
          </label>
        </div>
        <button type="submit">Add Job</button>
      </form>
    </div>
  </div>
  );
}

export default JobsList;

