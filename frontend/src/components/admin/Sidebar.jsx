import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle function for sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    

      {/* Sidebar Toggle Button */}
      <i className="bi bi-list toggle-sidebar-btn" onClick={toggleSidebar} title="Toggle Sidebar" />

      {/* Sidebar */}
      <aside id="sidebar" className="sidebar">
      <ul className="sidebar-menu">
          <li>
            <Link to="/" onClick={toggleSidebar}>
              <i className="bi bi-speedometer2"></i> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/EmployeeForm" onClick={toggleSidebar}>
              <i className="bi bi-person"></i> Add New User
            </Link>
          </li>
          <li>
            <Link to="/usertable" onClick={toggleSidebar}>
              <i className="bi bi-gear"></i> Update User
            </Link>
          </li>
          <li>
            <Link to="/help" onClick={toggleSidebar}>
              <i className="bi bi-question-circle"></i> Help
            </Link>
          </li>
        </ul>



  
        
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Content for main app goes here */}
      </div>
    </>
  );
}

export default Sidebar;