import to from 'await-to-js'
import Item from 'models/item.model'
import Purchase from 'models/purchase.model'

// GET /dashboard/weekly-neighbors - Get weekly number of unique neighbors
export const getWeeklyNeighbors = async (req, res) => {
  // Parse date parameters from request query
  const { startDate, endDate } = req.query

  // Create date objects for filtering
  const startDateTime = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 7))
  const endDateTime = endDate ? new Date(endDate) : new Date()

  // Set end date to end of day
  endDateTime.setHours(23, 59, 59, 999)

  // Set start date to beginning of day
  startDateTime.setHours(0, 0, 0, 0)

  // console.log('Filtering purchases between:', startDateTime, 'and', endDateTime)

  // unique neighbors who made a purchase in the specified date range
  const [err, neighbors] = await to(
    Purchase.aggregate([
      {
        $addFields: { convertedDate: { $toDate: '$purchaseDate' } },
      },
      {
        $match: {
          convertedDate: {
            $gte: startDateTime,
            $lte: endDateTime,
          },
        },
      },
      {
        $group: { _id: { $toString: '$Neighbor' } },
      },
      {
        $count: 'totalNeighbors',
      },
    ])
  )

  if (err) return res.status(500).json({ error: err.message })
  // console.log('Neighbors count result:', neighbors)

  res.json({ number: neighbors[0]?.totalNeighbors || 0 })
}

