import { Box, Container, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Inventory2, Person } from '@mui/icons-material';

import { getItems as fetchRawItems } from '../api/item.js'; // Renamed import for clarity
import RestockCard from '../components/RestockCard.jsx';
import PopularItemCard from '../components/PopularItemCard.jsx';
import LastRestockCard from '../components/LastRestockCard.jsx';
import OrderTableCard from '../components/OrderTableCard.jsx';
import SimpleCard from '../components/SimpleCard';
import '../styles/Dashboard.css';
import Loader from '../components/Loader.jsx';

// --- Helper function to process raw items ---
const processRawItems = (rawItems) => {
  if (!rawItems || !Array.isArray(rawItems)) {
    console.error('Invalid raw items data received');
    return [];
  }
  // You might not need to filter here if OrderTableCard only shows forecast items
  // If RestockCard needs *all* low stock items (not just forecasted ones), keep/adjust this filter.
  // For now, let's assume the primary item list is just for the forecast table.
  // Keep the mapping and sorting.
  return rawItems
    .map((item) => ({
      ...item, // 'changed' seems unused, maybe remove?
      // 'status' calculation seems relevant for low stock count later
      status: item.lastRestockQuantity ? Math.round((item.currentQuantity / item.lastRestockQuantity) * 100) : null, // Calculate status based on current/last restock
    }))
    .sort((a, b) => a.itemName.localeCompare(b.itemName)); // Simplified sort
};

// --- Helper function to calculate items with forecast ---
const calculateItemsWithForecast = (items, forecastData) => {
  if (!items.length || !forecastData.length) {
    return [];
  }
  const forecastMap = forecastData.reduce((map, f) => {
    // Ensure keys are consistent (string vs number) if necessary
    map[String(f.item_code)] = f.predicted_qty;
    return map;
  }, {});

  return items
    .filter((item) => forecastMap[String(item.itemNo)] !== undefined) // More robust check
    .map((item) => ({
      ...item,
      predictedQty: forecastMap[String(item.itemNo)], // Consider if restockQty should be different, e.g., predicted - current
      restockQty: Math.max(0, Math.ceil(forecastMap[String(item.itemNo)] - (item.currentQuantity || 0))), // Example: suggest restocking up to predicted
    }))
    .sort((a, b) => b.predictedQty - a.predictedQty) // sort by predicted qty desc
    .slice(0, 100); // top 100 items
};

