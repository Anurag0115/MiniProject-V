import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  AppBar,
  Toolbar,
  Fade,
  Zoom,
  Fab,
  useScrollTrigger,
  IconButton,
  Input,
} from "@mui/material";
import {
  BugReportOutlined,
  DashboardOutlined,
  KeyboardArrowUp,
  CloudUpload,
  Delete,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Scroll to top component
function ScrollTop({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Zoom in={trigger}>
      <Box
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        role="presentation"
        sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

// Animated background particles
const AnimatedBackground = () => {
  const particles = Array.from({ length: 20 }, (_, i) => (
    <Box
      key={i}
      sx={{
        position: "absolute",
        width: Math.random() * 6 + 4,
        height: Math.random() * 6 + 4,
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "50%",
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 2}s`,
        boxShadow: "0 4px 12px rgba(255, 255, 255, 0.1)",
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      }}
    />
  ));

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {particles}
    </Box>
  );
};

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const ReportForm = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [issueType, setIssueType] = useState("");
  const [customIssueType, setCustomIssueType] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("");
  const [details, setDetails] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  const locations = [
    "Restroom - Ground Floor(010)",
    "Restroom - First Floor(110)",
    "Restroom - Second Floor(210)",
    "Restroom - Third Floor(310)",
    "Restroom - Fourth Floor(410)",
    "Restroom - Fifth Floor(510)",
    "Restroom - Sixth Floor(610)",
  ];

  // Priority mapping based on issue type
  const priorityMapping = {
    "Empty Dispenser": "High Priority",
    "Poor Cleanliness": "Medium Priority",
    "Full Disposal Bin": "Medium Priority",
    "Privacy Issues": "High Priority",
    "Missing Supplies": "High Priority",
    "Maintenance Required": "Medium Priority",
    Other: "Low Priority",
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefilledLocation = params.get("location");
    if (prefilledLocation) {
      setLocation(prefilledLocation);
    }
    setFormVisible(true);
  }, []);

  // Auto-set priority when issue type changes
  useEffect(() => {
    if (issueType && priorityMapping[issueType]) {
      setPriority(priorityMapping[issueType]);
    }
  }, [issueType]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files");
        return;
      }

      setUploadedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(""); // Clear any previous errors
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleIssueTypeChange = (e, value) => {
    setIssueType(value);
    if (value !== "Other") {
      setCustomIssueType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponseMessage("");

    if (!issueType || !location) {
      setError("Please select issue type and location.");
      return;
    }

    if (issueType === "Other" && !customIssueType.trim()) {
      setError("Please specify the issue type in the 'Other' field.");
      return;
    }

    setIsLoading(true);

    const finalIssueType = issueType === "Other" ? customIssueType : issueType;

    // Convert image to base64 if present
    let imageBase64 = null;
    if (uploadedImage) {
      const reader = new FileReader();
      imageBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(uploadedImage);
      });
    }

    const reportData = {
      issueType: finalIssueType,
      location,
      priority,
      details,
      timestamp: new Date().toISOString(),
      image: imageBase64,
      imageName: uploadedImage ? uploadedImage.name : null,
      imageType: uploadedImage ? uploadedImage.type : null,
    };

    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers,
        body: JSON.stringify(reportData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setResponseMessage("Report submitted successfully!");
        // Clear form
        setIssueType("");
        setCustomIssueType("");
        setLocation("");
        setPriority("");
        setDetails("");
        setUploadedImage(null);
        setImagePreview(null);
        
        // Wait a brief moment to show success message, then redirect
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 1500);
      } else {
        setError(responseData.message || responseData.error || "Failed to submit report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Failed to submit report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const issueTypes = [
    "Empty Dispenser",
    "Poor Cleanliness",
    "Full Disposal Bin",
    "Privacy Issues",
    "Missing Supplies",
    "Maintenance Required",
    "Other",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(to right, #e3f2fd, #f9fbe7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom color="primary">
            Anonymous Issue Reporting
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Report menstrual hygiene issues safely and anonymously.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Issue Type
              </Typography>
              <ToggleButtonGroup
                value={issueType}
                exclusive
                onChange={handleIssueTypeChange}
                fullWidth
                sx={{ flexWrap: "wrap" }}
              >
                {issueTypes.map((type) => (
                  <StyledToggleButton key={type} value={type}>
                    {type}
                  </StyledToggleButton>
                ))}
              </ToggleButtonGroup>

              {issueType === "Other" && (
                <TextField
                  fullWidth
                  placeholder="Please specify the issue type"
                  value={customIssueType}
                  onChange={(e) => setCustomIssueType(e.target.value)}
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <TextField
                select
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="">Select a location</MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Priority is now auto-selected and displayed as read-only */}
            {priority && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Priority Level (Auto-assigned)
                </Typography>
                <TextField
                  fullWidth
                  value={priority}
                  variant="outlined"
                  disabled
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#1976d2",
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            )}

            {/* Image Upload Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Image (Optional)
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Choose Image
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </Typography>

              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": { backgroundColor: "error.dark" },
                        width: 32,
                        height: 32,
                      }}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Details (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Describe the issue..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                variant="outlined"
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {responseMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {responseMessage}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                fontWeight: 600,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#125ea2" },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Submit Anonymous Report"
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ReportForm;
