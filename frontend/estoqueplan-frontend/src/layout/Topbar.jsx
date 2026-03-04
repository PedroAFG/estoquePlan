import * as React from "react";
import { AppBar, IconButton, Toolbar, Typography, Box, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function Topbar({
  title = "estoquePlan",
  drawerWidth = 240,          // ✅ novo
  onOpenMobileMenu,
  onToggleDesktop,
  desktopOpen,
  onLogout,
}) {
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,  // ✅ fica acima do Drawer
        ml: { md: `${drawerWidth}px` },              // ✅ empurra no desktop
        width: { md: `calc(100% - ${drawerWidth}px)` }, // ✅ reduz largura no desktop
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
      }}
    >
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