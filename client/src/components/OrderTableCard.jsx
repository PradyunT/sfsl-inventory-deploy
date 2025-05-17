// --- OrderTableCard.jsx ---
import '../styles/Dashboard.css';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PopupOrder from '../components/PopupOrder.jsx'; // Adjust the path as needed

const OrderTableCard = ({ recommendedItems, isLoading }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const handleOrder = () => {
    if (recommendedItems.length === 0) {
      toast.error("No items available to order", {
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }

    // Set selected to all recommended items before opening
    setSelected(recommendedItems);
    setPopupOpen(true);
  };

  const totalRestock = recommendedItems.reduce(
    (total, item) => total + (item.restockQty || 0),
    0
  );

  if (isLoading) {
    return <Box><Typography>Loading recommendations...</Typography></Box>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        rowGap: "0.5rem",
        alignItems: "center",
      }}
    >
      <Typography>
        <b>Recommended Items for Next Order</b>
      </Typography>
      <div className="dashboard-table-container">
        <table className="dashboard-table">
          <thead>
          <tr>
            <th>Name</th>
            <th>Quantity Left</th>
            <th>Quantity Predicted</th>
            <th>Restock Quantity</th>
          </tr>
          </thead>
          <tbody>
          {recommendedItems.length > 0 ? (
            recommendedItems.map((item, index) => (
              <tr
                className={
                  index === recommendedItems.length - 1
                    ? "dashboard-table-item-last"
                    : "dashboard-table-item"
                }
                key={item._id || item.itemNo || index}
              >
                <td>{item.itemName}</td>
                <td>{item.currentQuantity}</td>
                <td>{item.predictedQty || 100}</td>
                <td>{item.restockQty || 100}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                No recommendations available.
              </td>
            </tr>
          )}
          </tbody>
        </table>
        <div className="dashboard-table-footer">
          <div>
            Total Units to Order: <span className="dashboard-table-total">{totalRestock}</span>
          </div>
          <button onClick={handleOrder}>Make an Order</button>
        </div>
      </div>

      <PopupOrder
        popupOpen={popupOpen}
        setPopupOpen={setPopupOpen}
        selected={selected}
        setSelected={setSelected}
      />
    </Box>
  );
};

export default OrderTableCard;
