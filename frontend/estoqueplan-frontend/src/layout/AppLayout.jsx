import * as React from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar, { drawerSizes } from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom";

export default function AppLayout({ children, title, onLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopOpen, setDesktopOpen] = React.useState(true);
  const navigate = useNavigate();

  const toggleMobile = () => setMobileOpen((p) => !p);
  const toggleDesktop = () => setDesktopOpen((p) => !p);

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerWidth = desktopOpen ? drawerSizes.drawerWidthOpen : drawerSizes.drawerWidthClosed;

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar
        title={title}
        onOpenMobileMenu={toggleMobile}
        onToggleDesktop={toggleDesktop}
        desktopOpen={desktopOpen}
        onLogout={onLogout}
      />

      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={toggleMobile}
        desktopOpen={desktopOpen}
        onToggleDesktop={toggleDesktop}
        onNavigate={handleNavigate}
      />


      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: `${drawerWidth}px` },
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          bgcolor: "#f6f7fb",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
