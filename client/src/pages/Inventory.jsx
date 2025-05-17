import { useEffect, useState } from 'react';
import InventoryTable from '../components/InventoryTable.jsx';
import InventoryHeader from '../components/Inventory/InventoryHeader.jsx';
import InventoryPanel from '../components/Inventory/InventoryPanel.jsx';
import InventoryLog from '../components/InventoryLog.jsx';
import PopupOrder from '../components/PopupOrder.jsx';
import { getItems, updateItem } from '../api/item.js';
import { createEditLog, getEditLogs } from '../api/editLog.js';
import to from 'await-to-js';
import toast from 'react-hot-toast';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField } from '@mui/material';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editLogs, setEditLogs] = useState([]);

  // Track filter state
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // The input currently in the search box

  // For toast notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  // For editor name dialog
  const [editorDialog, setEditorDialog] = useState({
    open: false,
    name: "",
  });

  // Fetch items and extract unique categories
  const getAllItems = async () => {
    const [error, res] = await to(getItems());
    if (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch inventory items",
        severity: "error",
      });
      return;
    }

    const { data } = res;
    if (data.items) {
      const updatedItems = data.items.map((item) => ({
        ...item,
        changed: false,
        status: item.lastRestockQuantity
          ? Math.round((item.currentQuantity / item.lastRestockQuantity) * 100)
          : null,
      }));

      setItems(updatedItems);
      setFilteredItems(updatedItems);

      const uniqueCategories = [
        ...new Set(updatedItems.map((item) => item.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    }
  };

  const getAllLogs = async () => {
    const [error, res] = await to(getEditLogs());
    if (error) {
      setSnackbar({
        open: true,
        message: "Failed to fetch edit logs",
        severity: "error",
      });
      return;
    }

    const { data } = res;
    console.log("data", data);
    if (data.editLogs) {
      setEditLogs(data.editLogs);
    }
  };

  const handleSave = () => {
    // Only proceed if there are changed items
    const changedItems = items.filter((item) => item.changed);
    if (changedItems.length === 0) {
      setSnackbar({
        open: true,
        message: "No changes to save",
        severity: "info",
      });
      setIsEditing(false);
      return;
    }

    // Open dialog to get editor name
    setEditorDialog({
      open: true,
      name: "",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleDialogNameChange = (e) => {
    setEditorDialog({
      ...editorDialog,
      name: e.target.value,
    });
  };

  const handleDialogCancel = () => {
    setEditorDialog({
      ...editorDialog,
      open: false,
    });
  };

  const handleDialogSave = async () => {
    // Validate editor name
    if (!editorDialog.name.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter your name",
        severity: "warning",
      });
      return;
    }

    const changedItems = items.filter((item) => item.changed);
    const editor = editorDialog.name.trim();
    const currentDate = new Date();

    // Close the dialog
    setEditorDialog({
      ...editorDialog,
      open: false,
    });

    // Save each changed item and create edit logs
    for (const item of changedItems) {
      // Update the item
      const [updateError] = await to(updateItem(item));

      if (updateError) {
        setSnackbar({
          open: true,
          message: `Failed to update ${item.itemName}`,
          severity: "error",
        });
        continue;
      }

      // Create edit log - Modified to use new approach
      const [logError] = await to(
        createEditLog({
          purchaseDate: currentDate,
          editor,
          restock: false,
          newItem: {
            name: item.itemName,
            currentQuantity: item.currentQuantity,
          },
          itemId: item._id, // Pass the item ID instead of prevItem
        })
      );

      if (logError) {
        setSnackbar({
          open: true,
          message: `Failed to create edit log for ${item.itemName}`,
          severity: "error",
        });
      }
    }

    // Refresh purchaseData
    getAllItems();
    getAllLogs();

    // Display success message
    setSnackbar({
      open: true,
      message: "Changes saved successfully",
      severity: "success",
    });

    // Exit editing mode
    setIsEditing(false);
  };

  useEffect(() => {
    getAllItems();
    getAllLogs();
  }, []);

  // Filter items based on dropdown selections and search box
  useEffect(() => {
    const filtered = items.filter((item) => {
      // console.log(item.itemName);
      const matchesStatus =
        (selectedStatus === "All" ||
          (selectedStatus === "Low Stock: Restock Needed" &&
            item.status < 20) ||
          (selectedStatus === "Stock in Safe Range" &&
            item.status >= 20 &&
            item.status < 80) ||
          (selectedStatus === "Surplus Stock" && item.status >= 80)) &&
        (searchTerm === "" ||
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesStatus && matchesCategory;
    });

    setFilteredItems(filtered);
  }, [selectedStatus, selectedCategory, items, searchTerm]);

  const handleOrder = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one item", {
        duration: 3000,
        position: "bottom-right",
      });
    } else {
      setPopupOpen(true);
    }
  };

  const handleExportCSV = () => {
    const itemsToExport = selected.length > 0 ? selected : filteredItems;

    const csvHeaders = [
      "Item Name",
      "Category",
      "Current Quantity",
      "Last Restock Date",
      "Status",
    ];

    // Helper function to escape commas in CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";

      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = itemsToExport.map((item) => [
      escapeCSV(item.itemName),
      escapeCSV(item.category),
      escapeCSV(item.currentQuantity),
      escapeCSV(item.lastRestockDate || "N/A"),
      escapeCSV(item.status ? `${item.status}%` : "N/A"),
    ]);

    const csvContent = [csvHeaders.map(escapeCSV), ...csvRows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_export.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="!max-w-full !w-full !min-h-screen !flex !flex-col !gap-8 !p-8 !bg-transparent">
      <InventoryHeader
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />
      <InventoryPanel
        handleOrder={handleOrder}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setLogOpen={setLogOpen}
        handleSave={handleSave}
        selected={selected}
        setSelected={setSelected}
        handleExportCSV={handleExportCSV}
        setSearchTerm={setSearchTerm}
        items={items}
        setItems={setItems}
      />
      <div className="rounded-xl">
        <InventoryTable
          items={filteredItems}
          setItems={setItems}
          isEditing={isEditing}
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      <PopupOrder
        popupOpen={popupOpen}
        setPopupOpen={setPopupOpen}
        selected={selected}
        setSelected={setSelected}
      />

      {logOpen && (
        <InventoryLog
          setLogOpen={setLogOpen}
          open={logOpen}
          editLogs={editLogs}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Editor name dialog */}
      <Dialog open={editorDialog.open} onClose={handleDialogCancel}>
        <DialogTitle>Enter Your Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="editor-name"
            label="Editor Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editorDialog.name}
            onChange={handleDialogNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDialogSave}
            color="primary"
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Inventory;
