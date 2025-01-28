import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Hero from "./pages/Hero";
import EmployeeDashboard from "./pages/EmployeeDashboard";
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
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Auth />} />
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="department"
            element={
              <ProtectedRoute requiredRole="admin">
                <Department />
              </ProtectedRoute>
            }
          />
          <Route
            path="department/add-department"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee"
            element={
              <ProtectedRoute requiredRole="admin">
                <Employee />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/add-employee"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaves"
            element={
              <ProtectedRoute requiredRole="admin">
                <Leaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <ProtectedRoute requiredRole="admin">
                <Payroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <Setting />
              </ProtectedRoute>
            }
          />
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