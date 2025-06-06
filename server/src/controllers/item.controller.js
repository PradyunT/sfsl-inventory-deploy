import Item from "models/item.model";
import to from "await-to-js";

// GET / - Retrieve all items
export const getItems = async (req, res) => {
  const [error, items] = await to(Item.find({}).lean());
  if (error) return res.status(500).send({ error });
  return res.json({ items });
};

// GET /item/:id - Retrieve a single item by id
export const getItem = async (req, res) => {
  const { id } = req.params;
  const [error, item] = await to(Item.findById(id).lean());
  if (error) return res.status(500).send({ error });
  if (!item) return res.status(404).send({ error: "Item not found" });
  return res.json({ item });
};

// POST /item - Create a new item
export const createItem = async (req, res) => {
  const { itemNo, itemName, unit, grossUnitWeight, lastRestockQuantity, currentQuantity, lastRestockDate, category, history } =
    req.body;

  // Validate required fields
  if (!itemNo || !itemName || !unit || grossUnitWeight === undefined || currentQuantity === undefined || !category) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  const [error, item] = await to(
    Item.create({
      itemNo,
      itemName,
      unit,
      grossUnitWeight,
      lastRestockQuantity,
      currentQuantity,
      lastRestockDate,
      category,
      history,
    })
  );
  if (error) return res.status(500).send({ error });
  return res.json({ item });
};

// PUT /item/:id - Update an existing item
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { itemName, lastRestockQuantity, currentQuantity } = req.body;

  const updateData = {};
  if (itemName !== undefined) updateData.itemName = itemName;
  if (lastRestockQuantity !== undefined) updateData.lastRestockQuantity = lastRestockQuantity;
  if (currentQuantity !== undefined) updateData.currentQuantity = currentQuantity;

  const [error, item] = await to(Item.findByIdAndUpdate(id, updateData, { new: true }).lean());
  if (error) return res.status(500).send({ error });
  if (!item) return res.status(404).send({ error: "Item not found" });
  return res.json({ item });
};

// PUT /item/category/:id - Updates the category of an existing item
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;
  console.log("category", category);

  const updateData = { category };
  console.log("update data", updateData);

  const [error, item] = await to(Item.findByIdAndUpdate(id, updateData, { new: true }).lean());
  if (error) return res.status(500).send({ error });
  if (!item) return res.status(404).send({ error: "Item not found" });
  return res.json({ item });
};

// DELETE /item/:id - Delete an item
export const deleteItem = async (req, res) => {
  const { id } = req.params;
  const [error, item] = await to(Item.findByIdAndDelete(id).lean());
  if (error) return res.status(500).send({ error });
  if (!item) return res.status(404).send({ error: "Item not found" });
  return res.status(200).json({ item });
};

// GET /item/available - Retrieve all items with quantity > 0 -- returns their id, name, and currentQuantity as an object { id, name, currentQuantity }
export const getAvailableItems = async (req, res) => {
  const [error, items] = await to(Item.find({}).lean());
  if (error) return res.status(500).send({ error });
  const availableItems = items
    .filter((item) => item.currentQuantity > 0)
    .map((item) => {
      return { id: item._id, name: item.itemName, currentQuantity: item.currentQuantity };
    });
  return res.status(200).json({ availableItems });
};

// PUT /item/order - Reduce all items in input by the quantity of that item ordered
export const reduceQuantities = async (req, res) => {
  const { orderList } = req.body;
  let itemList = [];
  // validate inputs first before updating so that updates don't get made if an error occurs in the middle
  for (let i = 0; i < orderList.length; i++) {
    const { id, orderQuantity } = orderList[i];
    const [error, item] = await to(Item.findById(id).lean());
    if (error) return res.status(500).send({ error });
    if (item.currentQuantity < orderQuantity)
      return res.status(400).json({ error: "bad request. unable to reduce quantity below 0" });
    if (orderQuantity <= 0) return res.status(400).json({ error: "all items must have an order quantity greater than 0" });
    itemList.push({ id, orderQuantity });
  }

  let updatedItems = [];
  for (let i = 0; i < itemList.length; i++) {
    const item = itemList[i];
    const { id, orderQuantity } = item;
    const [error, newItem] = await to(
      Item.findByIdAndUpdate(id, { $inc: { currentQuantity: -1 * orderQuantity } }, { new: true }).lean()
    );
    if (error) return res.status(500).send({ error }); // theoretically this shouldn't happen
    updatedItems.push({ id, newQuantity: newItem.currentQuantity });
  }
  res.status(200).json({ updatedItems });
};

