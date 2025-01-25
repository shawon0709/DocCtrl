import { Button, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { RxTextAlignJustify, RxTextAlignLeft } from 'react-icons/rx';
import { useIsSmallScreen } from '../helpers/ResizeHelper';
import { PiUserFocusBold } from 'react-icons/pi';

interface TopBarProps {
  isLeftSectionCollapsed: boolean;
  toggleLeftSection: () => void;
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ isLeftSectionCollapsed, toggleLeftSection, title }) => {
  const { Title } = Typography;
  const [animate, setAnimate] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isSmallScreen = useIsSmallScreen();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate) {
      // Reset animation after a delay
      const timeout = setTimeout(() => {
        setAnimate(false);
      }, 1000); // Duration of the animation in milliseconds
      return () => clearTimeout(timeout); // Clear timeout on unmount
    }
  }, [animate]);

  useEffect(() => {
    // Trigger animation when the title changes
    setAnimate(true);
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between w-full bg-ghostwhite drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none min-h-[60px] px-4">
      <div className="flex items-center">
        {/* Button for toggling left section */}
        <button
          className="text-black p-4 duration-300 ease-linear"
          onClick={toggleLeftSection}
        >
          {isLeftSectionCollapsed ? <RxTextAlignLeft size={24} /> : <RxTextAlignJustify size={24} />}
        </button>
        <div className="mt-3">
          <Title
            level={isSmallScreen ? 5 : 3}
            className={`${animate ? 'animate-title' : ''} ${isSmallScreen ? '-mt-1' : ''}`}
          >
            {title}
          </Title>
        </div>
      </div>
      <div className="relative" ref={menuRef}>
        <Button className="ml-1" onClick={toggleMenu} type="dashed" shape="circle" icon={<PiUserFocusBold  />} />

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
              <div className="absolute top-0 right-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white transform -translate-y-full"></div>
              <ul>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={toggleMenu}>Profile</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={toggleMenu}>Settings</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={toggleMenu}>Logout</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;
