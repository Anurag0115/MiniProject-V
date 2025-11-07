import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Person,
} from "@mui/icons-material";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData({ email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          role: activeTab === 0 ? "user" : "admin",
        }
      );

      const { access_token } = response.data;
      login(access_token);

      if (activeTab === 0) {
        navigate("/user-dashboard");
      } else {
        navigate("/admin-dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(45deg, #FF69B4 30%, #87CEEB 90%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please login to continue
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 4, width: "100%", maxWidth: 400 }}
          >
            <Tab icon={<Person />} label="User Login" iconPosition="start" />
            <Tab
              icon={<AdminPanelSettings />}
              label="Admin Login"
              iconPosition="start"
            />
          </Tabs>

          {/* Login Form */}
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <Typography variant="body1" sx={{ mt: 2 }}>
              Don't have an account?{" "}
              <Link
                component="button"
                variant="body1"
                onClick={() => navigate("/signup")}
                sx={{ textDecoration: "none" }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>

          {/* Information Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {activeTab === 0 ? "Student Portal" : "Admin Dashboard"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {activeTab === 0
                ? "Access the student portal to report issues and track status"
                : "Manage reports, view analytics, and maintain facilities"}
            </Typography>
          </Box>

          {/* Back to Home Button */}
          <Button variant="outlined" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
