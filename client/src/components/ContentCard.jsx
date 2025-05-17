/**
 * For use for cards that require more space (e.g. charts)
 */

import {
  Box,
  Card,
  Typography,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Icon from '@mui/material/Icon';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RestockCard from "./RestockCard.jsx";

import placeholderimg from "../assets/placeholder-img.jpg"

import "../styles/Dashboard.css"


const ContentCard = ({header, content}) => {
  return (
    <Card
      sx={{
        display: "flex",
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
          flexDirection: "column",
          rowGap: "0.5rem"
        }}
      >
        <Typography
          sx={{
            color: "gray",
            fontWeight: 500
          }}
        >
        {header}
        </Typography>
        
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around"
          }}
        >
            {content}
        </Box>
      </Box>
    </Card>
  )
}

export default ContentCard