import React, { useEffect, useState } from 'react';
import { Calendar, Package } from 'lucide-react';
import dayjs from 'dayjs';
import { Card } from '@mui/material';

export default function LastRestockCard({ items }) {
  const [latestDate, setLatestDate] = useState(null);
  const [totalQuantity, setTotalQuantity] = useState(0);
  // const [showHistory, setShowHistory] = useState(false);
  const [restockHistory, setRestockHistory] = useState([]);
  useEffect(() => {
    if (!items || !items.length) return;
    // console.log(items)
    const filtered = items.filter(item => {
      const date = new Date(item.lastRestockDate);
      return item.lastRestockDate && !isNaN(date);
    });
    if (filtered.length === 0) {
      setLatestDate(null);
      setTotalQuantity(0);
      setRestockHistory([]);
      return;
    }
    const sorted = [...filtered].sort((a, b) => new Date(b.lastRestockDate) - new Date(a.lastRestockDate));
    const mostRecentDate = dayjs(sorted[0].lastRestockDate);
    const sameDateItems = filtered.filter(item => dayjs(item.lastRestockDate).isSame(mostRecentDate, 'day'));
    // :white_check_mark: Count unique items instead of summing quantity
    const uniqueItemCount = new Set(sameDateItems.map(item => item.itemNo || item.itemName)).size;
    const groupedByDate = {};
    filtered.forEach(item => {
      const key = dayjs(item.lastRestockDate).format('YYYY-MM-DD');
      if (!groupedByDate[key]) {
        groupedByDate[key] = new Set();
      }
      groupedByDate[key].add(item.itemNo || item.itemName);
    });
    const history = Object.entries(groupedByDate)
      .sort((a, b) => new Date(b[0]) - new Date(a[0])) // most recent first
      .map(([dateKey, itemSet]) => ({
        date: dayjs(dateKey).format('MMMM D, YYYY'), items: itemSet.size, status: 'Completed',
      }));
    setLatestDate(mostRecentDate);
    setTotalQuantity(uniqueItemCount); // :white_check_mark: changed
    setRestockHistory(history.slice(1, 11));
  }, [items]);
  return (<Card sx={{
      padding: '2rem 1.5rem',
      border: 'solid rgba(108, 115, 108, 0.2)',
      boxShadow: 'unset',
      borderRadius: '1.5rem',
      borderWidth: '0.1rem',
      display: 'flex',
      flexDirection: 'column',
      rowGap: '0.3rem',
      height: { xs: 'fit-content', md: 'auto' },
    }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Last Restock</h2>
        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600 flex items-center">
          <Calendar size={16} className="mr-1" />
          {latestDate ? latestDate.format('MMMM D, YYYY') : 'No data'}
        </span>
      </div>
      <div className="flex items-center mt-4">
        <div className="rounded-full bg-gray-100 p-3 mr-4">
          <Package size={24} className="text-gray-500" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">{totalQuantity}</p>
          <p className="text-gray-500">item{totalQuantity !== 1 ? 's' : ''} restocked</p>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Previous Restocks</h3>
        <div
          className="bg-gray-50 rounded-md overflow-y-auto"
          style={{
            maxHeight: '12rem', height: '12rem',
          }}
        >
          {restockHistory.map((entry, index) => (<div
              key={index}
              className={`flex justify-between items-center p-3 ${index !== restockHistory.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{entry.date}</p>
                <p className="text-sm text-gray-500">
                  {entry.items} item{entry.items !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {entry.status}
                </span>
            </div>))}
        </div>
      </div>
    </Card>);
}