const Dashboard = () => {
  // --- State ---
  // Date Range
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());

  // Raw Data States
  const [rawItems, setRawItems] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [neighborCount, setNeighborCount] = useState(null);
  const [popularItemData, setPopularItemData] = useState({ name: 'Loading...', data: [] });
  const [visitsData, setVisitsData] = useState({ startDate: '', endDate: '', visits: [] });
  const [totalUnitsTaken, setTotalUnitsTaken] = useState(null);

  // Derived/Processed Data States
  const [processedItems, setProcessedItems] = useState([]);
  const [itemsWithForecast, setItemsWithForecast] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0); // Count based on items *with forecast* being low

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if it's the first load

  // --- Memoized Values ---
  // Memoize date strings to avoid recalculating on every render
  const startDateStr = useMemo(() => startDate.format('YYYY-MM-DD'), [startDate]);
  const endDateStr = useMemo(() => endDate.format('YYYY-MM-DD'), [endDate]);
  const dateChanged = useMemo(() => !isInitialLoad, [isInitialLoad]); // Date changed if not initial load

  // --- Callbacks ---
  const handleStartDateChange = useCallback((newDate) => {
    setStartDate(newDate);
    setIsInitialLoad(false); // Mark date as changed
  }, []);

  const handleEndDateChange = useCallback((newDate) => {
    setEndDate(newDate);
    setIsInitialLoad(false); // Mark date as changed
  }, []);

  // --- Effects ---

  // Effect 1: Fetch all data when dates change
  useEffect(() => {
    const fetchAllData = async () => {
      // Ensure dates are valid before fetching
      if (!startDate || !startDate.isValid() || !endDate || !endDate.isValid()) {
        console.error('Invalid date range selected.');
        setError('Invalid date range selected.');
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log(`Fetching data for ${startDateStr} to ${endDateStr}`);

      try {
        const [itemsResponse, neighborsResponse, popularResponse, visitsResponse, forecastResponse, unitsTakenResponse] = await Promise.all([fetchRawItems().catch(e => {
          console.error('Error fetching items:', e);
          return { data: { items: [] } };
        }), axios.get(`/api/dashboard/weekly-neighbors?startDate=${startDateStr}&endDate=${endDateStr}`).catch(e => {
          console.error('Error fetching neighbors:', e);
          return { data: { number: null } };
        }), axios.get(`/api/dashboard/popular-items?startDate=${startDateStr}&endDate=${endDateStr}`).catch(e => {
          console.error('Error fetching popular items:', e);
          return { data: { name: 'Error', data: [] } };
        }), axios.get(`/api/dashboard/weekly-visits?startDate=${startDateStr}&endDate=${endDateStr}`).catch(e => {
          console.error('Error fetching visits:', e);
          return { data: { startDate: '', endDate: '', visits: [] } };
        }), axios.get('/api/reports/forecast').catch(e => {
          console.error('Error fetching forecast:', e);
          return { data: { success: false, predictions: [] } };
        }), // --- Add the new API call ---
          axios.get(`/api/dashboard/total-units-taken?startDate=${startDateStr}&endDate=${endDateStr}`).catch(e => {
            console.error('Error fetching total units taken:', e);
            return { data: { totalUnits: null } };
          })]);

        // --- Set Raw Data States ---
        setRawItems(itemsResponse?.data?.items || []);
        console.log("Fetched rawItems:", itemsResponse?.data?.items);
        setNeighborCount(neighborsResponse?.data?.number ?? null);
        setPopularItemData(popularResponse?.data || { name: 'Error', data: [] });
        setVisitsData(visitsResponse?.data || { startDate: '', endDate: '', visits: [] });
        setForecastData(forecastResponse?.data?.success ? (forecastResponse.data.predictions || []) : []);
        setTotalUnitsTaken(unitsTakenResponse?.data?.totalUnits ?? null);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        // Reset states on general failure
        setRawItems([]);
        setForecastData([]);
        setNeighborCount(null);
        setPopularItemData({ name: 'Error', data: [] });
        setVisitsData({ startDate: '', endDate: '', visits: [] });
        setTotalUnitsTaken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [startDate, endDate, startDateStr, endDateStr]);

  // Effect 2: Process raw items when they change
  useEffect(() => {
    const processed = processRawItems(rawItems);
    setProcessedItems(processed);
  }, [rawItems]);

  // Effect 3: Calculate itemsWithForecast when processedItems or forecastData change
  useEffect(() => {
    console.log('Attempting to calculate itemsWithForecast...');
    console.log('Processed Items:', processedItems);
    console.log('Forecast Data:', forecastData);
    const calculated = calculateItemsWithForecast(processedItems, forecastData);
    console.log('Calculated itemsWithForecast:', calculated);
    setItemsWithForecast(calculated);
  }, [processedItems, forecastData]);

  // Effect 4: Calculate lowStockCount when itemsWithForecast changes
  useEffect(() => {
    if (itemsWithForecast.length > 0) {
      // Calculate count based on your definition of "low stock"
      // Using the 'status' calculated earlier, assuming <= 20% is low stock
      // Or based on currentQuantity compared to a threshold if status isn't relevant
      const count = itemsWithForecast.filter(item => item.currentQuantity !== null && item.lastRestockQuantity && item.currentQuantity <= 0.2 * item.lastRestockQuantity).length;
      // Or maybe just: const count = itemsWithForecast.filter(item => item.status <= 20).length; // If status is reliable
      console.log('Recalculating low stock count from itemsWithForecast:', count);
      setLowStockCount(count);
    } else {
      setLowStockCount(0); // Reset if no items
    }
  }, [itemsWithForecast]);


  // --- Render Logic ---
  // Display loading or error states
  if (isLoading && isInitialLoad) { // Show full page loading only on initial load
    return <div className="mx-auto my-auto"><Loader /></div>;
  }

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  // Determine dynamic header text
  const neighborHeaderText = dateChanged ? 'Visits' : 'Weekly Visits';
  const neighborDescriptionTime = dateChanged ? 'during the selected period' : 'this week';

  return (<Container sx={{ display: 'flex', flexDirection: 'column', rowGap: '2rem' }}>
    {/* Header */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Title */}
      <Box sx={{ mb: { xs: '1rem', md: 'none' } }}>
        <Typography sx={{ fontSize: '2.5rem', fontWeight: 800 }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: 'gray' }}>Welcome back, User</Typography>
      </Box>
      {/* Date Pickers */}
      <Box
        sx={{
          display: 'flex', flexDirection: 'row', columnGap: '1rem', alignItems: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 600 }}>Date range:</Typography>
        <DatePicker
          className="date-input"
          label="Start"
          value={startDate}
          onChange={handleStartDateChange} // Use callback
          maxDate={endDate}
          disabled={isLoading} // Disable during loading
        />
        <Typography sx={{ fontWeight: 600, color: 'gray' }}>to</Typography>
        <DatePicker
          className="date-input"
          label="End"
          value={endDate}
          onChange={handleEndDateChange} // Use callback
          minDate={startDate}
          disabled={isLoading} // Disable during loading
        />
      </Box>
    </Box>

    {/* Loading Indicator (Subtle, for re-fetches) */}
    {isLoading && !isInitialLoad && <Typography>Updating data...</Typography>}

    {/* Card Grid */}
    <div className="flex flex-col-reverse max-w-[80vw] md:max-w-none md:grid md:grid-cols-[2fr_1fr] md:gap-4">
      {/* Left Column (2/3 width on md) */}
      <div className="grid grid-cols-2 [grid-template-rows:1fr_2fr] gap-4">
        <SimpleCard
          icon={<Person sx={{ fontSize: '4rem', color: '#992A1D' }} />}
          header={neighborHeaderText}
          mobileHeader={neighborHeaderText} // Use consistent header
          number={isLoading ? '...' : (neighborCount ?? 'N/A')} // Show loading/actual/NA
          trend="+10%" // Replace with dynamic data if available
          description={<span className="hidden md:block">
                <b>
                  {neighborCount !== null ? Math.round(neighborCount * 0.1) > 0 && Math.round(neighborCount * 0.1) : 'N/A'}
                </b>
            {' Neighbors visited the pantry ' + neighborDescriptionTime}
              </span>}
        />
        <SimpleCard
          icon={<Inventory2 sx={{ fontSize: '4rem', color: '#992A1D' }} />}
          header="Units Taken"
          number={isLoading ? '...' : (totalUnitsTaken ?? 'N/A')}
          trend="+5%"
          description={<span>
                            Total items taken by neighbors {dateChanged ? 'during this period' : 'this week'}.
                         </span>}
        />
        <PopularItemCard
          purchaseData={popularItemData.data}
          itemName={isLoading ? 'Loading...' : popularItemData.name}
          dateChanged={dateChanged}
        />
        <LastRestockCard
          items={processedItems}
        />
      </div>

      {/* Right Column (1/3 width on md) */}
      <div className="flex flex-col gap-6 mb-6 md:mb-0 flex-grow">
        <RestockCard
          lowStockCount={isLoading ? '...' : lowStockCount} // Pass calculated count
        />
        {/* Pass the calculated itemsWithForecast, not raw items/forecast */}
        <OrderTableCard
          recommendedItems={itemsWithForecast}
          isLoading={isLoading} // Pass loading state if OrderTable needs it
        />
      </div>
    </div>
  </Container>);
};

export default Dashboard;