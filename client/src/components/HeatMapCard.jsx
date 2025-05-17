// HeatmapCard.jsx
import { useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { getNeighbors } from '../api/neighbor';
import 'leaflet/dist/leaflet.css';

// --- Coordinate Mapping ---
// Maps zip codes to approximate geographical center coordinates [latitude, longitude]
// Includes original and newly extracted zip codes from the database.
const zipCodeCoordinates = {
  '60513': [41.8328, -87.8467], // Brookfield
  '60402': [41.8224, -87.8375], // Berwyn
  '60546': [41.8294, -87.8287], // Riverside
  '60534': [41.8319, -87.8652], // Lyons
  '60525': [41.8050, -87.8731], // La Grange
  '60154': [41.8567, -87.8856], // Westchester (Kept from original, verify if still needed)
  '60141': [41.8789, -87.8340], // Hillside (Kept from original, verify if still needed)
  '60130': [41.8696, -87.8179], // Forest Park
  '60153': [41.9070, -87.8681], // Melrose Park
  '60164': [41.9167, -87.9036], // Northlake
  '60304': [41.8750, -87.7960], // Oak Park (South)
  '60455': [41.6070, -87.7428], // Oak Forest
  '60458': [41.7080, -87.7500], // Oak Lawn (South)
  '60462': [41.6289, -87.8548], // Orland Park
  '60478': [41.5750, -87.7860], // Tinley Park (South)
  '60501': [41.8089, -87.7939], // Stickney
  '60502': [41.8458, -87.7540], // Cicero
  '60507': [41.7928, -87.8195], // Summit
  '60514': [41.7967, -87.9564], // Clarendon Hills
  '60526': [41.8311, -87.8708], // La Grange Park
  '60558': [41.8086, -87.9026], // Western Springs
  '60632': [41.8028, -87.7131], // Chicago (Archer Heights / Gage Park)
  '60638': [41.7833, -87.7756], // Chicago (Clearing / Garfield Ridge)
  '60651': [41.8992, -87.7597], // Chicago (Austin)
  '60804': [41.8458, -87.7540], // Cicero (Often covers similar area to 60502)

  // Add more zip codes and their coordinates as needed
};
// --- End Coordinate Mapping ---


const HeatmapCard = () => {
  const foodPantryLocation = [41.8328, -87.8467]; // Food pantry center
  const [clientData, setClientData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndProcessNeighbors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const neighborsList = await getNeighbors();

        const zipCounts = neighborsList.reduce((acc, neighbor) => {
          // --- FIX: Use lowercase 'zipcode' ---
          if (neighbor && neighbor.zipcode) {
            // --- FIX: Use lowercase 'zipcode' ---
            const zip = neighbor.zipcode.toString().trim(); // Added toString() and trim() for robustness
            acc[zip] = (acc[zip] || 0) + 1;
          } else {
            // This log should now only trigger if zipcode is truly missing or null/undefined
            console.warn("Neighbor record missing or has invalid Zipcode property:", neighbor);
          }
          return acc;
        }, {});

        // --- The rest of your processing logic ---
        const transformedData = Object.entries(zipCounts).map(([zipCode, count]) => ({
          zipCode,
          coordinates: zipCodeCoordinates[zipCode] || null, // Lookup still uses the string key
          count,
        }))
          .filter(item => item.coordinates !== null);

        const mappedZips = new Set(transformedData.map(item => item.zipCode));
        Object.keys(zipCounts).forEach(zip => {
          if (!mappedZips.has(zip)) {
            // This warning is now more meaningful - it means the zip exists in data but not in your coordinates map
            console.warn(`Zip code ${zip} from database has no coordinates defined in zipCodeCoordinates.`);
          }
        });

        setClientData(transformedData);

      } catch (err) {
        console.error('Error fetching or processing neighbor data:', err);
        setError('Failed to load client distribution data.');
        setClientData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessNeighbors();
  }, []);

  const maxCount = useMemo(() => {
    if (clientData.length === 0) return 1;
    return Math.max(1, ...clientData.map(item => item.count));
  }, [clientData]);

  const getCircleProps = (count) => {
    const baseRadius = 300;
    const scalingFactor = 1200;
    const radius = baseRadius + (count / maxCount) * scalingFactor;
    const colorIntensity = Math.min(1, Math.max(0, count / maxCount));
    const r = 255;
    const g = Math.floor(255 * (1 - colorIntensity));
    const b = 0;

    return {
      radius,
      color: `rgb(${r}, ${g}, ${b})`,
      fillColor: `rgb(${r}, ${g}, ${b})`,
      fillOpacity: 0.5,
      weight: 1,
    };
  };

  // Leaflet ID workaround
  useEffect(() => {
    const container = document.getElementById('zipcode-visualization-container');
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl border-solid border-[0.1rem] border-[rgba(108,115,108,0.2)] p-4 flex flex-col h-[30rem]">
      <h2 className="text-xl font-bold mb-2">Client Distribution by Zip Code</h2>
      <p className="text-sm text-gray-600 mb-4">
        Circle size and color intensity represent the number of clients in each zip code.
      </p>

      {isLoading && <p className="text-center text-gray-500 py-4">Loading map data...</p>}
      {error && <p className="text-center text-red-600 py-4">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="flex-grow relative">
          <MapContainer
            key={clientData.length}
            id="zipcode-visualization-container"
            center={foodPantryLocation}
            zoom={11} // Slightly zoomed out to potentially fit more zip codes
            style={{ height: '100%', width: '100%', borderRadius: '10px', position: 'absolute' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {clientData.map((item) => (
              <Circle
                key={item.zipCode}
                center={item.coordinates}
                {...getCircleProps(item.count)}
              >
                <Tooltip permanent={item.count > maxCount / 5}>
                  <div>
                    <strong>Zip: {item.zipCode}</strong>
                    <br />
                    Clients: {item.count}
                  </div>
                </Tooltip>
              </Circle>
            ))}
          </MapContainer>
        </div>
      )}

      {!isLoading && !error && clientData.length > 0 && (
        <div className="mt-2 pt-2 border-t flex items-center justify-end">
          <div className="text-xs text-gray-600 mr-2">Client Density:</div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1 border border-gray-300"></div>
            <div className="text-xs mr-2">Low</div>
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-1 border border-gray-300"></div>
            <div className="text-xs mr-2">Medium</div>
            <div className="w-3 h-3 rounded-full bg-red-600 mr-1 border border-gray-300"></div>
            <div className="text-xs">High</div>
          </div>
        </div>
      )}
      {!isLoading && !error && clientData.length === 0 && (
        <p className="text-center text-gray-500 py-4">No client data available for the mapped zip codes. Check console for unmapped zip codes.</p>
      )}
    </div>
  );
};

export default HeatmapCard;