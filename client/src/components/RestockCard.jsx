import { Card, Box, Typography } from "@mui/material";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";

const RestockCard = ({ lowStockCount }) => {
  return (
    <Card
      sx={{
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        border: "solid rgba(108, 115, 108, 0.2)",
        boxShadow: "unset",
        borderRadius: "1.5rem",
        borderWidth: "0.1rem",
        flexGrow: 1,
      }}
    >
      <ViewInArOutlinedIcon sx={{ fontSize: "4rem", color: "#992A1D" }} />
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography sx={{ fontWeight: "500", color: "gray" }}>
          Items Needing Restock
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: "700" }}>
          {lowStockCount}
        </Typography>
      </Box>
    </Card>
  );
};

export default RestockCard;
