import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel,
  Stack,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Warning as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Person as UserIcon,
  Business as BuildingIcon,
  Search as SearchIcon,
  Mail as MailIcon,
  Edit as EditIcon,
  MoreHoriz as MoreHorizontalIcon,
  CalendarToday as CalendarIcon,
  Add as PlusIcon,
  BarChart as BarChart3Icon,
  KeyboardArrowDown as ChevronDownIcon,
  Schedule as ClockIcon,
  LocationOn as MapPinIcon,
  PersonAdd as UserPlusIcon,
  FilterList as FilterIcon,
  Notifications as BellIcon,
  Security as ShieldIcon,
  Storage as DatabaseIcon,
  Language as GlobeIcon,
  PhoneAndroid as SmartphoneIcon,
  Save as SaveIcon,
  Refresh as RefreshCwIcon,
  GetApp as DownloadIcon,
  Upload as UploadIcon,
  Delete as Trash2Icon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  ToggleOn as ToggleIcon,
  Close as CloseIcon,
  BugReportOutlined,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const AdminDashboard = () => {
  // Tab and UI states
  const [activeTab, setActiveTab] = useState("reports");
  const [filterRole, setFilterRole] = useState("all");
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openAddTask, setOpenAddTask] = useState(false);

  // Data states
  const [liveIssues, setLiveIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState([]);
  const [adminUpdates, setAdminUpdates] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeIssues: 0,
    resolvedToday: 0,
    resolvedTrendPercentage: 0,
  });

  // Settings states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });

  const [newTask, setNewTask] = useState({
    task: "",
    location: "",
    date: "",
    time: "",
    assignedTo: "",
    priority: "medium",
    status: "pending",
  });

  // Fetch data from backend
  useEffect(() => {
    fetchDashboardData();
    fetchAdminUpdates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch reports from MongoDB
      const reportsResponse = await fetch("http://localhost:5000/api/reports");
      const reportsData = await reportsResponse.json();

      // Transform the reports data to match our UI structure
      const transformedIssues = reportsData.map((report) => ({
        _id: report._id,
        type: report.issueType,
        priority: report.priority || "MEDIUM",
        title: report.details,
        location: report.location,
        time: new Date(report.timestamp).toLocaleString(),
        status: report.status || "pending",
        reportedBy: report.reportedBy || "Anonymous",
      }));

      setLiveIssues(transformedIssues);

      // Update dashboard stats
      setDashboardStats({
        activeIssues: transformedIssues.filter(
          (issue) => issue.status === "pending"
        ).length,
        resolvedToday: transformedIssues.filter((issue) => {
          const today = new Date().toDateString();
          const issueDate = new Date(issue.time).toDateString();
          return issue.status === "resolved" && issueDate === today;
        }).length,
        resolvedTrendPercentage: 15, // You can calculate this based on historical data
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Implement error handling/notification
    }
  };

  const fetchAdminUpdates = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/updates");
      setAdminUpdates(response.data);
    } catch (error) {
      console.error("Error fetching admin updates:", error);
    }
  };

  const handleResolve = async (report) => {
    try {
      // First, update the report status
      const resolveResponse = await axios.post(
        `http://localhost:5000/api/reports/${report._id}/resolve`
      );

      if (resolveResponse.status === 200) {
        // Then, add to admin updates
        await axios.post("http://localhost:5000/api/admin/resolve", {
          reportId: report._id,
          issueType: report.type,
          location: report.location,
        });

        // Remove the resolved issue from the live issues list
        setLiveIssues((prevIssues) =>
          prevIssues.filter((issue) => issue._id !== report._id)
        );

        // Fetch updated admin updates
        fetchAdminUpdates();

        console.log("Report resolved successfully");
      }
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  const handleAddUserOpen = () => {
    setOpenAddUser(true);
  };

  const handleAddUserClose = () => {
    setOpenAddUser(false);
    setNewUser({
      name: "",
      email: "",
      role: "student",
      password: "",
    });
  };

  const handleAddUserSubmit = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        handleAddUserClose();
        // TODO: Show success notification
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // TODO: Show error notification
    }
  };

  const handleNewUserChange = (field) => (event) => {
    setNewUser({
      ...newUser,
      [field]: event.target.value,
    });
  };

  const handleAddTaskOpen = () => {
    setOpenAddTask(true);
  };

  const handleAddTaskClose = () => {
    setOpenAddTask(false);
    setNewTask({
      task: "",
      location: "",
      date: "",
      time: "",
      assignedTo: "",
      priority: "medium",
      status: "pending",
    });
  };

  const handleAddTaskSubmit = async () => {
    try {
      const response = await fetch("/api/maintenance/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setMaintenanceSchedule([...maintenanceSchedule, createdTask]);
        handleAddTaskClose();
        // TODO: Show success notification
      } else {
        throw new Error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      // TODO: Show error notification
    }
  };

  const handleTaskChange = (field) => (event) => {
    setNewTask({
      ...newTask,
      [field]: event.target.value,
    });
  };

  const renderReportsManagement = () => null;

  const renderUserManagement = () => (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}
    >
      <Paper>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6">User Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage student and staff accounts
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<UserPlusIcon />}
              onClick={handleAddUserOpen}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          ></Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={
                          user.role === "Admin"
                            ? "primary"
                            : user.role === "Facility Manager"
                            ? "secondary"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.reports}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MailIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MoreHorizontalIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Add User Dialog */}
      <Dialog
        open={openAddUser}
        onClose={handleAddUserClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.name}
              onChange={handleNewUserChange("name")}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newUser.email}
              onChange={handleNewUserChange("email")}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={handleNewUserChange("password")}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={handleNewUserChange("role")}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                {/* <MenuItem value="facility">Facility Manager</MenuItem> */}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddUserClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddUserSubmit}
            disabled={!newUser.name || !newUser.email || !newUser.password}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderFacilityStatus = () => null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 3,
        width: "100vw",
        boxSizing: "border-box",
        display: "flex",
      }}
    >
      {/* Left Side Tabs */}
      <Box
        sx={{
          width: 200,
          bgcolor: "white",
          borderRight: 1,
          borderColor: "divider",
          py: 2,
        }}
      >
        <Tabs
          orientation="vertical"
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              alignItems: "flex-start",
              textAlign: "left",
              px: 3,
              py: 2,
              "&.Mui-selected": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            },
          }}
        >
          <Tab
            label="Reports"
            value="reports"
            icon={<BugReportOutlined />}
            iconPosition="start"
            sx={{ minHeight: "48px" }}
          />
          <Tab
            label="Users"
            value="users"
            icon={<UserIcon />}
            iconPosition="start"
            sx={{ minHeight: "48px" }}
          />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, px: 3 }}>
        {activeTab === "reports" && (
          <>
            {/* Stats cards grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Active Issues
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {dashboardStats.activeIssues}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resolved Today
                    </Typography>
                    <Typography variant="h3" color="success.main">
                      {dashboardStats.resolvedToday}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Resolution Rate
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h3" color="info.main">
                        {dashboardStats.resolvedTrendPercentage}%
                      </Typography>
                      <TrendingUpIcon color="success" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Live Issue Reports */}
            <Paper
              sx={{
                width: "100%",
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: 1,
                  borderColor: "divider",
                  background: "linear-gradient(135deg, #FAFBFC 0%, #F7F9FC 100%)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AlertTriangleIcon color="warning" />
                  <Typography variant="h6" fontWeight="600">
                    Live Issue Reports
                  </Typography>
                </Stack>
              </Box>
              <Box>
                {liveIssues.length > 0 ? (
                  liveIssues.map((issue) => (
                    <Box
                      key={issue._id}
                      sx={{
                        p: 3,
                        borderBottom: 1,
                        borderColor: "divider",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#FAFBFC",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Chip
                              label={issue.priority}
                              size="small"
                              sx={{
                                bgcolor:
                                  issue.priority === "HIGH"
                                    ? "error.lighter"
                                    : issue.priority === "MEDIUM"
                                    ? "warning.lighter"
                                    : "success.lighter",
                                color:
                                  issue.priority === "HIGH"
                                    ? "error.main"
                                    : issue.priority === "MEDIUM"
                                    ? "warning.main"
                                    : "success.main",
                                fontWeight: 500,
                                "& .MuiChip-label": { px: 2 },
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                bgcolor: "grey.100",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.8rem",
                              }}
                            >
                              {issue.type}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1, fontWeight: 500 }}
                          >
                            {issue.title}
                          </Typography>
                          <Stack direction="row" spacing={3}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <MapPinIcon
                                fontSize="small"
                                sx={{ color: "grey.500" }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {issue.location}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <ClockIcon
                                fontSize="small"
                                sx={{ color: "grey.500" }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {issue.time}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleResolve(issue)}
                          sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            "&:hover": {
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                          }}
                        >
                          Resolve
                        </Button>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      No live issues at the moment
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Admin Updates Section */}
            <Paper
              sx={{
                width: "100%",
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderBottom: 1,
                  borderColor: "divider",
                  background: "linear-gradient(135deg, #FAFBFC 0%, #F7F9FC 100%)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h6" fontWeight="600">
                    Admin Updates
                  </Typography>
                </Stack>
              </Box>
              <Box>
                {adminUpdates.length > 0 ? (
                  adminUpdates.map((update) => (
                    <Box
                      key={update._id}
                      sx={{
                        p: 3,
                        borderBottom: 1,
                        borderColor: "divider",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#FAFBFC",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              bgcolor: "grey.100",
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: "0.8rem",
                              display: "inline-block",
                              mb: 1,
                            }}
                          >
                            {update.issueType}
                          </Typography>
                          <Stack direction="row" spacing={3}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <MapPinIcon
                                fontSize="small"
                                sx={{ color: "grey.500" }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {update.location}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <ClockIcon
                                fontSize="small"
                                sx={{ color: "grey.500" }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(update.timestamp).toLocaleString()}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Box>
                        <Chip
                          label="Resolved"
                          color="success"
                          size="small"
                          sx={{
                            fontWeight: 500,
                            "& .MuiChip-label": { px: 2 },
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      No resolved issues yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </>
        )}
        {activeTab === "users" && renderUserManagement()}
      </Box>

      {/* Add Task Dialog */}
      <Dialog
        open={openAddTask}
        onClose={handleAddTaskClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Add Maintenance Task
            <IconButton onClick={handleAddTaskClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Task Name"
              value={newTask.task}
              onChange={handleTaskChange("task")}
              placeholder="e.g., Restocking Supplies"
            />
            <TextField
              fullWidth
              label="Location"
              value={newTask.location}
              onChange={handleTaskChange("location")}
              placeholder="e.g., Science Building - Floor 2"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={newTask.date}
                  onChange={handleTaskChange("date")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={newTask.time}
                  onChange={handleTaskChange("time")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Assigned To"
              value={newTask.assignedTo}
              onChange={handleTaskChange("assignedTo")}
              placeholder="e.g., Maintenance Team A"
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={handleTaskChange("priority")}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newTask.status}
                label="Status"
                onChange={handleTaskChange("status")}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddTaskClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTaskSubmit}
            disabled={
              !newTask.task ||
              !newTask.location ||
              !newTask.date ||
              !newTask.assignedTo
            }
            startIcon={<PlusIcon />}
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
