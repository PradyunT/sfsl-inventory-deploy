import {
  Box,
  Card,
  Chip,
  CardContent,
  Container,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
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

import '../styles/CardOne.css'


import sfsllogo from "../assets/sfsl-logo.png";


const CardOne = () => {
  return (
    <Card
    variant="outlined"
    sx={{
      flexGrow: 1,
      display: "flex",
      flex: "1",
      flexDirection: "column",
      borderRadius: "20px",
    }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: "row"
      }}>
        <div className="card-one-left">
          <img src={sfsllogo} alt="profile picture" />
        </div>
        <div>
          <div>
            Total number of neighbors
          </div>
          <div>
            <div>
              1284
            </div>
            <div>
              +10%
            </div>
          </div>
          <div>
            <span>120</span> more neighbors visited the pantry compared to last week
          </div>
        </div>
      </Box>
    </Card>
  )
}

export default CardOne