import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Divider,
} from "@mui/material";
import {
  Favorite as HeartIcon,
  LocationOn as MapPinIcon,
  Shield as ShieldIcon,
  Notifications as BellIcon,
  Person as UserIcon,
  Add as PlusIcon,
  AccessTime as ClockIcon,
  Reply as ReplyIcon,
  Chat as MessageIcon,
  Close as CloseIcon,
  Wc as WcIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
  AccountCircle,
  Logout,
} from "@mui/icons-material";
import { Menu, MenuItem } from "@mui/material";

// Removed hardcoded data - will fetch from backend

const availableTags = [
  "hygiene",
  "privacy",
  "urgent",
  "suggestions",
  "appreciation",
  "feedback",
];

function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({
    title: "",
    description: "",
    tags: [],
  });

  const [recentReports, setRecentReports] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [adminUpdates, setAdminUpdates] = useState([]);
  const [washroomStatus, setWashroomStatus] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([
    { name: "All Posts", count: 0 },
    { name: "Hygiene", count: 0 },
    { name: "Privacy", count: 0 },
    { name: "Urgent", count: 0 },
    { name: "Suggestions", count: 0 },
    { name: "Appreciation", count: 0 },
    { name: "Feedback", count: 0 },
  ]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const getInitials = (email) => {
    if (!email) return "U";
    const parts = email.split("@");
    const namePart = parts[0];
    if (namePart.length >= 2) {
      return namePart.substring(0, 2).toUpperCase();
    }
    return namePart.charAt(0).toUpperCase();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  useEffect(() => {
    fetchReports();
    fetchResolvedReports();
    fetchWashroomStatus();
    fetchDiscussions();
    fetchDiscussionStats();
  }, [activeCategory]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchDiscussions();
    }
  }, [activeCategory, activeTab]);

  const fetchReports = async () => {
    try {
      const headers = getAuthHeaders();

      // Fetch recent reports (no auth needed)
      const recentRes = await axios.get("http://localhost:5000/api/reports");
      setRecentReports(recentRes.data);

      // Fetch my reports (requires token)
      if (headers.Authorization) {
        const myRes = await axios.get("http://localhost:5000/api/my-reports", {
          headers,
        });
        setMyReports(myRes.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchWashroomStatus = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/washroom-status");
      setWashroomStatus(response.data);
    } catch (error) {
      console.error("Error fetching washroom status:", error);
      // Set empty array on error
      setWashroomStatus([]);
    }
  };

  const fetchResolvedReports = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/updates");
      setAdminUpdates(response.data);
    } catch (error) {
      console.error("Error fetching admin updates:", error);
    }
  };

  const handleConfirmResolution = async (reportId) => {
    try {
      // Call the new backend endpoint to confirm resolution and delete from both collections
      await axios.post("http://localhost:5000/api/admin/resolve-confirm", {
        reportId,
      });

      // After successful confirmation, remove it from the adminUpdates state
      setAdminUpdates((prevUpdates) =>
        prevUpdates.filter((update) => update.reportId !== reportId)
      );
      alert("Report marked as resolved and removed.");
    } catch (error) {
      console.error("Error confirming resolution:", error);
      alert("Error confirming resolution. Please try again.");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      hygiene: "primary",
      privacy: "secondary",
      urgent: "error",
      suggestions: "info",
      appreciation: "success",
      feedback: "warning",
    };
    return colors[category] || "default";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "#4caf50"; // Green
      case "maintenance":
        return "#ff9800"; // Orange
      case "issue":
        return "#f44336"; // Red
      default:
        return "#9e9e9e"; // Grey
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />;
      case "maintenance":
        return <WarningIcon fontSize="small" sx={{ color: "#ff9800" }} />;
      case "issue":
        return <ErrorIcon fontSize="small" sx={{ color: "#f44336" }} />;
      default:
        return <WcIcon fontSize="small" sx={{ color: "#9e9e9e" }} />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTagToggle = (event, newTags) => {
    setDiscussionForm((prev) => ({
      ...prev,
      tags: newTags,
    }));
  };

  const fetchDiscussions = async () => {
    try {
      const categoryParam = activeCategory === "All Posts" ? "" : `?category=${activeCategory}`;
      const response = await axios.get(`http://localhost:5000/api/discussions${categoryParam}`);
      setDiscussions(response.data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setDiscussions([]);
    }
  };

  const fetchDiscussionStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/discussions/stats");
      const stats = response.data;
      setCategories([
        { name: "All Posts", count: stats["All Posts"] || 0 },
        { name: "Hygiene", count: stats["Hygiene"] || 0 },
        { name: "Privacy", count: stats["Privacy"] || 0 },
        { name: "Urgent", count: stats["Urgent"] || 0 },
        { name: "Suggestions", count: stats["Suggestions"] || 0 },
        { name: "Appreciation", count: stats["Appreciation"] || 0 },
        { name: "Feedback", count: stats["Feedback"] || 0 },
      ]);
    } catch (error) {
      console.error("Error fetching discussion stats:", error);
    }
  };

  const handleSubmitDiscussion = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const response = await axios.post(
        "http://localhost:5000/api/discussions",
        {
          title: discussionForm.title,
          description: discussionForm.description,
          tags: discussionForm.tags,
        },
        { headers }
      );

      if (response.data) {
        setDiscussionForm({ title: "", description: "", tags: [] });
        setIsModalOpen(false);
        fetchDiscussions();
        fetchDiscussionStats();
      }
    } catch (error) {
      console.error("Error submitting discussion:", error);
      alert("Failed to submit discussion. Please try again.");
    }
  };

  const fetchDiscussionDetails = async (discussionId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/discussions/${discussionId}`);
      setSelectedDiscussion(response.data);
    } catch (error) {
      console.error("Error fetching discussion details:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedDiscussion) return;

    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const response = await axios.post(
        `http://localhost:5000/api/discussions/${selectedDiscussion._id}/comments`,
        { text: commentText },
        { headers }
      );

      if (response.data) {
        setCommentText("");
        fetchDiscussionDetails(selectedDiscussion._id);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", width: "100vw" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HeartIcon color="primary" />
            <Typography variant="h6" color="primary" fontWeight="bold">
              <Button color="inherit" onClick={() => navigate("/")}>
                MenstruCare
              </Button>
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              startIcon={<HeartIcon />}
              color="inherit"
              onClick={() => navigate("/report")}
            >
              Report Issue
            </Button>
            {user ? (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                    }}
                  >
                    {getInitials(user.email)}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    <AccountCircle sx={{ mr: 1 }} />
                    {user.email}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 28 }}
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          sx={{
            color: "text.primary", // Change to make less transparent
            opacity: 1, // Remove transparency (was likely inherited)
            fontWeight: 700, // Make bolder
            letterSpacing: "-0.025em", // Tighter letter spacing
            mb: 1, // Margin bottom
          }}
        >
          User Dashboard
        </Typography>
        <Typography
          color="text.secondary"
          gutterBottom
          sx={{
            opacity: 0.8, // Make subtitle less transparent too
            fontWeight: 400, // Normal weight
            fontSize: "1.1rem", // Slightly larger
            // color: 'text.primary',     // Make it primary text color instead of secondary
          }}
        ></Typography>

        <Typography color="text.secondary" gutterBottom>
          Overview of facility status and recent reports
        </Typography>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
          <Tab label="Dashboard" />
          <Tab label="Discussion Forum" />
        </Tabs>

        {/* Dashboard Content */}
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Grid container spacing={4}>
              {/* Recent Reports */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <BellIcon />
                      <Typography variant="h6">Recent Reports</Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      Latest facility reports from all users
                    </Typography>

                    {/* SCROLLABLE CONTAINER - MODIFY HEIGHT HERE */}
                    <Box
                      sx={{
                        maxHeight: "400px", // Set max height (adjust as needed)
                        overflowY: "auto", // Enable vertical scrolling
                        overflowX: "hidden", // Hide horizontal scroll
                        pr: 1, // Padding right for scrollbar space
                        // Custom scrollbar styling
                        "&::-webkit-scrollbar": {
                          width: "6px", // Scrollbar width
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "#f1f1f1", // Track color
                          borderRadius: "3px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#c1c1c1", // Scrollbar color
                          borderRadius: "3px",
                          "&:hover": {
                            backgroundColor: "#a1a1a1", // Hover color
                          },
                        },
                      }}
                    >
                      {recentReports.map((report, index) => (
                        <Box
                          key={index}
                          sx={{
                            py: 2,
                            borderBottom: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Chip
                              size="small"
                              color={getSeverityColor(report.priority)}
                              label={report.priority}
                            />
                            <Typography variant="subtitle1">
                              {report.issueType}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <MapPinIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {report.location}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {report.details || "No additional details"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            gutterBottom
                          >
                            {report.timestamp &&
                              new Date(
                                report.timestamp.$date || report.timestamp
                              ).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Admin Updates */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <ShieldIcon />
                      <Typography variant="h6">Admin Updates</Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      Actions taken by administrators
                    </Typography>

                    <Box
                      sx={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "#f1f1f1",
                          borderRadius: "3px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#c1c1c1",
                          borderRadius: "3px",
                          "&:hover": {
                            backgroundColor: "#a1a1a1",
                          },
                        },
                      }}
                    >
                      {adminUpdates.length > 0 ? (
                        adminUpdates.map((update) => (
                          <Box
                            key={update._id}
                            sx={{
                              py: 2,
                              borderBottom: 1,
                              borderColor: "divider",
                              "&:last-child": {
                                borderBottom: 0,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <WcIcon fontSize="small" />
                                {update.issueType}
                              </Typography>
                              <Chip
                                label="Resolved"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                color: "text.secondary",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <MapPinIcon fontSize="small" />
                                <Typography variant="body2">
                                  {update.location}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <ClockIcon fontSize="small" />
                                <Typography variant="body2">
                                  {new Date(update.timestamp).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <Typography color="text.secondary">
                            No resolved issues at the moment
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Washroom Status */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <WcIcon />
                      <Typography variant="h6">Washroom Status</Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      Real-time status of all washroom facilities
                    </Typography>
                    {washroomStatus.length > 0 ? (
                      washroomStatus.map((washroom, index) => (
                        <Box
                          key={index}
                          sx={{ py: 2, borderBottom: 1, borderColor: "divider" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 1,
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ flex: 1 }}>
                              {washroom.name || "Unknown Location"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {getStatusIcon(washroom.status || "good")}
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  bgcolor: getStatusColor(washroom.status || "good"),
                                }}
                              />
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Chip
                              size="small"
                              label={
                                (washroom.status || "good").charAt(0).toUpperCase() +
                                (washroom.status || "good").slice(1)
                              }
                              sx={{
                                bgcolor: getStatusColor(washroom.status || "good"),
                                color: "white",
                                fontSize: "0.7rem",
                                height: "20px",
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {washroom.lastUpdated || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ textAlign: "center", py: 3 }}>
                        <Typography color="text.secondary">
                          No washroom status data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* My Reports */}
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <UserIcon />
                      My Reports
                    </Typography>
                    <Typography color="text.secondary">
                      Issues and reports you have submitted
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlusIcon />}
                    onClick={() => navigate("/report")}
                    sx={{ borderRadius: 28 }}
                  >
                    Report Issue
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {myReports.map((report, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography variant="subtitle1">
                              {report.issueType}
                            </Typography>
                            <Chip
                              size="small"
                              color={getSeverityColor(report.priority)}
                              label={report.priority}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <MapPinIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {report.location}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            {report.details || "No details provided"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {new Date(report.timestamp).toLocaleString()}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={
                              report.adminResponse ? "primary" : "warning.main"
                            }
                            fontWeight="medium"
                          >
                            {report.adminResponse ||
                              report.status ||
                              "Pending review"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Discussion Forum Content */}
        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Discussion Forum
                </Typography>
                <Typography color="text.secondary">
                  Anonymous community discussions about facility issues and
                  improvements
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlusIcon />}
                onClick={() => setIsModalOpen(true)}
                sx={{ borderRadius: 28 }}
              >
                New Discussion
              </Button>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <ToggleButtonGroup
                value={activeCategory}
                exclusive
                onChange={(e, newCategory) =>
                  setActiveCategory(newCategory || "All Posts")
                }
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                {categories.map((category) => (
                  <ToggleButton
                    key={category.name}
                    value={category.name}
                    sx={{
                      borderRadius: 28,
                      textTransform: "none",
                      "&.Mui-selected": {
                        color: "white",
                        bgcolor: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    }}
                  >
                    {category.name} ({category.count})
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {selectedDiscussion ? (
                // Discussion Detail View
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Button
                        startIcon={<ReplyIcon />}
                        onClick={() => setSelectedDiscussion(null)}
                        size="small"
                      >
                        Back to Discussions
                      </Button>
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedDiscussion.title}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                      {selectedDiscussion.tags?.map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Typography variant="body1" paragraph sx={{ whiteSpace: "pre-wrap" }}>
                      {selectedDiscussion.description}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 3, color: "text.secondary" }}>
                      <Typography variant="caption">
                        By: {selectedDiscussion.authorEmail === "anonymous" ? "Anonymous" : selectedDiscussion.authorEmail}
                      </Typography>
                      <Typography variant="caption">
                        {selectedDiscussion.createdAt &&
                          new Date(selectedDiscussion.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="caption">
                        {selectedDiscussion.commentCount || 0} comments
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      Comments ({selectedDiscussion.comments?.length || 0})
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                      {selectedDiscussion.comments?.map((comment, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            bgcolor: "grey.100",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body2" paragraph>
                            {comment.text}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2, color: "text.secondary" }}>
                            <Typography variant="caption">
                              {comment.authorEmail === "anonymous" ? "Anonymous" : comment.authorEmail}
                            </Typography>
                            <Typography variant="caption">
                              {comment.createdAt &&
                                new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {(!selectedDiscussion.comments || selectedDiscussion.comments.length === 0) && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No comments yet. Be the first to comment!
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        size="small"
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddComment}
                        disabled={!commentText.trim()}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        Post
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                // Discussion List View
                <>
                  {discussions.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No discussions yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Be the first to start a discussion!
                      </Typography>
                    </Box>
                  ) : (
                    discussions.map((discussion) => (
                      <Card
                        key={discussion._id}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { boxShadow: 4 },
                          transition: "box-shadow 0.2s",
                        }}
                        onClick={() => fetchDiscussionDetails(discussion._id)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {discussion.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {discussion.description}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                            {discussion.tags?.map((tag, idx) => (
                              <Chip
                                key={idx}
                                label={tag}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          <Box sx={{ display: "flex", gap: 2, color: "text.secondary" }}>
                            <Typography variant="caption">
                              {discussion.authorEmail === "anonymous" ? "Anonymous" : discussion.authorEmail}
                            </Typography>
                            <Typography variant="caption">
                              {discussion.createdAt &&
                                new Date(discussion.createdAt).toLocaleString()}
                            </Typography>
                            <Typography variant="caption">
                              <MessageIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                              {discussion.commentCount || 0} comments
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Container>

      {/* New Discussion Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
            Start New Discussion
            <IconButton onClick={() => setIsModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <TextField
              label="Discussion Title"
              fullWidth
              value={discussionForm.title}
              onChange={(e) =>
                setDiscussionForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={discussionForm.description}
              onChange={(e) =>
                setDiscussionForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <ToggleButtonGroup
                value={discussionForm.tags}
                onChange={handleTagToggle}
                multiple
              >
                {availableTags.map((tag) => (
                  <ToggleButton
                    key={tag}
                    value={tag}
                    sx={{
                      textTransform: "none",
                      "&.Mui-selected": {
                        color: "white",
                        bgcolor: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      },
                    }}
                  >
                    {tag}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitDiscussion}
            disabled={
              !discussionForm.title ||
              !discussionForm.description ||
              discussionForm.tags.length === 0
            }
          >
            Post Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserDashboard;
