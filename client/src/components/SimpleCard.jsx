import {
    Box,
    Card,
    Typography,
} from "@mui/material";

import "../styles/Dashboard.css"


const SimpleCard = ({img, header, mobileHeader, number, trend, description, icon}) => {
    return (
        <Card
            sx={{
                display: "flex",
                height: {xs: "fit-content", md: "auto"},
                flexDirection: "row",
                padding: "1.5rem 1rem",
                columnGap: "1rem",
                border: "solid rgba(108, 115, 108, 0.2)",
                boxShadow: "unset",
                borderRadius: "1.5rem",
                borderWidth: "0.1rem"
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center"
                }}
            >
                {img && <img className="hidden md:inline dashboard-card-img" src={img} alt="image"/>}
                <div className="hidden md:inline-flex">{icon && icon}</div>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "0.5rem"
                }}
            >
                {/* Mobile Header */}
                <Typography
                    sx={{
                        color: "gray",
                        fontWeight: 500,
                        display: {md: "none"}
                    }}
                >
                    {mobileHeader}
                </Typography>
                {/* Larger Screen Header */}
                <Typography
                    sx={{
                        color: "gray",
                        fontWeight: 500,
                        display: {xs: "none", md: "block"}
                    }}
                >
                    {header}
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: {xs: "column", md: "row"},
                        alignItems: {xs: "start", md: "center"},
                        justifyContent: "space-around"
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: "700",
                            fontSize: {xs: "1.8rem", md: "3.8rem"}
                        }}
                    >
                        {number}
                    </Typography>
                    <Typography
                        sx={{
                            mt: {xs: "0.5rem", md: "none"},
                            borderRadius: "1rem",
                            backgroundColor: "#E8FBE8",
                            color: "#6A846B",
                            padding: "0.1rem 0.7rem",
                            fontWeight: 600
                        }}
                    >
                        {trend}
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        color: "#6C736C99",
                        fontWeight: 300,
                        lineHeight: 1
                    }}
                >
                    {description}
                </Typography>
            </Box>
        </Card>
    )
}

export default SimpleCard