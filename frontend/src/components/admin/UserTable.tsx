import Axios from 'axios';
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';

interface User {
  user_id: number | string;
  fname: string;
  lname: string;
  user_name: string;
  phone: string;
  department_id: number | string;
  role_id: number | string;
  status: number;
}

interface Role {
  role_id: number | string;
  role_name: string;
}

interface Department {
  department_id: number | string;
  name: string;
}

interface UpdateData {
  fname: string;
  lname: string;
  user_name: string;
  phone: string;
  department_id: string;
  role_id: string;
}

const UserTable: React.FC = () => {
  // State for users, roles, and departments
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // State for modal feedback (for status changes & updates)
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackModalMessage, setFeedbackModalMessage] = useState<string>('');
  const [feedbackModalTitle, setFeedbackModalTitle] = useState<string>('Status Update');


  // State for update modal
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updateData, setUpdateData] = useState<UpdateData>({
    fname: '',
    lname: '',
    user_name: '',
    phone: '',
    department_id: '',
    role_id: '' // Changed from role_name to role_id
  });

  // Fetch users from backend
  const fetchUsers = () => {
    Axios.get("http://localhost:5001/api/users")
      .then((res) => {
        console.log("Fetched users data:", res.data);
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      });
  };

  // Fetch roles from backend
  const fetchRoles = () => {
    Axios.get("http://localhost:5001/api/roles")
      .then((res) => {
        console.log("Fetched roles data:", res.data);
        setRoles(res.data);
      })
      .catch((err) => {
        console.error("Error fetching roles:", err);
      });
  };

  // Fetch departments from backend
  const fetchDepartments = () => {
    Axios.get("http://localhost:5001/api/departments")
      .then((res) => {
        console.log("Fetched departments data:", res.data);
        setDepartments(res.data);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
      });
  };

  // Change user status
  const changeStatus = async (status: number, user_id: number | string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${user_id}/status`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      console.log('Change status response:', data);
      setFeedbackModalTitle('Status Update');
      if (response.ok) {
        const action = status === 1 ? 'activated' : 'deactivated';
        setFeedbackModalMessage(`User has been successfully ${action}.`);
        setShowFeedbackModal(true);
        fetchUsers(); // Refresh users list
      } else {
        setFeedbackModalMessage(data.message || 'Error changing user status. Please try again.');
        setShowFeedbackModal(true);
      }
    } catch (error) {
      console.error("Error changing status:", error);
      setFeedbackModalTitle('Status Update Error');
      setFeedbackModalMessage('Error changing user status. Please try again.');
      setShowFeedbackModal(true);
    }
  };

  // Open update modal and pre-fill form
  const openUpdateModal = (user: User) => {
    setSelectedUser(user);
    setUpdateData({
      fname: user.fname || '',
      lname: user.lname || '',
      user_name: user.user_name || '',
      phone: user.phone || '',
      department_id: user.department_id ? String(user.department_id) : '',
      role_id: user.role_id ? String(user.role_id) : '' // Use role_id
    });
    setShowUpdateModal(true);
  };

  // Handle update form field changes
  const handleUpdateChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUpdateData({...updateData, [e.target.name]: e.target.value});
  };

  // Submit updated user data
  const submitUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const payload = {
      ...updateData,
      department_id: updateData.department_id ? parseInt(updateData.department_id, 10) : null,
      role_id: updateData.role_id ? parseInt(updateData.role_id, 10) : null,
    };

    try {
      const response = await Axios.put(`http://localhost:5001/api/updateUser/${selectedUser.user_id}`, payload);
      console.log("Update response:", response.data);
      setFeedbackModalTitle('User Update');
      setFeedbackModalMessage(response.data.message || "User updated successfully.");
      setShowFeedbackModal(true);
      setShowUpdateModal(false);
      fetchUsers(); // Refresh users list
    } catch (error: any) {
      console.error("Error updating user:", error);
      setFeedbackModalTitle('Update Error');
      setFeedbackModalMessage(error.response?.data?.message || "Error updating user. Please try again.");
      setShowFeedbackModal(true);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  const roleLookup = roles.reduce<Record<string | number, string>>((acc, role) => {
    acc[role.role_id] = role.role_name;
    return acc;
  }, {});

  const departmentLookup = departments.reduce<Record<string | number, string>>((acc, dept) => {
    acc[dept.department_id] = dept.name;
    return acc;
  }, {});

  return (
    <>
    <main id="main" className="main">
      <div className="pagetitle">
        <h1 className="display-6 fw-bold text-primary mb-3">User Management</h1>
        <nav>
          <ol className="breadcrumb bg-light rounded px-3 py-2">
            <li className="breadcrumb-item"><a href="index.html">Admin</a></li>
            <li className="breadcrumb-item">Users</li>
            <li className="breadcrumb-item active">Manage Accounts</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title fw-semibold text-secondary">Users Table</h5>
                <div className="table-responsive">
                  <table className="table table-hover table-striped align-middle table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">User Name</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Role</th>
                        <th scope="col">Department</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                        <th scope="col">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, i) => (
                        <tr key={user.user_id}>
                          <th scope="row">{i + 1}</th>
                          <td>{user.fname}</td>
                          <td>{user.lname}</td>
                          <td>{user.user_name}</td>
                          <td>{user.phone}</td>
                          <td>{roleLookup[user.role_id] || "N/A"}</td>
                          <td>{departmentLookup[user.department_id] || "N/A"}</td>
                          <td>
                            {user.status === 1
                              ? <span className='badge bg-success'>Inactive</span>
                              : <span className='badge bg-danger'>Active</span>
                            }
                          </td>
                          <td>
                            {user.status === 1 ? (
                              <button onClick={() => changeStatus(0, user.user_id)} className="btn btn-warning btn-sm rounded-pill px-3">Deactivate</button>
                            ) : (
                              <button onClick={() => changeStatus(1, user.user_id)} className="btn btn-success btn-sm rounded-pill px-3">Activate</button>
                            )}
                          </td>
                          <td>
                            <button onClick={() => openUpdateModal(user)} className="btn btn-primary btn-sm rounded-pill px-3">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Modal (for status changes and update results) */}
      {showFeedbackModal && (
        <div className={`modal fade ${showFeedbackModal ? 'show' : ''}`} style={{ display: showFeedbackModal ? 'block' : 'none' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{feedbackModalTitle}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowFeedbackModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p className="lead">{feedbackModalMessage}</p>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowFeedbackModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update User Modal */}
      {showUpdateModal && (
        <div className={`modal fade ${showUpdateModal ? 'show' : ''}`} style={{ display: showUpdateModal ? 'block' : 'none' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <form onSubmit={submitUpdate}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Update User: {selectedUser?.user_name}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowUpdateModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="fnameUpdate" className="form-label fw-semibold">First Name</label>
                      <input type="text" name="fname" id="fnameUpdate" value={updateData.fname} onChange={handleUpdateChange} className="form-control form-control-lg" required/>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lnameUpdate" className="form-label fw-semibold">Last Name</label>
                      <input type="text" name="lname" id="lnameUpdate" value={updateData.lname} onChange={handleUpdateChange} className="form-control form-control-lg" required/>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="usernameUpdate" className="form-label fw-semibold">User Name</label>
                      <input type="text" name="user_name" id="usernameUpdate" value={updateData.user_name} onChange={handleUpdateChange} className="form-control form-control-lg" required/>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phoneUpdate" className="form-label fw-semibold">Phone</label>
                      <input type="text" name="phone" id="phoneUpdate" value={updateData.phone} onChange={handleUpdateChange} className="form-control form-control-lg" required/>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="departmentUpdate" className="form-label fw-semibold">Department</label>
                      <select name="department_id" id="departmentUpdate" value={updateData.department_id} onChange={handleUpdateChange} className="form-select form-select-lg" required>
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="roleUpdate" className="form-label fw-semibold">Role</label>
                      <select name="role_id" id="roleUpdate" value={updateData.role_id} onChange={handleUpdateChange} className="form-select form-select-lg" required>
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">Update User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
};

export default UserTable;
