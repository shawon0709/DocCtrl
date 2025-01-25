import React, { useState, useEffect } from 'react';
import { IFloatingFilterParams, IFloatingFilter } from 'ag-grid-community';

interface CustomFloatingFilterProps {
  column: {
    getFilterText: () => string;
    setFilterText: (text: string) => void;
    getUniqueValues: () => string[];
  };
  onFilterChanged: (column: any, filterModel: { [key: string]: string }) => void;
}

const CustomFloatingFilter: React.FC<CustomFloatingFilterProps> = ({ column, onFilterChanged }) => {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [uniqueValues, setUniqueValues] = useState<string[]>([]);

  useEffect(() => {
    // Dynamically fetch unique values from the column data
    setUniqueValues(column.getUniqueValues());
  }, [column]);

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleItemClick = (item: string) => {
    setSelectedItems((prevItems) => ({ ...prevItems, [item]: !prevItems[item] }));
  };

  const handleApplyFilter = () => {
    const filterModel: { [key: string]: string } = {};
    Object.keys(selectedItems).forEach((item) => {
      if (selectedItems[item]) {
        filterModel[item] = item;
      }
    });
    onFilterChanged(column, filterModel);
    setShowPopup(false);
  };

  return (
    <div>
      <input
        type="text"
        value={column.getFilterText()}
        onChange={(e) => column.setFilterText(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={handleTogglePopup}>Show all</button>
      {showPopup && (
        <div className="popup">
          <ul>
            {uniqueValues.map((item) => (
              <li key={item}>
                <input
                  type="checkbox"
                  checked={!!selectedItems[item]}
                  onChange={() => handleItemClick(item)}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button onClick={handleApplyFilter}>Apply filter</button>
        </div>
      )}
    </div>
  );
};

export default CustomFloatingFilter;
