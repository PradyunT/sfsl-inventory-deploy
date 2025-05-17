const { to } = require('await-to-js')
const { PythonShell } = require('python-shell')
const path = require('path')
import Purchase from '../models/purchase.model.js'
import Neighbor from '../models/neighbor.model.js'

// **GET /reports/items-weekly** - Number of unique neighbors who took items this week
export const getWeeklyItemTakers = async (req, res) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0) // Normalize to midnight

  console.log('Filtering purchases after:', sevenDaysAgo)

  const [err, neighbors] = await to(
    Purchase.aggregate([
      {
        $addFields: { convertedDate: { $toDate: '$purchaseDate' } }, // Convert field to Date
      },
      {
        $match: { convertedDate: { $gte: sevenDaysAgo } },
      },
      {
        $group: { _id: { $toString: '$Neighbor' } }, // Convert Neighbor to string
      },
      {
        $count: 'totalNeighbors',
      },
    ])
  )

  if (err) return res.status(500).json({ error: err.message })

  console.log('Neighbors count result:', neighbors)

  res.json({ number: neighbors[0]?.totalNeighbors || 0 })
}

// **GET /reports/items-by-season** - Number of items taken grouped by season
export const getItemsBySeason = async (req, res) => {
  const [err, seasonalData] = await to(
    Purchase.aggregate([
      {
        $addFields: { convertedDate: { $toDate: '$purchaseDate' } },
      },
      {
        $group: {
          _id: { $month: '$convertedDate' }, // Group by month
          totalQuantity: { $sum: { $toInt: '$quantity' } }, // Sum of quantities taken
        },
      },
    ])
  )

  if (err) return res.status(500).json({ error: err.message })

  console.log('Seasonal purchaseData:', seasonalData)

  // Convert months into seasons
  const seasons = {
    Winter: [12, 1, 2], // Dec, Jan, Feb
    Spring: [3, 4, 5], // Mar, Apr, May
    Summer: [6, 7, 8], // Jun, Jul, Aug
    Fall: [9, 10, 11], // Sep, Oct, Nov
  }

  const seasonTotals = { Winter: 0, Spring: 0, Summer: 0, Fall: 0 }

  seasonalData.forEach((entry) => {
    const month = entry._id
    for (const season in seasons) {
      if (seasons[season].includes(month)) {
        seasonTotals[season] += entry.totalQuantity
      }
    }
  })

  res.json({ seasonData: seasonTotals })
}

export const getGenderDistribution = async (req, res) => {
  try {
    // Fetch a sample neighbor document for debugging
    const sampleDoc = await Neighbor.findOne().lean()
    console.log('Sample Neighbor Document:', sampleDoc)

    if (!sampleDoc) {
      return res.status(404).json({ error: 'No neighbors found in DB' })
    }

    // Aggregation query
    const genderCounts = await Neighbor.aggregate([
      {
        $group: {
          _id: '$Gender', // Ensure case sensitivity
          count: { $sum: 1 },
        },
      },
    ])

    console.log('Gender Aggregation Result:', genderCounts)

    if (!genderCounts.length) {
      return res.status(404).json({ message: 'No gender purchaseData found' })
    }

    const genderData = genderCounts.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    return res.json({ genderData })
  } catch (error) {
    console.error('Error fetching gender distribution:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// GET /api/reports/age-distribution - Get age distribution of neighbors
export const getAgeDistribution = async (req, res) => {
  const [err, results] = await to(
    Neighbor.aggregate([
      {
        $bucket: {
          groupBy: '$Age',
          boundaries: [0, 6, 18, 25, 30, 36, 50, 60, 65, 150],
          default: '65+',
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          _id: 0, // ✅ Remove _id from output
          ageGroup: '$_id',
          value: '$count',
        },
      },
    ])
  )

  if (err) {
    return res.status(500).json({ error: 'Error retrieving age distribution' })
  }

  return res.json({ ageData: results })
}

// **GET /reports/forecast** - Run Python script to predict next month’s forecast for items
export const predictForecast = async (req, res) => {
  try {
    const scriptPath = path.resolve('forecast/predict_runner.py')
    let pythonPath
    if (process.env.SYSTEM === 'WINDOWS') {
      // PATH for Windows systems
      pythonPath = path.resolve('forecast/.venv/Scripts/python.exe')
    } else {
      // PATH for MacOS systems
      pythonPath = path.resolve('forecast/.venv/bin/python')
    }
    console.log('🚀 Running Python script:', scriptPath)

    const shell = new PythonShell(scriptPath, { pythonPath })

    let rawOutput = ''

    shell.on('message', function (message) {
      console.log('🐍 Python message:', message)
      rawOutput += message
    })

    shell.end(function (err) {
      if (err) {
        console.error('Python error:', err)
        return res.status(500).json({ success: false, error: err.message })
      }

      try {
        const predictions = JSON.parse(rawOutput)
        console.log('📦 Final predictions parsed:', predictions)
        return res.status(200).json({ success: true, predictions })
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr)
        return res
          .status(500)
          .json({ success: false, error: 'Invalid JSON from Python' })
      }
    })
  } catch (error) {
    console.error('Node catch block error:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
