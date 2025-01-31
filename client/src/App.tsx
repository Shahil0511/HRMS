import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Hero from "./pages/Hero";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./components/AdminDashboard/Dashboard";
import Employee from "./components/AdminDashboard/Employee";
import Leaves from "./components/AdminDashboard/Leaves";
import Attendance from "./components/AdminDashboard/Attendance";
import Payroll from "./components/AdminDashboard/Payroll";
import Setting from "./components/AdminDashboard/Setting";
import AddEmployee from "./components/AdminDashboard/adminUtils/AddEmployee";
import Department from "./components/AdminDashboard/Department";
import AddDepartment from "./components/AdminDashboard/adminUtils/AddDepartment";

// Employee Pages
import EmployeeDepartment from "./components/EmployeeDashboard/Department";
import EmployeeLeaves from "./components/EmployeeDashboard/Leaves";
import EmployeeAttendance from "./components/EmployeeDashboard/Attendance";
import EmployeeSettings from "./components/EmployeeDashboard/Settings";
import DashboardEmp from "./components/EmployeeDashboard/DashboardEmp"

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import EmployeeDashboard from "./pages/EmployeeDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Auth />} />

        {/* Protected Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardEmp />} />
          <Route path="department" element={<EmployeeDepartment />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="settings" element={<EmployeeSettings />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="department" element={<Department />} />
          <Route path="employee" element={<Employee />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="settings" element={<Setting />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="add-department" element={<AddDepartment />} />
        </Route>
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </Router>
  );
};

export default App;
