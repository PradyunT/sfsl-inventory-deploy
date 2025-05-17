import { Box, Card, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PopularItemCard = ({ purchaseData, itemName, dateChanged }) => {
  // Render custom tooltip
  const renderTooltip = (props) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography>
            <b>{name}</b>
          </Typography>
          <Typography>{`Units Sold: ${value}`}</Typography>
        </div>
      );
    }
    return null;
  };

  // Get the highest value item for the header display
  const highestValueItem = purchaseData.reduce(
    (max, current) => (current.value > max.value ? current : max),
    purchaseData[0],
  );

  return (
    <Card
      sx={{
        padding: "2rem 1.5rem",
        border: "solid rgba(108, 115, 108, 0.2)",
        boxShadow: "unset",
        borderRadius: "1.5rem",
        borderWidth: "0.1rem",
        display: "flex",
        flexDirection: "column",
        rowGap: "0.3rem",
        height: { xs: "fit-content", md: "auto" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          color: "gray",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Mobile Header */}
        <div className="md:hidden">
          <Typography sx={{ fontWeight: 500 }}>Most Purchased Item</Typography>
        </div>
        {/* Larger Screen Header */}
        <div className="hidden md:block">
          <Typography sx={{ fontWeight: 500 }}>
            Most Purchased Items {dateChanged ? "During the Time Period" : "This Week"}
          </Typography>
          <TrendingUpIcon />
        </div>
      </Box>
      <Typography variant="h4" sx={{ fontSize: { xs: "1.8rem", md: "2rem" } }}>
        <b>{itemName || highestValueItem?.name || "No Data"}</b>
      </Typography>
      {purchaseData && purchaseData.length !== 0 ? (
        <div className="hidden md:block w-[100%] min-h-[16rem] pt-[1rem]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth="12rem"
            minHeight="14rem"
          >
            <BarChart data={purchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: "0.75rem" }} />
              <YAxis tick={{ fontSize: "0.75rem" }} />
              <Tooltip content={renderTooltip} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Typography variant="h6" color="gray">
          No purchase data available for this time period
        </Typography>
      )}
    </Card>
  );
};

export default PopularItemCard;
