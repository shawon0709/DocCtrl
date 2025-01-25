import React, { useState, useEffect } from 'react';
import PanelLayout from '../common/PanelLayout';

// Define props interface
interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
    const [isLeftSectionCollapsed, setLeftSectionCollapsed] = useState(false);

    const toggleLeftSection = () => {
      setLeftSectionCollapsed(!isLeftSectionCollapsed);
    };

  return (
    <PanelLayout isLeftSectionCollapsed={isLeftSectionCollapsed} toggleLeftSection={toggleLeftSection}>
      {/* Main Content */}
      
    </PanelLayout>
  );
};

export default AdminLayout;