// GET /dashboard/popular-items - Get most purchased items within date range
export const getPopularItems = async (req, res) => {
  // Parse date parameters from request query
  const { startDate, endDate } = req.query

  // Create date objects for filtering
  const startDateTime = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 7))
  const endDateTime = endDate ? new Date(endDate) : new Date()

  // Set end date to end of day
  endDateTime.setHours(23, 59, 59, 999)

  // Set start date to beginning of day
  startDateTime.setHours(0, 0, 0, 0)

  // console.log(
  //   'Filtering popular items between:',
  //   startDateTime,
  //   'and',
  //   endDateTime
  // )

  // Step 1: Find the most purchased item in the specified date range
  const [err, topItem] = await to(
    Purchase.aggregate([
      {
        $addFields: { convertedDate: { $toDate: '$purchaseDate' } },
      },
      {
        $match: {
          convertedDate: {
            $gte: startDateTime,
            $lte: endDateTime,
          },
        },
      },
      {
        $group: {
          _id: '$itemNo', // Group by itemNo
          totalQuantity: { $sum: { $toInt: '$quantity' } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 1 },
    ])
  )

  // console.log('Top item:', topItem)

  if (err) return res.status(500).json({ error: err.message })
  if (!topItem.length) return res.json({ name: 'No data', data: [] })

  const mostPurchasedItemId = topItem[0]._id

  // get the item name
  const [itemErr, itemDetails] = await to(
    Item.findOne({ itemNo: mostPurchasedItemId }).select('itemName').lean()
  )

  if (itemErr) return res.status(500).json({ error: itemErr.message })

  // console.log('Item details:', mostPurchasedItemId)

  // get daily purchase data for the top item within the date range
  const [chartErr, dailyData] = await to(
    Purchase.aggregate([
      {
        $addFields: { convertedDate: { $toDate: '$purchaseDate' } },
      },
      {
        $match: {
          convertedDate: {
            $gte: startDateTime,
            $lte: endDateTime,
          },
          itemNo: mostPurchasedItemId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$convertedDate' },
          }, // Group by day
          totalQuantity: { $sum: { $toInt: '$quantity' } },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ])
  )

  // console.log('Daily data:', dailyData)

  if (chartErr) return res.status(500).json({ error: chartErr.message })

  // Format chart data
  const formattedChartData = dailyData.map((day) => ({
    name: day._id,
    value: day.totalQuantity,
  }))

  res.json({
    name: itemDetails?.itemName || 'Unknown Item',
    data: formattedChartData,
  })
}

// GET /dashboard/low-stock-items - Get items that are low on stock (no date filtering)
export const getLowStockItems = async (req, res) => {
  const LOW_STOCK_THRESHOLD = 1.0
  const [err, items] = await to(
    Item.find({
      $expr: {
        $lt: [
          '$currentQuantity',
          { $multiply: ['$lastRestockQuantity', LOW_STOCK_THRESHOLD] },
        ],
      },
    }).lean()
  )

  if (err) return res.status(500).json({ error: err.message })

  // console.log('Low stock items:', items)

  res.json({ lowStockItems: items })
}

// GET /dashboard/weekly-visits - Get number of visitors per day in date range
export const getWeeklyVisits = async (req, res) => {
  // Parse date parameters from request query
  const { startDate, endDate } = req.query

  // Create date objects for filtering
  const startDateTime = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 7))
  const endDateTime = endDate ? new Date(endDate) : new Date()

  // Set end date to end of day
  endDateTime.setHours(23, 59, 59, 999)

  // Set start date to beginning of day
  startDateTime.setHours(0, 0, 0, 0)

  // console.log('Filtering visits between:', startDateTime, 'and', endDateTime)

  // Get visits by day for the date range
  const [err, visitsByDay] = await to(
    Purchase.aggregate([
      {
        $addFields: { convertedDate: { $toDate: '$purchaseDate' } },
      },
      {
        $match: {
          convertedDate: {
            $gte: startDateTime,
            $lte: endDateTime,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$convertedDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ])
  )

  if (err) return res.status(500).json({ error: err.message })

  // Create a map of all dates in the range
  const dateMap = new Map()

  // Create a list of all dates in the range
  const currentDate = new Date(startDateTime)
  while (currentDate <= endDateTime) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dateMap.set(dateStr, 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Fill in the actual counts
  visitsByDay.forEach((day) => {
    dateMap.set(day._id, day.count)
  })

  // Convert to array format
  const visitsArray = Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  res.json({
    startDate: startDateTime.toISOString().split('T')[0],
    endDate: endDateTime.toISOString().split('T')[0],
    visits: visitsArray,
  })
}

// GET /dashboard/total-units-taken - Get total units taken within date range
export const getTotalUnitsTaken = async (req, res) => {
  // Parse date parameters from request query
  const { startDate, endDate } = req.query

  // Create date objects for filtering (same logic as other functions)
  const startDateTime = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(new Date().getDate() - 7))
  const endDateTime = endDate ? new Date(endDate) : new Date()

  // Set end date to end of day
  endDateTime.setHours(23, 59, 59, 999)
  // Set start date to beginning of day
  startDateTime.setHours(0, 0, 0, 0)

  // console.log('Filtering total units between:', startDateTime, 'and', endDateTime);

  const [err, result] = await to(
    Purchase.aggregate([
      {
        $addFields: {
          // Ensure purchaseDate is treated as a Date object for comparison
          convertedDate: { $toDate: '$purchaseDate' },
        },
      },
      {
        $match: {
          convertedDate: {
            $gte: startDateTime,
            $lte: endDateTime,
          },
        },
      },
      {
        // Deconstruct the ItemsPurchased array
        $unwind: '$ItemsPurchased',
      },
      {
        // Group all unwound items together and sum their quantities
        $group: {
          _id: null, // Group all documents into one
          totalUnits: { $sum: { $ifNull: ['$ItemsPurchased.quantity', 0] } }, // Sum quantities, handle nulls
          // Alternative if quantity is sometimes string:
          // totalUnits: { $sum: { $toInt: '$ItemsPurchased.quantity' } }
        },
      },
    ])
  )

  if (err) {
    console.error('Error calculating total units taken:', err)
    return res.status(500).json({ error: err.message })
  }

  // console.log('Total units result:', result);

  // If no purchases match, the result array will be empty.
  const totalUnits = result.length > 0 ? result[0].totalUnits : 0

  res.json({ totalUnits })
}
