// src/components/Inventory/CreateItemModal.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { createItem } from '../../api/item'; // Adjust import path as needed

// Basic styling for the modal content
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500, // Slightly wider to accommodate more fields potentially
  bgcolor: 'background.paper',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4, // Padding
};

// --- Updated Initial State ---
const initialNewItemState = {
  itemNo: '', // Added
  itemName: '',
  unit: '', // Added
  category: '',
  currentQuantity: '',
  lastRestockDate: '',
};
// --- End Updated Initial State ---

function CreateItemModal({ open, onClose, items, setItems }) {
  const [newItem, setNewItem] = useState(initialNewItemState);
  const [isCreating, setIsCreating] = useState(false);

  // Get unique categories from existing items
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // No change needed for handleDateChange

  const handleCreateItem = async () => {
    // --- Updated Validation ---
    if (!newItem.itemNo || !newItem.itemName || !newItem.unit || !newItem.category || newItem.currentQuantity === '' || !newItem.lastRestockDate) {
      toast.error('Please fill in all required fields (Item No, Name, Unit, Category, Quantity, Restock Date)');
      return;
    }
    // --- End Updated Validation ---

    if (isNaN(Number(newItem.currentQuantity))) {
      toast.error('Current Quantity must be a number.');
      return;
    }


    setIsCreating(true);
    try {
      // Payload automatically includes itemNo and unit from state
      const payload = {
        ...newItem,
        currentQuantity: Number(newItem.currentQuantity),
      };
      console.log("Sending payload:", payload);
      const createdItem = await createItem(payload);

      setItems([...items, createdItem]);
      toast.success('Item created successfully');
      handleClose();
    } catch (error) {
      console.error('Error creating item:', error);
      const errorMsg = error.response?.data?.error || 'Failed to create item.';
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setNewItem(initialNewItemState); // Reset form on close
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-item-modal-title"
      aria-describedby="create-item-modal-description"
    >
      <Box sx={style}>
        <Typography id="create-item-modal-title" variant="h6" component="h2" mb={3}> {/* Increased bottom margin */}
          Create New Item
        </Typography>

        {/* Using Grid for better layout */}
        <Grid container spacing={2}>
          {/* --- Item Number --- */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Item Number"
              name="itemNo"
              value={newItem.itemNo}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          {/* --- Unit --- */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Unit"
              name="unit"
              placeholder='e.g., "pcs", "box", "case"'
              value={newItem.unit}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          {/* --- Item Name --- */}
          <Grid item xs={12}>
            <TextField
              required
              label="Item Name"
              name="itemName"
              value={newItem.itemName}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
          {/* --- Category --- */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required size="small">
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                label="Category"
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
              >
                <MenuItem value="" disabled>
                  Select a category
                </MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* --- Current Quantity --- */}
          <Grid item xs={12} sm={6}>
            <TextField
              required
              label="Current Quantity"
              name="currentQuantity"
              type="number"
              value={newItem.currentQuantity}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{ inputProps: { min: 0 } }} // Ensure non-negative
            />
          </Grid>
          {/* --- Last Restock Date --- */}
          <Grid item xs={12}>
            <TextField
              required
              label="Last Restock Date"
              name="lastRestockDate"
              type="date"
              value={newItem.lastRestockDate}
              onChange={handleInputChange} // Can use the general handler
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid> {/* End Grid container */}

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleCreateItem}
            variant="contained"
            color="primary"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

CreateItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  setItems: PropTypes.func.isRequired,
};

export default CreateItemModal;