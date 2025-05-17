import PropTypes from "prop-types";

InventoryHeader.propTypes = {
  selectedStatus: PropTypes.string,
  setSelectedStatus: PropTypes.func,
  selectedCategory: PropTypes.string,
  setSelectedCategory: PropTypes.func,
  categories: PropTypes.array, // ✅ Accept dynamic categories
};

export default function InventoryHeader({
  selectedStatus,
  setSelectedStatus,
  selectedCategory,
  setSelectedCategory,
  categories, // ✅ Use dynamic food categories
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="!text-4xl !font-extrabold">Inventory</h1>
        <p className="!text-gray-500 pt-2">Welcome back, User</p>
      </div>
      <div className="!flex !space-x-4 !items-center">
        {/* Status Dropdown */}
        <span className="!font-semibold">Status:</span>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-xl"
        >
          <option value="All">All</option>
          <option value="Low Stock: Restock Needed">Low Stock: Restock Needed</option>
          <option value="Stock in Safe Range">Stock in Safe Range</option>
          <option value="Surplus Stock">Surplus Stock</option>
        </select>

        {/* Food Category Dropdown (Dynamic) */}
        <span className="!font-semibold">Food category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="!p-2 !border !border-gray-300 !rounded-xl"
        >
          <option value="All">All</option>
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))
          ) : (
            <option disabled>Loading categories...</option>
          )}
        </select>
      </div>
    </div>
  );
}
