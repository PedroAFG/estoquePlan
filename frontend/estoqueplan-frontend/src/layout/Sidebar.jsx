import * as React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";

import { AccountBalanceWallet, AttachMoneyOutlined } from "@mui/icons-material";

export const drawerSizes = {
  drawerWidthOpen: 240,
  drawerWidthClosed: 72,
};

// ✅ Paths reais (NUNCA deixe path="")
const menuItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Produtos", icon: <Inventory2Icon />, path: "/produtos" },
  { label: "Vendas", icon: <PointOfSaleIcon />, path: "/vendas" },
  { label: "Títulos Financeiros", icon: <AttachMoneyOutlined />, path: "/financeiro/titulos" },
  { label: "Gestão do Caixa", icon: <AccountBalanceWallet />, path: "/financeiro/caixa" },
];

// ✅ selected correto (evita startsWith("") e evita "/" selecionando tudo)
function isSelected(currentPath, itemPath) {
  if (!itemPath) return false;
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
  desktopOpen,
  onToggleDesktop,
  onNavigate,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const drawerWidth = desktopOpen
    ? drawerSizes.drawerWidthOpen
    : drawerSizes.drawerWidthClosed;

  const handleItemClick = (path) => {
    if (!path) return;

    if (onNavigate) onNavigate(path);

    // ✅ mobile fecha sozinho
    if (isMobile && onCloseMobile) onCloseMobile();
  };

  const content = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Topo do drawer */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: desktopOpen ? "space-between" : "center",
          px: 1,
        }}
      >
        {/* Toggle só no desktop */}
        {!isMobile && (
          <IconButton
            onClick={onToggleDesktop}
            aria-label={desktopOpen ? "Fechar sidebar" : "Abrir sidebar"}
          >
            {desktopOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ flex: 1 }}>
        {menuItems.map((it) => {
          const selected = isSelected(location.pathname, it.path);

          const btn = (
            <ListItemButton
              key={it.path}
              selected={selected}
              onClick={() => handleItemClick(it.path)}
              sx={{
                minHeight: 48,
                justifyContent: desktopOpen ? "initial" : "center",
                px: 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: desktopOpen ? 2 : 0,
                  justifyContent: "center",
                }}
              >
                {it.icon}
              </ListItemIcon>

              {desktopOpen && <ListItemText primary={it.label} />}
            </ListItemButton>
          );

          // Tooltip quando colapsado no desktop
          return !isMobile && !desktopOpen ? (
            <Tooltip key={it.path} title={it.label} placement="right">
              {btn}
            </Tooltip>
          ) : (
            btn
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 1 }} />
    </Box>
  );

  // ✅ Mobile = Drawer temporário
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerSizes.drawerWidthOpen,
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  // ✅ Desktop = Drawer permanente colapsável
  return (
    <Drawer
      variant="permanent"
      open={desktopOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
    >
      {content}
    </Drawer>
  );
}