import React, { ReactNode } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  isLeftSectionCollapsed: boolean;
  toggleLeftSection: () => void;
  children: ReactNode; // Include children prop here
}

const MainLayout: React.FC<MainLayoutProps> = ({ isLeftSectionCollapsed, toggleLeftSection, children }) => {
  return (
    <div className="flex h-screen bg-rgb-241-245-249">
      {/* Left Section */}
      <Sidebar isLeftSectionCollapsed={isLeftSectionCollapsed} />
      {/* Right Section */}
      <div className="flex-grow w-1/2">
        {/* Top Bar */}
        <TopBar isLeftSectionCollapsed={isLeftSectionCollapsed} toggleLeftSection={toggleLeftSection} title={''} />
        {/* Main Content */}
        <div className="flex-grow p-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;