// PUT /item/order-alt - Reduce all items in input by the quantity of that item ordered and allow partial updating
export const reduceQuantitiesPartial = async (req, res) => {
  const { orderList } = req.body;

  // Validate input: orderList must be an array
  if (!Array.isArray(orderList)) {
    return res.status(400).json({ error: "Invalid input: orderList must be an array." });
  }

  // Validate input: orderList should not be empty (optional, but good practice)
  if (orderList.length === 0) {
    return res.status(400).json({ error: "Invalid input: orderList cannot be empty." });
  }

  const processedItems = []; // To store results of successfully processed items (full or partial)
  const itemErrors = []; // To store errors for specific items

  // Process each item in the orderList sequentially
  for (const orderItem of orderList) {
    const { id, orderQuantity } = orderItem;

    // Validate individual order item structure
    if (!id || typeof orderQuantity !== "number") {
      itemErrors.push({
        id: id || "unknown_id",
        requestedQuantity: orderQuantity,
        error: "Invalid order item format. Each item must have an 'id' and a numeric 'orderQuantity'.",
      });
      continue; // Skip to the next item
    }

    // Validate orderQuantity: must be positive
    if (orderQuantity <= 0) {
      itemErrors.push({
        id,
        requestedQuantity: orderQuantity,
        error: "Order quantity must be greater than 0.",
      });
      continue; // Skip to the next item
    }

    // Fetch the item from the database
    const [fetchError, item] = await to(Item.findById(id).lean());

    if (fetchError) {
      console.error(`Database error fetching item ${id}:`, fetchError);
      itemErrors.push({
        id,
        requestedQuantity: orderQuantity,
        error: "Failed to retrieve item due to a server error.",
      });
      continue; // Skip to the next item
    }

    if (!item) {
      itemErrors.push({
        id,
        requestedQuantity: orderQuantity,
        error: "Item not found.",
      });
      continue; // Skip to the next item
    }

    const currentDBQuantity = item.currentQuantity;
    let actualReducedQuantity = 0;
    let statusMessage = "";
    let operationStatus = "";

    if (currentDBQuantity <= 0) {
      // Item is already out of stock (or has non-positive quantity)
      actualReducedQuantity = 0;
      operationStatus = "out_of_stock";
      statusMessage = "Item is out of stock. No quantity reduced.";
      processedItems.push({
        id,
        requestedQuantity: orderQuantity,
        reducedBy: actualReducedQuantity,
        newQuantity: currentDBQuantity, // current quantity (0 or less)
        status: operationStatus,
        message: statusMessage,
      });
      continue; // Skip to the next item
    }

    // Determine the actual quantity to reduce
    actualReducedQuantity = Math.min(currentDBQuantity, orderQuantity);

    // Perform the database update
    const [updateError, updatedItem] = await to(
      Item.findByIdAndUpdate(
        id,
        { $inc: { currentQuantity: -1 * actualReducedQuantity } },
        { new: true } // Return the modified document
      ).lean()
    );

    if (updateError) {
      console.error(`Database error updating item ${id}:`, updateError);
      itemErrors.push({
        id,
        requestedQuantity: orderQuantity,
        reducedByAttempt: actualReducedQuantity,
        error: "Failed to update item quantity due to a server error.",
        // detail: updateError.message
      });
      continue; // Skip to the next item
    }

    if (!updatedItem) {
      // This case might occur if the item was deleted between fetch and update
      console.error(`Failed to update item ${id}: item might have been deleted concurrently.`);
      itemErrors.push({
        id,
        requestedQuantity: orderQuantity,
        reducedByAttempt: actualReducedQuantity,
        error: "Item found but failed to update (it may have been deleted concurrently).",
      });
      continue;
    }

    // Determine status and message based on whether reduction was partial or full
    if (orderQuantity > currentDBQuantity) {
      operationStatus = "partially_reduced_due_to_stock";
      statusMessage = `Requested ${orderQuantity}, but only ${actualReducedQuantity} could be reduced due to insufficient stock. New quantity: ${updatedItem.currentQuantity}.`;
    } else {
      operationStatus = "fully_reduced";
      statusMessage = `Successfully reduced quantity by ${actualReducedQuantity}. New quantity: ${updatedItem.currentQuantity}.`;
    }

    processedItems.push({
      id,
      requestedQuantity: orderQuantity,
      reducedBy: actualReducedQuantity,
      newQuantity: updatedItem.currentQuantity,
      status: operationStatus,
      message: statusMessage,
    });
  }

  // Determine overall HTTP status code for the response
  if (processedItems.length === 0 && itemErrors.length > 0 && itemErrors.length === orderList.length) {
    // All items resulted in errors, no successful operations
    const hasServerError = itemErrors.some((err) => err.error.includes("server error"));
    if (hasServerError) {
      return res.status(500).json({
        message: "Server errors occurred while processing the order. No items were updated.",
        itemErrors,
      });
    } else {
      // If no server errors, assume client-side issues (not found, bad input)
      return res.status(400).json({
        message: "Could not process any items in the order due to client-side errors or items not found.",
        itemErrors,
      });
    }
  }

  // If we reach here, some items might have been processed, or a mix of success/failure.
  // A 200 OK with a detailed body is generally good.
  // A 207 (Multi-Status) could also be used if there's a mix, but 200 is common.
  return res.status(200).json({
    message: "Order processing attempt complete. Review details for each item.",
    processedItems,
    itemErrors,
  });
};

