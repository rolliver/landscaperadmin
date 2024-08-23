import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AdminPage from './AdminPage';  // Import the AdminPage component
import JobsList from './JobsList';  // Assume you have a JobsList component for listing jobs

function App() {
    return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Jobs List</Link>
            </li>
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<JobsList />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

