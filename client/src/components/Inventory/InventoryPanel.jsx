import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { deleteItems } from '../../api/item';
import toast from 'react-hot-toast';
import CreateItemModal from './CreateItemModal';
import SellItemModal from './SellItemModal';

InventoryPanel.propTypes = {
  handleOrder: PropTypes.func,
  isEditing: PropTypes.bool,
  handleSave: PropTypes.func,
  setIsEditing: PropTypes.func,
  setLogOpen: PropTypes.func,
  handleExportCSV: PropTypes.func,
  setSearchTerm: PropTypes.func,
  selected: PropTypes.array,
  setSelected: PropTypes.func,
  items: PropTypes.array.isRequired, // Ensure items is required
  setItems: PropTypes.func.isRequired, // Ensure setItems is required
};

export default function InventoryPanel({
                                         handleOrder,
                                         isEditing,
                                         handleSave,
                                         setIsEditing,
                                         setLogOpen,
                                         handleExportCSV,
                                         selected,
                                         setSelected,
                                         setSearchTerm,
                                         items,
                                         setItems,
                                       }) {
  // State to control modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Derive available items for the Sell modal
  const availableItems = useMemo(() => {
    // Filter out items with 0 or less quantity, or adjust as needed
    return items.filter((item) => item.currentQuantity > 0);
  }, [items]);


  // Keep delete logic
  const handleDeleteItem = async () => {
    if (selected.length === 0) {
      toast.error("Please select items to delete.");
      return;
    }
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to delete ${selected.length} selected item(s)?`)) {
      return;
    }

    const deletePromises = selected.map(item => deleteItems([{ _id: item._id }]));

    try {
      await Promise.all(deletePromises); // Use Promise.all if deleting individually

      // Update the items state locally after successful deletion
      const selectedIds = new Set(selected.map(item => item._id));
      setItems(prevItems => prevItems.filter(item => !selectedIds.has(item._id)));

      toast.success("Selected items were successfully deleted");
      setSelected([]); // Clear selection
    } catch (e) {
      console.error("Deletion error:", e);
      toast.error("An error occurred while deleting items");
      // Note: State might be inconsistent if some deletes failed. Consider more robust error handling.
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2 w-full max-w-xs sm:max-w-sm md:max-w-md"> {/* Responsive width */}
        {/* Search Box - Consider using MUI TextField here too for consistency */}
        <input
          type="text"
          placeholder="Search Items..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className="text-gray-500" /> {/* Adjusted color */}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2"> {/* Use gap and flex-wrap */}
        {/* --- Non-Editing Mode Buttons --- */}
        {!isEditing && (
          <>
            {/* Sell Item Button */}
            <button
              className="px-3 py-2 border border-purple-400 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition duration-150 ease-in-out text-sm"
              onClick={() => setShowSellModal(true)}
            >
              Record Sale
            </button>

            {/* Create Item Button */}
            <button
              className="px-3 py-2 border border-green-400 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition duration-150 ease-in-out text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              Create Item
            </button>

            {/* Delete Item Button */}
            <button
              className={`px-3 py-2 border border-gray-400 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition duration-150 ease-in-out text-sm ${selected.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDeleteItem}
              disabled={selected.length === 0} // Disable if nothing selected
            >
              Delete Selected
            </button>

            {/* Make Order Button */}
            <button
              className="px-3 py-2 border border-red-400 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition duration-150 ease-in-out text-sm"
              onClick={handleOrder}
            >
              Make Order
            </button>

            {/* Export CSV Button */}
            <button
              className="px-3 py-2 border border-blue-400 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition duration-150 ease-in-out text-sm"
              onClick={handleExportCSV}
            >
              Export CSV
            </button>

            {/* Edit/Log Buttons */}
            <button
              className="px-3 py-2 border border-indigo-400 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition duration-150 ease-in-out text-sm font-semibold"
              onClick={() => setIsEditing(true)}
            >
              Edit Mode
            </button>
            <button
              className="px-3 py-2 border border-yellow-500 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition duration-150 ease-in-out text-sm"
              onClick={() => setLogOpen(true)}
            >
              View Log
            </button>
          </>
        )}

        {/* --- Editing Mode Buttons --- */}
        {isEditing && (
          <button
            className="px-3 py-2 border border-orange-400 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition duration-150 ease-in-out text-sm font-semibold"
            onClick={handleSave}
          >
            Save Changes
          </button>
        )}
        {/* Toggle Edit Mode (Appears when editing) - Optional */}
        {isEditing && (
          <button
            className="px-3 py-2 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition duration-150 ease-in-out text-sm"
            onClick={() => setIsEditing(false)} // Assumes handleEdit toggles the state
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Render Modals (They handle their own visibility based on 'open' prop) */}
      <CreateItemModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        items={items}
        setItems={setItems}
      />

      <SellItemModal
        open={showSellModal}
        onClose={() => setShowSellModal(false)}
        availableItems={availableItems}
        // Pass setItems or a refresh function if needed after sale recording
      />
    </div>
  );
}