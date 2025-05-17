import * as React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";

const BasicPie = ({ demographics, width, height }) => {
  if (!demographics || Object.keys(demographics).length === 0) {
    return <p>No data available</p>; // Fallback if no purchaseData
  }

  const data = Object.entries(demographics)
    .filter(([_, value]) => value > 0) // Exclude zero values
    .map(([label, value]) => ({
      value,
      label,
    }));

  return (
    <div style={{ width, height, position: "relative" }}>
      {/* Original PieChart without modifications */}
      <PieChart
        series={[
          {
            data: data.length ? data : [{ label: "No Data", value: 1 }], // Ensure chart doesn't break
          },
        ]}
        width={width}
        height={height}
        legend={{ 
          hidden: true // Hide the default legend
        }}
      />
      
      {/* Custom legend positioned further right */}
      <div style={{ 
        position: "absolute", 
        top: "50%", 
        right: width * 0.02, // Even closer to right edge
        transform: "translateY(-50%)",
        width: width * 0.3, // Narrower width
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: 14,
          }}>
            <div style={{ 
              width: 18, 
              height: 18, 
              backgroundColor: ["#5CBCB7", "#4A90E2", "#B048AD"][index % 3], 
              marginRight: 12,
              flexShrink: 0
            }}></div>
            <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicPie;