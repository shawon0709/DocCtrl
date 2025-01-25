import React, { useState, useEffect } from 'react';

// Define props interface
interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the animation after the component mounts
    setIsVisible(true);
  }, []);

  return (
    <div className={`grid transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Individual project cards */}
      <div className="flex flex-col bg-slate-200 p-3 w-100 rounded-sm shadow-inner">
        <h1 className="text-xl ml-2.5 mb-1 underline decoration-double decoration-2 decoration-sky-500 antialiased font-semibold">Submission Status</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Drawing</h2>
              <span className="text-sm text-gray-500">
              <span className="text-sm text-gray-500"><b>Send:</b> 74 || </span>
              <span className="text-sm text-gray-500"><b>Replyed:</b> 37</span>
              </span>
            </div>
            <div className="mt-2 text-gray-600">Progress: 50%</div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: '50%' }}
              ></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Method Statement</h2>
              <span className="text-sm text-gray-500">
              <span className="text-sm text-gray-500"><b>Send:</b> 40 || </span>
              <span className="text-sm text-gray-500"><b>Replyed:</b> 30</span>
              </span>
            </div>
            <div className="mt-2 text-gray-600">Progress: 75%</div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>      
      {/* Repeat for other projects */}
    </div>
  );
};

export default Dashboard;
