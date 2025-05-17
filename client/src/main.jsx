import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Axios from "./pages/Axios.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory.jsx";
import Reports from "./pages/Reports.jsx";
import Layout from "./components/Layout.jsx";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import toast, { Toaster } from 'react-hot-toast';

const THEME = createTheme({
  typography: {
    fontFamily: "Poppins",
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={THEME}>
      <Router>
        <Layout>
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            {/* TODO delete after team members have seen */}
            {/* This is an example route provided by Ryan */}
            <Route path="/axios" element={<Axios />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </ThemeProvider>
  </StrictMode>
);
