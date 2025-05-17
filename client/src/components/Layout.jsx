import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {CssBaseline} from "@mui/material";
import ResponsiveDrawer from "./Drawer.jsx";

function Layout({ children }) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* MUI Provided CSS Baseline */}
            <CssBaseline />
            {/* The responsive drawer on the left side of the screen. It also contains the content at the top
            (including the notification icon, avatar, and user info */}
            <ResponsiveDrawer>
                {children}
            </ResponsiveDrawer>
        </LocalizationProvider>
    );
}

export default Layout;