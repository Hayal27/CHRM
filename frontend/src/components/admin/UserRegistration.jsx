import Axios from "axios";
import React, { useEffect, useState } from "react";
// import '../../assets/css/adduser.css';


const UserRegistration = () => {
  // State for roles, departments, success message, error message, and form data
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]); // Added state for departments
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [data, setData] = useState({
    user_name: "",
    fname: "",
    lname: "",
    phone: "",
    email: "",
    department_id: "", // Fixed typo here
    role_id: "",
  });

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await Axios.get("http://localhost:5000/api/roles");
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error); // Improved error logging
      }
    };

    fetchRoles();
  }, []);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => { // Fixed function name
      try {
        const response = await Axios.get("http://localhost:5000/api/department");
        setDepartments(response.data); // Changed to setDepartments
      } catch (error) {
        console.error("Error fetching departments:", error); // Improved error logging
      }
    };

    fetchDepartments();
  }, []);

  // Handle form data change
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Submit form data to register user
  const submit = async (e) => {
    e.preventDefault();

    try {
      const response = await Axios.post("http://localhost:5000/api/addUser", data);
      console.log(response.data); // Log the entire response for debugging
      if (response.data.message) {
        setErrorMessage(response.data.message);
        setSuccessMessage("");
      } else {
        setSuccessMessage("User SUCCESSFULLY Registered");
        setErrorMessage("");
        setData({
          user_name: "",
          fname: "",
          lname: "",
          phone: "",
          email: "",
          department_id: "", // Fixed typo here
          role_id: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error); // Log error for debugging
      setErrorMessage("An error occurred during registration.");
      setSuccessMessage("");
    }
  };

  return (
    <main id="main" className="main" style={{ width: "100%" }}>
      <div className="pagetitle">
        <h1>User Registration</h1>
      </div>
      <section className="section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">User Registration</h5>
                <div className="card">
                  <div className="card-body">
                    {successMessage && <h3 className="text-success">{successMessage}</h3>}
                    {errorMessage && <h3 className="text-danger">{errorMessage}</h3>}
                    <form onSubmit={submit}>
                      <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">User Name</label>
                       


                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            name="user_name"
                            value={data.user_name}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <label className="col-sm-4 col-form-label">First Name</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            name="fname"
                            value={data.fname}
                            onChange={handleChange}
                            required
                          />
                        </div>



                      </div>
                      <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">Last Name</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            name="lname"
                            value={data.lname}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">Email</label>
                        <div className="col-sm-10">
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">Phone</label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className="form-control"
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">Department</label>
                        <div className="col-sm-10">
                          <select
                            name="department_id" // Changed to match the correct name
                            className="form-select"
                            value={data.department_id} // Changed to match the correct state variable
                            onChange={handleChange}
                            required
                          >
                            <option value="" disabled>Select a department</option>
                            {departments.map((department) => ( // Changed to use the departments state
                              <option key={department.department_id} value={department.department_id}>
                                {department.department_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <label className="col-sm-4 col-form-label">Roles</label>
                        <div className="col-sm-10">
                          <select
                            name="role_id"
                            className="form-select"
                            value={data.role_id}
                            onChange={handleChange}
                            required
                          >
                            <option value="" disabled>Select a role</option>
                            {roles.map((role) => (
                              <option key={role.role_id} value={role.role_id}>
                                {role.role_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-10">
                          <button type="submit" className="btn btn-primary">
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default UserRegistration;
