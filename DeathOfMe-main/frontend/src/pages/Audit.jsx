import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Select,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  Warning as AlertTriangle,
  Description as FileText,
  GetApp as Download,
  CalendarToday as Calendar,
  PlayArrow as Play,
  CheckCircle,
  Close as X,
  Error as AlertCircle,
  Favorite as Heart,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  FileDownload as ExportIcon,
  Assessment as ReportIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const CampusAuditSystem = () => {
  // State management
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");
  const [facilities, setFacilities] = useState([]);
  const [auditCriteria, setAuditCriteria] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For manual refresh

  // Dialog states
  const [openNewAudit, setOpenNewAudit] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  // Form states
  const [newAuditData, setNewAuditData] = useState({
    facility: "",
    auditor: "",
    type: "full",
    notes: "",
  });

  const [scheduleData, setScheduleData] = useState({
    facility: "",
    date: "",
    time: "",
    auditor: "",
    type: "regular",
  });

  const [exportData, setExportData] = useState({
    dateRange: "all",
    format: "pdf",
    includeGraphs: true,
  });

  const [reportData, setReportData] = useState({
    facility: "",
    period: "last30",
    type: "detailed",
  });

  // Fetch all audit data
  const fetchAuditData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [facilitiesRes, criteriaRes, complianceRes] = await Promise.all([
        axios.get("http://localhost:5000/api/facilities"),
        axios.get("http://localhost:5000/api/audit-criteria"),
        axios.get("http://localhost:5000/api/compliance-items"),
      ]);

      setFacilities(facilitiesRes.data);
      setAuditCriteria(criteriaRes.data);
      setComplianceItems(complianceRes.data);
    } catch (err) {
      console.error("Error fetching audit data:", err);
      setError("Failed to load audit data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Start a new audit
  const handleStartNewAudit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/audits/new",
        {
          facilityId:
            selectedFacility === "All Facilities"
              ? null
              : facilities.find((f) => f.name === selectedFacility)?.id,
        }
      );

      // Refresh data after starting new audit
      fetchAuditData();

      // You might want to navigate to the new audit or show a success message
    } catch (err) {
      console.error("Error starting new audit:", err);
      setError("Failed to start new audit. Please try again.");
    }
  };

  // Dialog handlers
  const handleNewAuditOpen = () => setOpenNewAudit(true);
  const handleNewAuditClose = () => {
    setOpenNewAudit(false);
    setNewAuditData({ facility: "", auditor: "", type: "full", notes: "" });
  };

  const handleScheduleOpen = () => setOpenSchedule(true);
  const handleScheduleClose = () => {
    setOpenSchedule(false);
    setScheduleData({
      facility: "",
      date: "",
      time: "",
      auditor: "",
      type: "regular",
    });
  };

  const handleExportOpen = () => setOpenExport(true);
  const handleExportClose = () => {
    setOpenExport(false);
    setExportData({ dateRange: "all", format: "pdf", includeGraphs: true });
  };

  const handleReportOpen = () => setOpenReport(true);
  const handleReportClose = () => {
    setOpenReport(false);
    setReportData({ facility: "", period: "last30", type: "detailed" });
  };

  // Form submission handlers
  const handleNewAuditSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/audits/new",
        {
          facilityId:
            newAuditData.facility === "All Facilities"
              ? null
              : newAuditData.facility,
          auditor: newAuditData.auditor,
          type: newAuditData.type,
          notes: newAuditData.notes,
        }
      );
      if (response.status === 201) {
        // Assuming 201 Created for new audit
        handleNewAuditClose();
        // Refresh data
        fetchAuditData();
      }
    } catch (error) {
      console.error("Error creating new audit:", error);
      setError("Failed to start new audit. Please try again.");
    }
  };

  const handleScheduleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/audits/schedule",
        {
          facilityId:
            scheduleData.facility === "All Facilities"
              ? null
              : scheduleData.facility,
          date: scheduleData.date,
          time: scheduleData.time,
          auditor: scheduleData.auditor,
          type: scheduleData.type,
        }
      );
      if (response.status === 201) {
        // Assuming 201 Created for scheduled audit
        handleScheduleClose();
        // Refresh data
        fetchAuditData();
      }
    } catch (error) {
      console.error("Error scheduling audit:", error);
      setError("Failed to schedule audit. Please try again.");
    }
  };

  const handleExportSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/audits/export",
        {
          dateRange: exportData.dateRange,
          format: exportData.format,
          includeGraphs: exportData.includeGraphs,
        }
      );
      if (response.status === 200) {
        // Assuming 200 OK for export
        const blob = response.data; // axios already handles blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-export-${new Date().toISOString()}.${
          exportData.format
        }`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        handleExportClose();
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("Failed to export data. Please try again.");
    }
  };

  const handleReportSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/audits/report",
        {
          facilityId:
            reportData.facility === "all" ? null : reportData.facility,
          period: reportData.period,
          type: reportData.type,
        }
      );
      if (response.status === 200) {
        // Assuming 200 OK for report
        const blob = response.data; // axios already handles blob
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-report-${new Date().toISOString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        handleReportClose();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report. Please try again.");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAuditData();
  }, [refreshKey]); // refreshKey dependency for manual refresh

  const getStatusColor = (status) => {
    switch (status) {
      case "Excellent":
        return "success.main";
      case "Good":
        return "warning.main";
      case "Needs Improvement":
        return "error.main";
      default:
        return "text.secondary";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "warning";
    if (score >= 70) return "info";
    return "error";
  };

  const CircularScore = ({ score, label, size = 100 }) => (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: 3,
          borderColor: (theme) => theme.palette[getScoreColor(score)].main,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Typography variant="h4" color={getScoreColor(score)}>
          {score}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );

  const StarRating = ({ count }) => (
    <Box display="flex">
      {[...Array(5)].map((_, i) => (
        <Typography
          key={i}
          variant="h6"
          color={i < count ? "warning.main" : "text.disabled"}
        >
          ★
        </Typography>
      ))}
    </Box>
  );

  const ComplianceIcon = ({ status }) => {
    switch (status) {
      case "good":
        return <CheckCircle color="success" />;
      case "warning":
        return <AlertTriangle color="warning" />;
      case "error":
        return <X color="error" />;
      default:
        return <AlertCircle color="disabled" />;
    }
  };

  // Loading skeleton for facility card
  const FacilityCardSkeleton = () => (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ mt: 1 }}
          />
        </Box>
        <Box textAlign="right">
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={60} height={48} />
          <Skeleton variant="text" width={100} />
        </Box>
      </Box>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={3} key={i}>
            <Skeleton variant="circular" width={100} height={100} />
            <Skeleton variant="text" width={60} sx={{ mx: "auto", mt: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Campus Audit System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive facility assessments with scoring systems aligned to
              health standards and actionable improvement suggestions.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Start New Audit">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNewAuditOpen}
              >
                New Audit
              </Button>
            </Tooltip>
            <Tooltip title="Schedule Future Audit">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ScheduleIcon />}
                onClick={handleScheduleOpen}
              >
                Schedule
              </Button>
            </Tooltip>
            <Tooltip title="Export Audit Data">
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExportOpen}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Generate Audit Report">
              <Button
                variant="outlined"
                startIcon={<ReportIcon />}
                onClick={handleReportOpen}
              >
                Report
              </Button>
            </Tooltip>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Facility Audit Scores</Typography>
                <Stack direction="row" spacing={2}>
                  <Select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    size="small"
                    disabled={loading}
                  >
                    <MenuItem value="All Facilities">All Facilities</MenuItem>
                    {facilities.map((facility) => (
                      <MenuItem key={facility.id} value={facility.name}>
                        {facility.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Play />}
                    onClick={handleStartNewAudit}
                    disabled={loading}
                  >
                    New Audit
                  </Button>
                </Stack>
              </Box>

              <Stack spacing={2}>
                {loading ? (
                  // Show skeletons while loading
                  [...Array(3)].map((_, i) => <FacilityCardSkeleton key={i} />)
                ) : facilities.length === 0 ? (
                  <Alert severity="info">
                    No facilities found. Add facilities to begin auditing.
                  </Alert>
                ) : (
                  facilities
                    .filter(
                      (facility) =>
                        selectedFacility === "All Facilities" ||
                        facility.name === selectedFacility
                    )
                    .map((facility) => (
                      <Paper key={facility.id} variant="outlined" sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 3,
                          }}
                        >
                          <Box>
                            <Typography variant="h6">
                              {facility.name}
                            </Typography>
                            <Chip
                              label={facility.status}
                              color={getScoreColor(facility.overallScore)}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="body2" color="text.secondary">
                              Last audit: {facility.lastAudit}
                            </Typography>
                            <Typography variant="h4" color="primary">
                              {facility.overallScore}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Overall Score
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={3}>
                            <CircularScore
                              score={facility.scores.hygiene}
                              label="Hygiene"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CircularScore
                              score={facility.scores.supplies}
                              label="Supplies"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CircularScore
                              score={facility.scores.privacy}
                              label="Privacy"
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CircularScore
                              score={facility.scores.accessibility}
                              label="Accessibility"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Audit Criteria & Standards
              </Typography>
              <Grid container spacing={3}>
                {auditCriteria.map((category, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      sx={{ mb: 2 }}
                    >
                      {category.category}
                    </Typography>
                    {category.items.map((item, itemIndex) => (
                      <Box key={itemIndex} sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {item.percentage}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Weight: {item.weight}
                          </Typography>
                          <StarRating count={item.stars} />
                        </Box>
                      </Box>
                    ))}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileText />}
                    fullWidth
                    onClick={handleReportOpen}
                  >
                    Generate Report
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Download />}
                    fullWidth
                    onClick={handleExportOpen}
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Calendar />}
                    fullWidth
                    onClick={handleScheduleOpen}
                  >
                    Schedule Audit
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Play />}
                    fullWidth
                    onClick={handleNewAuditOpen}
                  >
                    Start Audit
                  </Button>
                </Stack>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Compliance Status
                </Typography>
                <Stack spacing={2}>
                  {complianceItems.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">{item.name}</Typography>
                      <ComplianceIcon status={item.status} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* New Audit Dialog */}
        <Dialog
          open={openNewAudit}
          onClose={handleNewAuditClose}
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
              Start New Audit
              <IconButton size="small" onClick={handleNewAuditClose}>
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={newAuditData.facility}
                  label="Facility"
                  onChange={(e) =>
                    setNewAuditData({
                      ...newAuditData,
                      facility: e.target.value,
                    })
                  }
                >
                  <MenuItem value="All Facilities">All Facilities</MenuItem>
                  {facilities.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Auditor Name"
                value={newAuditData.auditor}
                onChange={(e) =>
                  setNewAuditData({ ...newAuditData, auditor: e.target.value })
                }
              />
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Audit Type
                </Typography>
                <RadioGroup
                  value={newAuditData.type}
                  onChange={(e) =>
                    setNewAuditData({ ...newAuditData, type: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="full"
                    control={<Radio />}
                    label="Full Audit"
                  />
                  <FormControlLabel
                    value="quick"
                    control={<Radio />}
                    label="Quick Check"
                  />
                  <FormControlLabel
                    value="follow-up"
                    control={<Radio />}
                    label="Follow-up"
                  />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={newAuditData.notes}
                onChange={(e) =>
                  setNewAuditData({ ...newAuditData, notes: e.target.value })
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNewAuditClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleNewAuditSubmit}
              disabled={!newAuditData.facility || !newAuditData.auditor}
            >
              Start Audit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Audit Dialog */}
        <Dialog
          open={openSchedule}
          onClose={handleScheduleClose}
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
              Schedule Audit
              <IconButton size="small" onClick={handleScheduleClose}>
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={scheduleData.facility}
                  label="Facility"
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      facility: e.target.value,
                    })
                  }
                >
                  <MenuItem value="All Facilities">All Facilities</MenuItem>
                  {facilities.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={scheduleData.date}
                    onChange={(e) =>
                      setScheduleData({ ...scheduleData, date: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={scheduleData.time}
                    onChange={(e) =>
                      setScheduleData({ ...scheduleData, time: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Auditor Name"
                value={scheduleData.auditor}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, auditor: e.target.value })
                }
              />
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Audit Type
                </Typography>
                <RadioGroup
                  value={scheduleData.type}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, type: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="regular"
                    control={<Radio />}
                    label="Regular Audit"
                  />
                  <FormControlLabel
                    value="comprehensive"
                    control={<Radio />}
                    label="Comprehensive"
                  />
                </RadioGroup>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleScheduleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleScheduleSubmit}
              disabled={
                !scheduleData.facility ||
                !scheduleData.date ||
                !scheduleData.auditor
              }
            >
              Schedule
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog
          open={openExport}
          onClose={handleExportClose}
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
              Export Audit Data
              <IconButton size="small" onClick={handleExportClose}>
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Date Range
                </Typography>
                <RadioGroup
                  value={exportData.dateRange}
                  onChange={(e) =>
                    setExportData({ ...exportData, dateRange: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label="All Time"
                  />
                  <FormControlLabel
                    value="last30"
                    control={<Radio />}
                    label="Last 30 Days"
                  />
                  <FormControlLabel
                    value="last90"
                    control={<Radio />}
                    label="Last 90 Days"
                  />
                  <FormControlLabel
                    value="thisYear"
                    control={<Radio />}
                    label="This Year"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Export Format
                </Typography>
                <RadioGroup
                  value={exportData.format}
                  onChange={(e) =>
                    setExportData({ ...exportData, format: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="pdf"
                    control={<Radio />}
                    label="PDF"
                  />
                  <FormControlLabel
                    value="excel"
                    control={<Radio />}
                    label="Excel"
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label="CSV"
                  />
                </RadioGroup>
              </FormControl>
              <FormControlLabel
                control={
                  <Radio
                    checked={exportData.includeGraphs}
                    onChange={(e) =>
                      setExportData({
                        ...exportData,
                        includeGraphs: e.target.checked,
                      })
                    }
                  />
                }
                label="Include Graphs and Charts"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleExportSubmit}
              startIcon={<ExportIcon />}
            >
              Export
            </Button>
          </DialogActions>
        </Dialog>

        {/* Generate Report Dialog */}
        <Dialog
          open={openReport}
          onClose={handleReportClose}
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
              Generate Audit Report
              <IconButton size="small" onClick={handleReportClose}>
                <X />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={reportData.facility}
                  label="Facility"
                  onChange={(e) =>
                    setReportData({ ...reportData, facility: e.target.value })
                  }
                >
                  <MenuItem value="all">All Facilities</MenuItem>
                  {facilities.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Time Period
                </Typography>
                <RadioGroup
                  value={reportData.period}
                  onChange={(e) =>
                    setReportData({ ...reportData, period: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="last30"
                    control={<Radio />}
                    label="Last 30 Days"
                  />
                  <FormControlLabel
                    value="last90"
                    control={<Radio />}
                    label="Last 90 Days"
                  />
                  <FormControlLabel
                    value="thisYear"
                    control={<Radio />}
                    label="This Year"
                  />
                  <FormControlLabel
                    value="custom"
                    control={<Radio />}
                    label="Custom Range"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  Report Type
                </Typography>
                <RadioGroup
                  value={reportData.type}
                  onChange={(e) =>
                    setReportData({ ...reportData, type: e.target.value })
                  }
                >
                  <FormControlLabel
                    value="summary"
                    control={<Radio />}
                    label="Summary Report"
                  />
                  <FormControlLabel
                    value="detailed"
                    control={<Radio />}
                    label="Detailed Report"
                  />
                  <FormControlLabel
                    value="compliance"
                    control={<Radio />}
                    label="Compliance Report"
                  />
                </RadioGroup>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleReportClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleReportSubmit}
              startIcon={<ReportIcon />}
            >
              Generate
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CampusAuditSystem;
