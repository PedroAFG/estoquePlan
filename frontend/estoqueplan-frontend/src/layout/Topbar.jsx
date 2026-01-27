import * as React from "react";
import { AppBar, IconButton, Toolbar, Typography, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function Topbar({
  title = "estoquePlan",
  onOpenMobileMenu,
  onToggleDesktop,
  desktopOpen,
  onLogout,
}) {
  return (
    <AppBar position="fixed" elevation={1}>
      <Toolbar>
        {/* Mobile toggle */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onOpenMobileMenu}
          sx={{ mr: 1, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop collapse toggle */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleDesktop}
          sx={{ mr: 1, display: { xs: "none", md: "inline-flex" } }}
        >
          {desktopOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>

        <Typography variant="h6" noWrap>
          {title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Button color="inherit" onClick={onLogout}>
          SAIR
        </Button>
      </Toolbar>
    </AppBar>
  );
}
