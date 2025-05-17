import { useEffect, useState } from 'react';
import PieChart from '../components/PieChart';
import ContentCard from '../components/ContentCard';
import AgeDistributionCard from '../components/AgeDistributionCard';
import SimpleCardWithDropDown from '../components/SimpleCardWithDropDown';
import HeatmapCard from '../components/HeatMapCard.jsx';
import axios from 'axios';
import SimpleCardWithDropDownNeighbors from '../components/SimpleCardWithDropDownNeighbors';
import { getItems } from '../api/item.js';
import { Inventory2 } from '@mui/icons-material';

const Reports = () => {
  const [items, setItems] = useState([]);
  const [genderData, setGenderData] = useState({});
  const [ageData, setAgeData] = useState([]);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getItems();
        console.log(res.data);
        if (res.data.items) {
          const updatedItems = res.data.items.map((item) => ({
            ...item,
            changed: false,
            status: item.lastRestockQuantity ? Math.round((item.currentQuantity / item.lastRestockQuantity) * 100) : null,
          }))
            .sort((a, b) => {
              if (a.itemName < b.itemName) {
                return -1; // a should come before b
              }
              if (a.itemName > b.itemName) {
                return 1; // b should come before a
              }
              return 0; // a and b are equal in name
            });

          setItems(updatedItems);
        } else {
          console.error('Items not found in the response');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();

    const fetchGenderData = async () => {
      try {
        const response = await axios.get('/api/reports/gender-distribution');
        console.log('Gender Data:', response.data);
        setGenderData(response.data.genderData);
      } catch (error) {
        console.error('Error fetching gender purchaseData:', error);
        setGenderData({});
      }
    };

    const fetchAgeData = async () => {
      try {
        const response = await axios.get('/api/reports/age-distribution');
        console.log('Age Data:', response.data);
        setAgeData(response.data.ageData);
      } catch (error) {
        console.error('Error fetching age purchaseData:', error);
        setAgeData([]);
      }
    };

    fetchGenderData();
    fetchAgeData();
  }, []);

  return <div className="flex flex-col gap-8 px-8 w-full">
    {/* Dashboard Header Container */}
    <div className="flex justify-between items-center w-full">
      <div>
        <h1 className="text-4xl font-extrabold">Reports</h1>
        <p className="text-gray-500 pt-2">Welcome back, User</p>
      </div>
    </div>
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-8">
        <SimpleCardWithDropDown icon={<Inventory2 sx={{ fontSize: "4rem", color: "#992A1D" }} />} items={items} />
        <SimpleCardWithDropDownNeighbors icon={<Inventory2 sx={{ fontSize: "4rem", color: "#992A1D" }} />} items={items} />
        <ContentCard
          header="Gender Distribution"
          content={<PieChart demographics={genderData} width={250} height={300} />}
        />
        {/* <SimpleCard header="Neighbor Card 2" /> */}
        <AgeDistributionCard data={ageData} />
        <div className="col-span-2">
          {/* Heatmap Card */}
          <HeatmapCard />
        </div>
      </div>
    </div>
  </div>;
};

export default Reports;