// PUT /item/restock - Restock items by the given quantity
export const restockItems = async (req, res) => {
  const { restockList } = req.body;

  // Validate that restockList is a non-empty array
  if (!Array.isArray(restockList) || restockList.length === 0) {
    return res.status(400).json({ error: "Invalid input: restockList must be a non-empty array." });
  }

  const validatedItems = [];

  // First loop: Validate all inputs before making any database changes
  for (const item of restockList) {
    const { id, restockQuantity } = item;

    // Ensure item has an id and a numeric, positive restockQuantity
    if (!id || typeof restockQuantity !== "number" || restockQuantity <= 0) {
      return res.status(400).json({
        error: "Invalid item format. Each item must have an 'id' and a positive 'restockQuantity'.",
      });
    }

    // Check if the item exists in the database
    const [error, foundItem] = await to(Item.findById(id).lean());
    if (error) {
      return res.status(500).send({ error: "A server error occurred while validating items." });
    }
    if (!foundItem) {
      return res.status(404).send({ error: `Item with ID ${id} not found.` });
    }

    validatedItems.push({ id, restockQuantity });
  }

  const updatedItems = [];
  const restockTime = new Date();

  // Second loop: Perform the database updates
  for (const item of validatedItems) {
    const { id, restockQuantity } = item;

    const [error, updatedItem] = await to(
      Item.findByIdAndUpdate(
        id,
        {
          $inc: { currentQuantity: restockQuantity },
          lastRestockQuantity: restockQuantity,
          lastRestockDate: restockTime,
        },
        { new: true } // Return the updated document
      ).lean()
    );

    // This error is unlikely if validation passed, but is included for safety
    if (error) {
      return res
        .status(500)
        .send({ error: "An error occurred during the update process. Some items may not have been updated." });
    }
    updatedItems.push(updatedItem);
  }

  // Send successful response with the list of updated items
  res.status(200).json({ updatedItems });
};

export const deleteAll = async (req, res) => {
  try {
    await Item.deleteMany({});
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
};
