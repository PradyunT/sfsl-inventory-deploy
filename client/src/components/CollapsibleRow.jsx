import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import axios from "axios";

function CollapsibleRow({ item, isSelected, onSelect, isEditing, onChange }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && history.length === 0) {
      setLoading(true);
      axios
        .get(`/api/purchase/item/${item._id}`)
        .then((res) => setHistory(res.data.purchases || []))
        .catch((err) => {
          console.error("Error fetching history:", err);
          setHistory([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, item._id, history.length]);

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={() => onSelect(item._id)} />
        </TableCell>

        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          {item.itemName}
        </TableCell>
        <TableCell>{item.category}</TableCell>

        {/* Quantity Left - Editable in edit mode */}
        <TableCell align="right">
          {isEditing ? (
            <TextField
              type="number"
              value={item.currentQuantity}
              onChange={(e) => onChange(e, item._id, "currentQuantity")}
              inputProps={{ min: 0 }}
              variant="outlined"
              size="small"
              sx={{ width: "70px" }}
            />
          ) : (
            item.currentQuantity
          )}
        </TableCell>

        {/* Quantity Predicted - Always read-only */}
        <TableCell align="right">
          {item.predictedQuantity !== undefined &&
          item.predictedQuantity !== null
            ? item.predictedQuantity
            : "N/A"}
        </TableCell>

        <TableCell>
          {item.lastRestockDate ? item.lastRestockDate.split("T")[0] : "N/A"}
        </TableCell>
        <TableCell>
          <span
            className={
              item.status >= 80
                ? "text-green-500"
                : item.status >= 60
                ? "text-yellow-500"
                : item.status >= 40
                ? "text-orange-500"
                : "text-red-500"
            }
          >
            {item.status}
          </span>
        </TableCell>
      </TableRow>

      {/* Purchase History Collapsible Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle1" gutterBottom>
                Purchase History
              </Typography>

              <Table
                size="small"
                aria-label="history"
                sx={{ backgroundColor: "#FEFFED" }}
              >
                <TableHead sx={{ backgroundColor: "#E7E8D7" }}>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Start Quantity</TableCell>
                    <TableCell>End Quantity</TableCell>
                    <TableCell>Quantity Taken</TableCell>
                    <TableCell>Stock Leftover</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5}>Loading...</TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        No purchase history found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((purchase) => {
                      const matched = purchase.ItemsPurchased.find(
                        (p) => p.itemId === item._id
                      );
                      if (!matched) return null;

                      const start = matched.startQuantity;
                      const taken = matched.quantity;
                      const end = start - taken;

                      return (
                        <TableRow key={purchase._id}>
                          <TableCell>
                            {new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{start}</TableCell>
                          <TableCell>{end}</TableCell>
                          <TableCell>{taken}</TableCell>
                          <TableCell>{item.currentQuantity}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default CollapsibleRow;
