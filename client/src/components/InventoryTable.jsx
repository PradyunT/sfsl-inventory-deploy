import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CollapsibleRow from "./CollapsibleRow.jsx";
import { useEffect, useState } from "react";
import axios from "axios";

export default function CollapsibleTable({
  items,
  setItems,
  isEditing,
  selected,
  setSelected,
}) {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get("/api/reports/forecast");
        if (res.data.success) {
          setPredictions(res.data.predictions || []);
        }
      } catch (err) {
        console.error("Failed to fetch forecast predictions:", err);
      }
    };

    fetchPredictions();
  }, []);

  const forecastMap = predictions.reduce((map, pred) => {
    map[String(pred.item_code)] = pred.predicted_qty;
    return map;
  }, {});

  const handleSelect = (row) => {
    setSelected((prevSelected) =>
      prevSelected.some((currRow) => currRow._id === row._id)
        ? prevSelected.filter((currRow) => currRow._id !== row._id)
        : [...prevSelected, row]
    );
  };

  const handleChange = (e, id, field) => {
    const inputValue = e.target.value;
    let newValue;

    if (field === "currentQuantity" || field === "predictedQuantity") {
      newValue = inputValue === "" ? 0 : Number(inputValue);
    } else {
      newValue = inputValue;
    }

    setItems((prevData) =>
      prevData.map((row) =>
        row._id === id ? { ...row, changed: true, [field]: newValue } : row
      )
    );
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="Inventory table">
        <TableHead sx={{ backgroundColor: "#F1F1F1" }}>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Quantity Left</TableCell>
            <TableCell align="right">Quantity Predicted</TableCell>
            <TableCell>Last Restock Date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items
            .toSorted((a, b) =>
              a.lastRestockDate >= b.lastRestockDate ? -1 : 1
            )
            .slice(0, 100)
            .map((item) => {
              const predictedQty = forecastMap[String(item.itemNo)] ?? "N/A";

              return (
                <CollapsibleRow
                  key={item._id}
                  item={{
                    ...item,
                    predictedQuantity: isEditing ? (
                      <input
                        type="number"
                        value={item.predictedQuantity || ""}
                        onChange={(e) =>
                          handleChange(e, item._id, "predictedQuantity")
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      predictedQty
                    ),
                  }}
                  isSelected={selected.some((s) => s._id === item._id)}
                  onSelect={() => handleSelect(item)}
                  isEditing={isEditing}
                  onChange={handleChange}
                />
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
