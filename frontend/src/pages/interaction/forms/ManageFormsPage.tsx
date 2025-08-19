import React from 'react';
import { Link } from 'react-router-dom';

const ManageFormsPage: React.FC = () => {
  return (
    <div className="p-3 p-sm-4">
       <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Manage Forms</h2>
        <Link to="/interaction/forms/new" className="btn btn-primary">Add New Form</Link>
      </div>
      <p>This page allows creating, editing, and managing forms (e.g., contact forms, surveys).</p>
      {/* Add table or list of existing forms */}
      {/* Example Row: Form Name | Shortcode/Embed | Submissions | Date | Actions (Edit, Delete, View Submissions) */}
    </div>
  );
};

export default ManageFormsPage;