import { Box, Card, Typography } from '@mui/material';

import '../styles/Dashboard.css';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
// import { getItems } from "../api/item.js";
// import { getPurchases } from "../api/purchase.js";

const SimpleCardWithDropDown = ({
  items,
  img,
  header,
  mobileHeader,
  number,
  trend,
  description,
  icon,
}) => {
  // const [item, setItem] = useState("Apples");
  // const [selectedItem, setSelectedItem] = useState(items && items.length > 0 ? items[0] : "");

  const [selectedItem, setSelectedItem] = useState("");
  const [currentWeekCount, setCurrentWeekCount] = useState(0);
  const [previousWeekCount, setPreviousWeekCount] = useState(0);


  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedItem(items[0].itemName);
    }
  }, [items]);

  useEffect(() => {
    const getStartOfWeek = (date) => {
      return moment(date).startOf('week');
    };

    const getStartOfPreviousWeek = (date) => {
      return moment(date).subtract(1, 'week').startOf('week');
    };

    const countItemsTakenThisWeek = (history) => {
      const startOfCurrentWeek = getStartOfWeek(new Date());
      const endOfCurrentWeek = moment(startOfCurrentWeek).endOf('week'); // Saturday

      return history
        .filter((entry) => {
          const entryDate = moment(entry.purchaseDate);
          return entryDate.isBetween(startOfCurrentWeek, endOfCurrentWeek, null, '[]');
        })
        .reduce((sum, entry) => {
          return sum + (entry.startQuantity - entry.quantity);
        }, 0);
    };

    const countItemsTakenPreviousWeek = (history) => {
      const startOfPreviousWeek = getStartOfPreviousWeek(new Date());
      const endOfPreviousWeek = moment(startOfPreviousWeek).endOf('week'); // Saturday

      return history
        .filter((entry) => {
          const entryDate = moment(entry.purchaseDate);
          return entryDate.isBetween(startOfPreviousWeek, endOfPreviousWeek, null, '[]');
        })
        .reduce((sum, entry) => {
          return sum + (entry.startQuantity - entry.quantity);
        }, 0);
    };

    if (selectedItem && items.length) {
      const selectedItemData = items.find(item => item.itemName === selectedItem);

      if (selectedItemData && selectedItemData.history) {
        const thisWeek = countItemsTakenThisWeek(selectedItemData.history);
        const previousWeek = countItemsTakenPreviousWeek(selectedItemData.history);

        setCurrentWeekCount(thisWeek);
        setPreviousWeekCount(previousWeek);
      }
    }
  }, [selectedItem, items]);

  return (
    <Card
      sx={{
        padding: "2rem 1.5rem",
        border: "solid rgba(108, 115, 108, 0.2)",
        boxShadow: "unset",
        borderRadius: "1.5rem",
        borderWidth: "0.1rem",
        display: "flex",
        flexDirection: "row",
        columnGap: "2rem",
        height: { xs: "fit-content", md: "auto" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="p-2 rounded-lg border border-gray-300 text-lg mb-4 w-20"
          >
            {items.map((item) => (
              <option key={item._id} value={item.itemName}>
                {item.itemName}
              </option>
            ))}
          </select>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {img && (
            <img
              className="hidden md:inline dashboard-card-img"
              src={img}
              alt="image"
            />
          )}
          <div className="hidden md:inline-flex">{icon && icon}</div>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: "0.5rem",
        }}
      >
        {/* Mobile Header */}
        <Typography
          sx={{
            color: "gray",
            fontWeight: 500,
            display: { md: "none" },
          }}
        >
          {mobileHeader}
        </Typography>
        {/* Larger Screen Header */}
        <Typography
          sx={{
            color: "gray",
            fontWeight: 500,
            display: { xs: "none", md: "block" },
          }}
        >
          <span>
            Number of{" "}
            <span style={{ textDecoration: "underline", fontStyle: "italic" }}>
              {selectedItem.toLowerCase()}
            </span>{" "}
            taken this week
          </span>
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "start", md: "center" },
            justifyContent: "space-around",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "700",
              fontSize: { xs: "1.8rem", md: "3.8rem" },
            }}
          >
            {currentWeekCount}
          </Typography>
          <Typography
            sx={{
              mt: { xs: "0.5rem", md: "none" },
              borderRadius: "1rem",
              backgroundColor: currentWeekCount > previousWeekCount ? "#E8FBE8" : "#F8D7DA",
              color: currentWeekCount > previousWeekCount ? "#6A846B" : "#721C24",
              padding: "0.1rem 0.7rem",
              fontWeight: 600,
            }}
          >
            {previousWeekCount === 0
              ? 'N/A%'
              : currentWeekCount >= previousWeekCount
              ? `${Math.round(((currentWeekCount - previousWeekCount) / previousWeekCount) * 100)}%+`
              : `${Math.round(((previousWeekCount - currentWeekCount) / previousWeekCount) * 100)}%-`}
          </Typography>

        </Box>
        <Typography
          sx={{
            color: "#6C736C99",
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
        <span>
          <b>{currentWeekCount}</b> {currentWeekCount >= previousWeekCount ? 'more' : 'less'}{" "}
          <span style={{ textDecoration: "underline", fontStyle: "italic" }}>
            {selectedItem.toLowerCase()}
          </span>{" "}
          were taken this week compared to last week.
        </span>
        </Typography>
      </Box>
    </Card>
  );
};

export default SimpleCardWithDropDown;
