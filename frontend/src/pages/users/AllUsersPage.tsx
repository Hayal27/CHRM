//AllUsersPage
import React from 'react';

/**
 * AllUsersPage
 * Displays a list of all registered users in the CMS.
 * Replace the placeholder data with real API data as needed.
 */
const AllUsersPage: React.FC = () => {
  // Placeholder user data
  const users = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Active' },
    { id: 3, name: 'Charlie Lee', email: 'charlie@example.com', role: 'Author', status: 'Inactive' },
  ];

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">All Users</h1>
        {/* Optional: Add "Add New User" button */}
        {/* <a href="/users/new" className="btn btn-primary btn-sm">
          <i className="fas fa-user-plus"></i> Add New User
        </a> */}
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">User List</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing={0}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {/* Replace with real navigation/actions */}
                      <a href={`/users/profile/${user.id}`} className="btn btn-sm btn-info me-2">
                        <i className="fas fa-user"></i> View
                      </a>
                      <a href={`/users/edit/${user.id}`} className="btn btn-sm btn-warning">
                        <i className="fas fa-edit"></i> Edit
                      </a>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUsersPage;
