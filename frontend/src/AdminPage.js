import React, { useState, useEffect } from 'react';
import AddCityForm from './AddCityForm';
import AddStateForm from './AddStateForm';

import axios from 'axios';

function AdminPage() {
  return (
    <div className="AdminPage">
      <h1>Admin Panel</h1>
      <AddStateForm />
      <AddCityForm />
    </div>
  );
}

export default AdminPage;

