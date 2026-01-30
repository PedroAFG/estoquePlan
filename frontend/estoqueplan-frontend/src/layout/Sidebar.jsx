import * as React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

const drawerWidthOpen = 240;
const drawerWidthClosed = 72;

export default function Sidebar({ mobileOpen, onCloseMobile, desktopOpen, onNavigate }) {
  const menu = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Produtos", icon: <Inventory2Icon />, path: "/produtos" },
    { label: "Vendas", icon: <PointOfSaleIcon />, path: "/vendas" },
  ];

  const content = (
    <Box>
      <Toolbar />
      <Divider />
      <List sx={{ pt: 1 }}>
        {menu.map((item) => (
          <Tooltip key={item.path} title={!desktopOpen ? item.label : ""} placement="right">
            <ListItemButton
              onClick={() => onNavigate(item.path)}
              sx={{
                justifyContent: desktopOpen ? "initial" : "center",
                px: desktopOpen ? 2 : 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: desktopOpen ? 2 : "auto" }}>
                {item.icon}
              </ListItemIcon>
              {desktopOpen && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidthOpen },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop - colapsável */}
      <Drawer
        variant="permanent"
        open={desktopOpen}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            overflowX: "hidden",
            width: desktopOpen ? drawerWidthOpen : drawerWidthClosed,
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export const drawerSizes = { drawerWidthOpen, drawerWidthClosed };