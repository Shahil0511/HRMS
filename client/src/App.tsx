import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Make sure to import the CSS
import Auth from "./pages/Auth";
import Hero from "./pages/Hero";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./components/AdminDashboard/Dashboard";
import Employee from "./components/AdminDashboard/Employee";
import Leaves from "./components/AdminDashboard/Leaves";
import Attendance from "./components/AdminDashboard/Attendance";
import Payroll from "./components/AdminDashboard/Payroll";
import Setting from "./components/AdminDashboard/Setting";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/employee" element={<Employee />} />
          <Route path="/admin/leaves" element={<Leaves />} />
          <Route path="/admin/attendance" element={<Attendance />} />
          <Route path="/admin/payroll" element={<Payroll />} />
          <Route path="/admin/settings" element={<Setting />} />
        </Route>

      </Routes>


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
