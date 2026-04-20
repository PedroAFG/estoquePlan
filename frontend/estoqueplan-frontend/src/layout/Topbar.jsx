import * as React from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import {
  breadcrumbNameMap,
  clickableBreadcrumbs,
} from "../utils/breadcrumbMap";
import apiService from "../services/api";

function formatBreadcrumbLabel(texto) {
  if (!texto) return "";

  return texto
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export default function Topbar({
  drawerWidth = 240,
  onOpenMobileMenu,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Erro ao chamar endpoint de logout:", error);
    } finally {
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  const pathnames = location.pathname.split("/").filter(Boolean);

  const breadcrumbItems = pathnames
    .map((segmento, index) => {
      const to = `/${pathnames.slice(0, index + 1).join("/")}`;
      const label = breadcrumbNameMap[to] || formatBreadcrumbLabel(segmento);
      const clickable = clickableBreadcrumbs.includes(to);

      return { to, label, clickable };
    })
    .filter((item, index, array) => {
      const isLast = index === array.length - 1;

      if (isLast) return true;
      return item.clickable;
    });

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ml: { md: `${drawerWidth}px` },
        width: { md: `calc(100% - ${drawerWidth}px)` },
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onOpenMobileMenu}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            color: "inherit",
            "& .MuiBreadcrumbs-separator": {
              color: "inherit",
              opacity: 0.7,
            },
          }}
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            if (!isLast && item.clickable) {
              return (
                <Link
                  key={item.to}
                  underline="hover"
                  color="inherit"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(item.to)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <Typography
                key={item.to}
                color="inherit"
                sx={{ fontWeight: isLast ? 600 : 400 }}
              >
                {item.label}
              </Typography>
            );
          })}
        </Breadcrumbs>

        <Box sx={{ flexGrow: 1 }} />

        <Button color="inherit" onClick={handleLogout}>
          SAIR
        </Button>
      </Toolbar>
    </AppBar>
  );
}