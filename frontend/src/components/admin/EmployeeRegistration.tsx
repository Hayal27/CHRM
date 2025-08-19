import Axios from "axios";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
// import "../../assets/css/custom.css";

interface Role {
  role_id: number | string;
  role_name: string;
}

interface Department {
  department_id: number | string;
  name: string;
}

interface EmployeeData {
  name: string;
  role_id: string;
  department_id: string;
  supervisor_id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  sex: string;
}

const EmployeeRegistration: React.FC = () => {
  // State for roles, departments, and form data
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [data, setData] = useState<EmployeeData>({
    name: "",
    role_id: "",
    department_id: "",
    supervisor_id: "",
    fname: "",
    lname: "",
    email: "",
    phone: "",
    sex: "",
  });

  // State for modal popup feedback
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  // Fetch roles, departments, and supervisors on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await Axios.get("https://hrbackend.wingtechai.com/api/roles");
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await Axios.get("https://hrbackend.wingtechai.com/api/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchRoles();
    fetchDepartments();
  }, []);

  // Handle form data change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // Submit form data to register employee and show modal with feedback
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await Axios.post("https://hrbackend.wingtechai.com/api/addEmployee", data);
      console.log(response.data);
      // Check if response.data has a message indicating an error
      if (response.data.message) {
        setModalType("success");
        setModalMessage(response.data.message);
      } else {
        setModalType("success");
        setModalMessage("Employee SUCCESSFULLY Registered");
        setData({
          name: "",
          role_id: "",
          department_id: "",
          supervisor_id: "",
          fname: "",
          lname: "",
          email: "",
          phone: "",
          sex: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setModalType("error");
      setModalMessage("An error occurred during registration.");
    }
    setShowModal(true);
  };

  return (
    <main id="main" className="employee-registration main">
      <div className="pagetitle">
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#">Admin</a></li>
            <li className="breadcrumb-item active">User Registration</li>
          </ol>
        </nav>
      </div>

      <section className="the-form section">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">User Registration</h5>

                <form onSubmit={submit}>
                  <div className="form-group mb-3">
                    <label>First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fname"
                      value={data.fname}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lname"
                      value={data.lname}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={data.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Sex</label>
                    <select
                      name="sex"
                      className="form-control"
                      value={data.sex}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Select sex</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>

                  <div className="form-group mb-3">
                    <label>User Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Department</label>
                    <select
                      name="department_id"
                      className="form-control"
                      value={data.department_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option key={department.department_id} value={department.department_id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-3">
                    <label>Role</label>
                    <select
                      name="role_id"
                      className="form-control"
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
{/* 
                  <div className="form-group mb-3">
                    <label>Supervisor (Optional)</label>
                    <select
                      name="supervisor_id"
                      className="form-control"
                      value={data.supervisor_id}
                      onChange={handleChange}
                    >
                      <option value="">Select a supervisor (Optional)</option>
                      {supervisors.map((supervisor) => (
                        <option key={supervisor.employee_id} value={supervisor.employee_id}>
                          {supervisor.name}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalType === "success" ? "Success" : "Error"}</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalMessage}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default EmployeeRegistration;
