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
import LeavePageE from "./components/EmployeeDashboard/Leaves";
import EmployeeAttendance from "./components/EmployeeDashboard/Attendance";
import EmployeeSettings from "./components/EmployeeDashboard/Settings";
import DashboardEmp from "./components/EmployeeDashboard/DashboardEmp";
import MyProfile from "./components/EmployeeDashboard/MyProfile";

// Protected Route Component
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoutes";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import NotFound from "./pages/NotFound";
import EmployeeAttendanceList from "./components/EmployeeDashboard/attendanceUtils/EmployeeAttendanceList";
import EmployeeProfile from "./components/AdminDashboard/EmployeeProfile";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard";
import DashboardManager from "./components/ManagerDashboard/DashboardManager";
import ManagerLeaves from "./components/ManagerDashboard/ManagerLeaves";
import ManagerAttendance from "./components/ManagerDashboard/AttendanceM";
import ManagerPayroll from "./components/ManagerDashboard/PayrollM";
import ManagerSetting from "./components/ManagerDashboard/ManagerSetting";
import EmployeeM from "./components/ManagerDashboard/EmployeeM";
import DepartmentM from "./components/ManagerDashboard/DepartmentM";
import EmployeProfileM from "./components/ManagerDashboard/EmployeProfileM";
import MyProfileM from "./components/ManagerDashboard/MyProfileM";
import WorkReportM from "./components/ManagerDashboard/WorkReportM";
import WorkReports from "./components/AdminDashboard/WorkReports";
import WorkReportE from "./components/EmployeeDashboard/WorkReportE";
import Payrole from "./components/EmployeeDashboard/Payroll";
import ManagerAttendanceList from "./components/ManagerDashboard/attendanceUtils/ManagerAttendanceList";
import WorkReportForm from "./components/EmployeeDashboard/workReports/WorkReportForm";
import WorkReportDetail from "./components/ManagerDashboard/workreport/WorkReportDetails";
import AdminEmployeAttendaceView from "./components/AdminDashboard/attendanceUtils/AdminEmployeAttendaceView";
import SingleDepartment from "./components/AdminDashboard/departmentUtils/SingleDepartment";
import EmployePayroll from "./components/AdminDashboard/payrollUtils/EmployePayroll";
import LeaveForm from "./components/EmployeeDashboard/leaves/LeaveForm";
import Rooster from "./components/AdminDashboard/Rooster";
import RosterE from "./components/EmployeeDashboard/RosterE";



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/404" element={<NotFound />} />

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
          <Route path="leaves" element={<LeavePageE />} />
          <Route path="leaves/leave-application" element={<LeaveForm />} />
          <Route path="leaves/edit/:id" element={<LeaveForm />} />
          <Route path="leaves/view/:id" element={<LeaveForm />} />
          <Route path="roster" element={<RosterE />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="attendance-list" element={<EmployeeAttendanceList />} />
          <Route path="settings" element={<EmployeeSettings />} />
          <Route path="payroll" element={<Payrole />} />
          <Route path="workreports" element={<WorkReportE />} />
          <Route path="workreports/view/:id" element={<WorkReportForm />} />
          <Route path="workreports/edit/:id" element={<WorkReportForm />} />
          <Route path="workreports/add-work-report" element={<WorkReportForm />} />
          <Route path="profile/:id" element={<MyProfile />} />

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
          <Route path="department/:id" element={<SingleDepartment />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="employee" element={<Employee />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="rooster" element={<Rooster />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="attendance/:id" element={<AdminEmployeAttendaceView />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="employee/payroll/:id" element={<EmployePayroll />} />
          <Route path="workreports" element={<WorkReports />} />
          <Route path="/admin/workreports/:id" element={<WorkReportDetail />} />
          <Route path="settings" element={<Setting />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="employee/:id" element={<EmployeeProfile />} />
        </Route>

        {/* Protected Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardManager />} />
          <Route path="department" element={<DepartmentM />} />
          <Route path="employee" element={<EmployeeM />} />
          <Route path="employeeprofile" element={<EmployeProfileM />} />
          <Route path="myprofile" element={<MyProfileM />} />
          <Route path="leaves" element={<ManagerLeaves />} />
          <Route path="attendance" element={<ManagerAttendance />} />
          <Route path="attendance-list" element={<ManagerAttendanceList />} />
          <Route path="payroll" element={<ManagerPayroll />} />
          <Route path="settings" element={<ManagerSetting />} />
          <Route path="workreports" element={<WorkReportM />} />
          <Route path="/manager/workreports/:id" element={<WorkReportDetail />} />
          <Route path="employee/:id" element={<EmployeeProfile />} />
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
