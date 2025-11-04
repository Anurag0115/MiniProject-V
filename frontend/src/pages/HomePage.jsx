import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  Fade,
  Zoom,
  IconButton,
  useScrollTrigger,
  Fab,
} from "@mui/material";
import {
  BugReportOutlined,
  DashboardOutlined,
  Security,
  Analytics,
  KeyboardArrowUp,
  PlayArrow,
} from "@mui/icons-material";

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

// Feature card component
const FeatureCard = ({ icon, title, description, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={isVisible} timeout={1000}>
      <Card
        sx={{
          height: "100%",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          transition: "all 0.3s ease",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            transform: "translateY(-8px)",
            background: "rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
              "& svg": {
                fontSize: "3rem",
                color: "white",
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
              },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 600,
              mb: 1,
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              lineHeight: 1.5,
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

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

function HomePage() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  const features = [
    {
      icon: <Security />,
      title: "Anonymous Reporting",
      description:
        "Report issues safely and anonymously with complete privacy protection.",
    },
    {
      icon: <Analytics />,
      title: "Real-time Analytics",
      description:
        "Track and monitor facility status with comprehensive data insights.",
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, position: "relative" }}>
      {/* Enhanced Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          pt: 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.5rem",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                },
              }}
              onClick={() => navigate("/")}
            >
              MenstruCare
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                startIcon={<BugReportOutlined />}
                onClick={() => navigate("/report")}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "1rem",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                Report Issue
              </Button>
              <Button
                startIcon={<DashboardOutlined />}
                onClick={() => navigate("/login")}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "1rem",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  textTransform: "none",
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.3)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section with Animated Background */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #F48FB1 0%, #FF80AB 25%, #90CAF9 50%, #EC407A 75%, #F48FB1 100%)",
          minHeight: "100vh",
          width: "100vw",
          pt: 15,
          pb: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)",
            zIndex: 0,
          },
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              maxWidth: "900px",
              mx: "auto",
              textAlign: "center",
              mb: 12,
            }}
          >
            <Fade in={heroVisible} timeout={1000}>
              <Typography
                variant="h1"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "3rem", sm: "4rem", md: "5.5rem" },
                  lineHeight: 1.1,
                  mb: 3,
                  letterSpacing: "-0.02em",
                  textShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
                  background: "linear-gradient(45deg, #fff, #f0f0f0)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Empowering
                <br />
                Menstrual Dignity
                <br />
                in Education
              </Typography>
            </Fade>

            <Fade in={heroVisible} timeout={1500}>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "1.3rem",
                  mb: 6,
                  maxWidth: "650px",
                  lineHeight: 1.6,
                  mx: "auto",
                  textShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                A comprehensive digital platform for anonymous reporting,
                real-time monitoring, and improving menstrual hygiene
                infrastructure in educational institutions.
              </Typography>
            </Fade>

            <Fade in={heroVisible} timeout={2000}>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    color: "#F48FB1",
                    textTransform: "none",
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    minWidth: 140,
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "white",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 35px rgba(0, 0, 0, 0.25)",
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  sx={{
                    color: "white",
                    textTransform: "none",
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    minWidth: 140,
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.2)",
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  Watch Demo
                </Button>
              </Box>
            </Fade>
          </Box>

          {/* Features Section integrated into hero */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                mb: 2,
                textShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              Why Choose MenstruCare?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6,
                textShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              Comprehensive solutions for menstrual health management in
              educational institutions
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 200}
                />
              </Grid>
            ))}
          </Grid>

          {/* Call to Action integrated into hero */}
          <Box sx={{ textAlign: "center", maxWidth: "md", mx: "auto" }}>
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: "2rem", md: "3rem" },
                textShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              Ready to Make a Difference?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mb: 4,
                lineHeight: 1.6,
                textShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              Join thousands of institutions already improving menstrual health
              infrastructure
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "white",
                color: "#EC407A",
                textTransform: "none",
                borderRadius: "50px",
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 35px rgba(0, 0, 0, 0.25)",
                },
              }}
            >
              Get Started Today
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <ScrollTop>
        <Fab
          size="small"
          sx={{
            bgcolor: "#F48FB1",
            color: "white",
            boxShadow: "0 6px 20px rgba(244, 143, 177, 0.4)",
            "&:hover": {
              bgcolor: "#E91E63",
              boxShadow: "0 8px 25px rgba(244, 143, 177, 0.6)",
            },
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </Box>
  );
}

export default HomePage;
