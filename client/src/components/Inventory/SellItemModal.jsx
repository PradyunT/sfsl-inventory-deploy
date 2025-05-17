import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "1px solid #ccc",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

const initialSaleState = {
  itemChosen: "",
  quantity: "",
  gender: "",
  age: "",
  zipcode: "",
  neighborId: "",
  name: "",
  dob: "",
};

function SellItemModal({ open, onClose, availableItems }) {
  const [newSale, setNewSale] = useState(initialSaleState);
  const [neighbors, setNeighbors] = useState([]);
  const [isLoadingNeighbors, setIsLoadingNeighbors] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewSale((prev) => {
      let updates = { ...prev, [name]: value };

      if (name === "neighborId") {
        const selected = neighbors.find((n) => n._id === value);
        if (selected) {
          updates.name = selected.name || "";
          updates.dob = selected.dob
            ? new Date(selected.dob).toISOString().split("T")[0]
            : "";
          updates.age = selected.age?.toString() || "";
          updates.gender = selected.gender || "";
          updates.zipcode = selected.zipcode || "";
        }
      }

      if (["gender", "age", "zipcode"].includes(name)) {
        updates.neighborId = "";
        updates.dob = "";
        updates.name = "";
      }

      return updates;
    });
  };

  useEffect(() => {
    if (!open) {
      setNeighbors([]);
      return;
    }

    const fetchNeighbors = async () => {
      setIsLoadingNeighbors(true);
      const { gender, age, zipcode } = newSale;
      const query = new URLSearchParams();
      if (gender) query.append("gender", gender);
      if (age) query.append("age", age);
      if (zipcode) query.append("zipcode", zipcode);

      try {
        const response = await axios.get(`/api/neighbors?${query.toString()}`);
        setNeighbors(
          Array.isArray(response.data.neighbors) ? response.data.neighbors : []
        );
      } catch (err) {
        console.error("Failed to fetch neighbors:", err);
        toast.error("Could not load neighbors list.");
        setNeighbors([]);
      } finally {
        setIsLoadingNeighbors(false);
      }
    };

    fetchNeighbors();
  }, [newSale.gender, newSale.age, newSale.zipcode, open]);

  const handleRecordSale = async () => {
    const {
      itemChosen,
      quantity,
      neighborId,
      name,
      dob,
      age,
      gender,
      zipcode,
    } = newSale;

    if (!itemChosen || !quantity) {
      toast.error("Please select an item and quantity.");
      return;
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }

    setIsRecording(true);
    try {
      let finalNeighborId = neighborId;

      if (!finalNeighborId) {
        if (!name || !dob || !age || !gender || !zipcode) {
          toast.error(
            "Please enter name, dob, age, gender, and zipcode for new neighbor."
          );
          setIsRecording(false);
          return;
        }

        const response = await axios.post("/api/neighbors", {
          name,
          dob,
          age,
          gender,
          zipcode,
        });
        finalNeighborId = response.data.neighbor._id;
      }

      await axios.post("/api/purchase", {
        itemId: itemChosen,
        quantity: parseInt(quantity, 10),
        neighborId: finalNeighborId,
        name,
        dob,
        age,
        gender,
        zipcode,
      });

      toast.success("Sale recorded successfully");
      handleClose();
    } catch (err) {
      console.error("Error recording sale:", err);
      const errorMsg = err.response?.data?.error || "Failed to record sale.";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsRecording(false);
    }
  };

  const handleClose = () => {
    setNewSale(initialSaleState);
    setNeighbors([]);
    onClose();
  };

  const isNewNeighbor = !newSale.neighborId && newSale.name && newSale.dob;
  const canRecord = newSale.neighborId || isNewNeighbor;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" mb={3}>
          Record Item Sale / Purchase
        </Typography>

        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <FormControl fullWidth required size="small">
                <InputLabel id="item-select-label">Item</InputLabel>
                <Select
                  labelId="item-select-label"
                  label="Item"
                  name="itemChosen"
                  value={newSale.itemChosen}
                  onChange={handleInputChange}
                >
                  <MenuItem value="" disabled>
                    Choose an item
                  </MenuItem>
                  {availableItems.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.itemName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                required
                label="Quantity"
                name="quantity"
                type="number"
                value={newSale.quantity}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Filter Neighbors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="gender-filter-label">Gender</InputLabel>
                <Select
                  labelId="gender-filter-label"
                  label="Gender"
                  name="gender"
                  value={newSale.gender}
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Non-Binary">Non-Binary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Age"
                name="age"
                type="number"
                value={newSale.age}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label="Zipcode"
                name="zipcode"
                value={newSale.zipcode}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                value={newSale.dob || ""}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                name="name"
                value={newSale.name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>

          <FormControl fullWidth size="small" disabled={isLoadingNeighbors}>
            <InputLabel id="neighbor-select-label">Select Neighbor</InputLabel>
            <Select
              labelId="neighbor-select-label"
              label="Select Neighbor"
              name="neighborId"
              value={newSale.neighborId}
              onChange={handleInputChange}
            >
              <MenuItem value="">None / Create New</MenuItem>
              {!isLoadingNeighbors && neighbors.length === 0 && (
                <MenuItem value="" disabled>
                  No neighbors match filters
                </MenuItem>
              )}
              {neighbors.map((n) => (
                <MenuItem key={n._id} value={n._id}>
                  ID: {n._id.slice(-6)} ({n.gender}, Age {n.age}, DOB{" "}
                  {new Date(n.dob).toLocaleDateString("en-CA")}, Zip {n.zipcode}
                  )
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isLoadingNeighbors && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleRecordSale}
            variant="contained"
            color="primary"
            disabled={isRecording || isLoadingNeighbors || !canRecord}
          >
            {isRecording ? "Recording..." : "Record Sale"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

SellItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  availableItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      itemName: PropTypes.string.isRequired,
      currentQuantity: PropTypes.number,
    })
  ).isRequired,
};

export default SellItemModal;
