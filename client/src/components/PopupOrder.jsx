import { useRef, useState, useEffect } from "react";
import { updateQuantity, getItem } from "../api/item";
import { toast } from "react-hot-toast";
import axios from "axios";

// eslint-disable-next-line react/prop-types
const PopupOrder = ({ popupOpen, setPopupOpen, selected, setSelected }) => {
  const printRef = useRef();
  const [orderTotal, setOrderTotal] = useState(0);
  const [manualOrderTotal, setManualOrderTotal] = useState(null);
  const [manualItemNumbers, setManualItemNumbers] = useState({});
  const [forecastMap, setForecastMap] = useState({});

  useEffect(() => {
    if (!popupOpen) return;

    axios
      .get("/api/reports/forecast")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.predictions)) {
          const map = {};
          res.data.predictions.forEach((pred) => {
            map[pred.item_code] = pred.predicted_qty;
          });
          setForecastMap(map);
        }
      })
      .catch((err) => {
        console.error("Failed to load forecast data", err);
        toast.error("Could not load predicted values.");
      });
  }, [popupOpen]);

  // Calculate and update order total whenever selected items or their fees change
  useEffect(() => {
    const total = selected.reduce((sum, item) => {
      const unitFee = parseFloat(item.unitFee || 0);
      // const quantity = parseInt(item.currentQuantity || item.quantity || 0);
      const predicted = forecastMap[item.itemNo];
      const quantity = parseInt(
        item.currentQuantity ?? predicted ?? item.quantity ?? 0
      );
      const itemTotal = unitFee * quantity;
      return sum + itemTotal;
    }, 0);

    setOrderTotal(total);
    // Reset manual order total when automatic total changes
    setManualOrderTotal(null);
  }, [selected]);

  // Initialize manual item numbers with placeholders
  useEffect(() => {
    const placeholderItemNumbers = [
      "SPI-1002-R",
      "EGG-1051-R",
      "ENT-1235-D",
      "SEA-1139-Z",
      "DAI-2005-R",
      "PRO-4520-R",
      "BEV-2253-D",
      "MEA-3062-Z",
      "SPR-1109-D",
      "PER-1434-N",
      "HSE-1470-N",
      "PAS-1093-Z",
      "PRO-3385-R",
      "PRO-1008-Z",
      "MLK-1100-R",
      "MLK-1076-R",
    ];

    const itemNumbersObj = {};
    selected.forEach((item, index) => {
      itemNumbersObj[item._id || index] =
        placeholderItemNumbers[index % placeholderItemNumbers.length];
    });

    setManualItemNumbers(itemNumbersObj);
  }, [selected.length]);

  const handlePrint = async () => {

    if (window.confirm("Update item quantities?")) {
      for (const item of selected) {
        try {
          const response = await getItem({id: item._id})
          const oldItem = response.data.item
          console.log("old item", oldItem)
          await updateQuantity(item._id, item.currentQuantity, oldItem.currentQuantity)
        }
        catch(e) {
          console.error("error during quantity update", e)
        }
      }
    }

    // Create a hidden div for the print version
    const printDiv = document.createElement("div");
    printDiv.className = "print-only";

    // Add print-specific styles
    const printStyles = `
      <style>
        @media print {
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          .header-section {
            position: running(header);
            display: table-header-group;
          }
          @page {
            margin: 1cm;
          }
          .page-number:after {
            content: counter(page);
          }
        }
      </style>
    `;

    // Transform the data for printing
    const orderItems = selected.map((item) => {
      const quantity =
        document.getElementById(`quantity-${item._id}`)?.value ||
        item.currentQuantity;
      const unitFee =
        document.getElementById(`unit-fee-${item._id}`)?.value || "0.00";
      const totalFee = (parseFloat(quantity) * parseFloat(unitFee)).toFixed(2);

      return {
        itemNo: item._id,
        description: item.itemName,
        unit: "CASE",
        requestedQuantity: item.currentQuantity,
        orderQuantity: quantity,
        totalLbs: quantity * 25,
        unitFee: unitFee,
        totalFee: totalFee,
      };
    });

    // Calculate total order amount
    const orderTotal = orderItems.reduce((sum, item) => {
      return sum + parseFloat(item.totalFee);
    }, 0);

    const printContent = `
      ${printStyles}
      <div class="header-section">
        <div style="display: flex; flex-wrap: wrap;">
          <div style="width: 50%; padding-right: 8px;">
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">Page:</span>
                <span class="page-number"></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">Agency Order Number:</span>
                <span>AO-157655</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">Ship To:</span>
                <span>Share Food Share Love Food Pan</span>
              </div>
            </div>
            
            <div style="margin-bottom: 8px;">
              <div>Share Food Share Love Food Pan</div>
              <div>9030 Brookfield Ave</div>
              <div>BROOKFIELD, IL 60513</div>
              <div>John Dumas</div>
            </div>
          </div>
          
          <div style="width: 50%; padding-left: 8px;">
            <h1 style="text-align: center; font-weight: bold; margin-bottom: 8px;">AGENCY ORDER</h1>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">Ship Via:</span>
                <span>Deliver</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">Agency ID:</span>
                <span>PY00751</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">P.O. Number:</span>
                <span>PO5633131</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold;">Shipment Date:</span>
                <span>2/7/2025</span>
              </div>
            </div>
            
            <div style="margin-bottom: 8px;">
              <div>Greater Chicago Food Depositor</div>
              <div>4100 West Ann Lurie Place</div>
              <div>Chicago, IL 60632</div>
              <div>PO Box 22</div>
            </div>
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Item No.</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Unit</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Requested<br/>Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Order<br/>Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total<br/>Lbs.</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Unit Fee</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total Fee</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems
            .map(
              (item) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.itemNo}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.unit}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.requestedQuantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.orderQuantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.totalLbs}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.unitFee}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.totalFee}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div style="display: flex; justify-content: flex-end; margin-top: 1rem; border-top: 1px solid #000; padding-top: 1rem;">
        <div style="width: 40%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span style="font-weight: bold;">Total of Items:</span>
            <span>${orderItems.length}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span style="font-weight: bold;">Order Total:</span>
            <span>${orderTotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span style="font-weight: bold;">Grant Allocations:</span>
            <span>0.00</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span style="font-weight: bold;">Total Order Weight:</span>
            <span>${orderItems.reduce(
              (sum, item) => sum + item.totalLbs,
              0
            )}</span>
          </div>
        </div>
      </div>
    `;

    printDiv.innerHTML = printContent;
    document.body.appendChild(printDiv);

    // Print
    window.print();

    // Clean up
    document.body.removeChild(printDiv);
  };

  const calculateItemTotal = (unitFee, quantity) => {
    return (parseFloat(unitFee || 0) * parseInt(quantity || 0)).toFixed(2);
  };

  const handleFieldChange = (index, field, value) => {
    setSelected((prevSelected) => {
      const updatedItems = prevSelected.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // If updating unit fee or quantity, auto-calculate total fee
          if (field === "unitFee" || field === "currentQuantity") {
            const unitFee =
              field === "unitFee"
                ? parseFloat(value) || 0
                : parseFloat(item.unitFee || 0);
            const quantity =
              field === "currentQuantity"
                ? parseInt(value) || 0
                : parseInt(item.currentQuantity || item.quantity || 0);
            // Calculate but don't store in the state - it will be calculated on display
          }

          return updatedItem;
        }
        return item;
      });

      return updatedItems;
    });
  };

  const handleItemNumberChange = (itemId, value) => {
    setManualItemNumbers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  if (!popupOpen) return null;

  return (
    <div
      className="fixed bg-black bg-opacity-50 inset-0 z-[9000] flex justify-center items-center"
      onClick={() => setPopupOpen(false)}
    >
      <div
        className="bg-white z-[9999] p-4 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        ref={printRef}
      >
        {/* Header section - Mimicking PDF exactly */}
        <div className="flex flex-wrap">
          <div className="w-1/2 pr-2">
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="font-bold">Page:</span>
                <span>1</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">Agency Order Number:</span>
                <span>AO-157655</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">Ship To:</span>
                <span>Share Food Share Love Food Pan</span>
              </div>
            </div>

            <div className="mb-2">
              <div>Share Food Share Love Food Pan</div>
              <div>9030 Brookfield Ave</div>
              <div>BROOKFIELD, IL 60513</div>
              <div>John Dumas</div>
            </div>
          </div>

          <div className="w-1/2 pl-2">
            <h1 className="text-center font-bold mb-2">AGENCY ORDER</h1>
            <div className="mb-2">
              <div className="flex justify-between mb-1">
                <span className="font-bold">Ship Via:</span>
                <span>Deliver</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">Agency ID:</span>
                <span>PY00751</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">P.O. Number:</span>
                <span>PO5633131</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-bold">Shipment Date:</span>
                <span>2/7/2025</span>
              </div>
            </div>

            <div className="mb-2">
              <div>Greater Chicago Food Depositor</div>
              <div>4100 West Ann Lurie Place</div>
              <div>Chicago, IL 60632</div>
              <div>PO Box 22</div>
            </div>
          </div>
        </div>

        {/* Order Items Table - Exact PDF styling */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border px-1 py-1 text-left">Item No.</th>
                <th className="border px-1 py-1 text-left">Description</th>
                <th className="border px-1 py-1 text-center">Unit</th>
                <th className="border px-1 py-1 text-center">
                  Predicted
                  <br />
                  Quantity
                </th>
                <th className="border px-1 py-1 text-center">
                  Order
                  <br />
                  Quantity
                </th>
                <th className="border px-1 py-1 text-center">
                  Total
                  <br />
                  Lbs.
                </th>
                <th className="border px-1 py-1 text-center">Unit Fee</th>
                <th className="border px-1 py-1 text-center">Total Fee</th>
              </tr>
            </thead>
            <tbody>
              {selected.length > 0 ? (
                selected.map((item, index) => {
                  const itemId = item._id || index;
                  const quantity = parseInt(
                    item.currentQuantity || item.quantity || 0
                  );
                  const unitFee = parseFloat(item.unitFee || 0);
                  const totalWeight = quantity * (item.grossWeight || 25);
                  const totalFee = calculateItemTotal(unitFee, quantity);

                  return (
                    <tr key={itemId}>
                      <td className="border px-1 py-1">
                        <input
                          type="text"
                          value={manualItemNumbers[itemId] || ""}
                          onChange={(e) =>
                            handleItemNumberChange(itemId, e.target.value)
                          }
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="border px-1 py-1">
                        <input
                          type="text"
                          value={item.itemName || item.name || ""}
                          onChange={(e) =>
                            handleFieldChange(index, "itemName", e.target.value)
                          }
                          className="border p-1 rounded w-full"
                        />
                      </td>
                      <td className="border px-1 py-1 text-center">CASE</td>
                      <td className="border px-1 py-1 text-center">
                        <input
                          type="number"
                          id={`quantity-${itemId}`}
                          value={quantity}
                          // onChange={(e) =>
                          //   handleFieldChange(
                          //     index,
                          //     "currentQuantity",
                          //     parseInt(e.target.value) || 0
                          //   )
                          // }
                          readOnly
                          className="border p-1 rounded w-12 text-center"
                        />
                      </td>
                      <td className="border px-1 py-1 text-center">
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "currentQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="border p-1 rounded w-12 text-center"
                        />
                      </td>
                      <td className="border px-1 py-1 text-center">
                        {totalWeight}
                      </td>
                      <td className="border px-1 py-1 text-center">
                        <input
                          type="number"
                          id={`unit-fee-${itemId}`}
                          value={unitFee}
                          onChange={(e) =>
                            handleFieldChange(index, "unitFee", e.target.value)
                          }
                          className="border p-1 rounded w-16 text-center"
                          step="0.01"
                        />
                      </td>
                      <td className="border px-1 py-1 text-center">
                        <div className="bg-gray-100 border p-1 rounded w-16 text-center">
                          {totalFee}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center border px-2 py-4">
                    No items selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - Exact PDF styling with updated total calculation and editable total */}
        <div className="flex justify-end mt-4 border-t border-gray-800 pt-2">
          <div className="w-2/5">
            <div className="flex justify-between mb-1">
              <span className="font-bold">Total of Items:</span>
              <span>{selected.length}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-bold">Order Total:</span>
              <div className="flex items-center">
                <input
                  type="number"
                  value={
                    manualOrderTotal !== null
                      ? manualOrderTotal
                      : orderTotal.toFixed(2)
                  }
                  onChange={(e) => setManualOrderTotal(e.target.value)}
                  className="border p-1 rounded w-24 text-right"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-bold">Grant Allocations:</span>
              <span>0.00</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-bold">Total Order Weight:</span>
              <span>
                {selected
                  .reduce((sum, item) => {
                    const weightPerCase = item.grossWeight || 25;
                    const quantity = parseInt(
                      item.currentQuantity || item.quantity || 0
                    );
                    return sum + quantity * weightPerCase;
                  }, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Green Print Button */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={handlePrint}
          >
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupOrder;
