import React, { useState, useEffect, useRef } from 'react';
import { RxTextAlignJustify, RxTextAlignLeft } from 'react-icons/rx';
import { useIsSmallScreen } from '../helpers/ResizeHelper';
import { MdOutlineDashboard, MdOutlineSettings } from 'react-icons/md';
import { ImDownload, ImUpload } from 'react-icons/im';
import { FaUserAstronaut, FaUserGroup, FaUserTie } from 'react-icons/fa6';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GrDocumentDownload, GrDocumentTime, GrDocumentUpdate, GrDocumentUpload } from 'react-icons/gr';

interface SidebarLink {
  text: string;
}

interface SidebarProps {
  isLeftSectionCollapsed: boolean;
  items?: SidebarLink[];
  setActiveContent?: React.Dispatch<React.SetStateAction<string>>;
}

interface SidebarItem {
  icon: JSX.Element;
  text: string;
  subItems?: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isLeftSectionCollapsed, setActiveContent }) => {
  const isSmallScreen = useIsSmallScreen();
  const subItemsRef = useRef<HTMLUListElement>(null);
  const items: SidebarItem[] = [
    { icon: <MdOutlineDashboard size={18}/>, text: 'Dashboard'},
    {
      icon: <GrDocumentDownload size={18} />, text: 'Incoming', subItems: [
        { icon: <FaUserAstronaut />, text: 'From Consultant' },
        { icon: <FaUserTie />, text: 'From Employer' },
        { icon: <FaUserGroup />, text: 'From Others' }
      ]
    },
    {
      icon: <GrDocumentUpload size={18} />, text: 'Outgoing', subItems: [
        { icon: <FaUserAstronaut />, text: 'To Consultant' },
        { icon: <FaUserTie />, text: 'To Employer' },
        { icon: <FaUserGroup />, text: 'To Others' }
      ]
    },
    {
      icon: <GrDocumentUpdate size={18} />, text: 'New Document', subItems: [
        { icon: <FaUserAstronaut />, text: 'New Dcoument (To Consultant)' },
        { icon: <FaUserTie />, text: 'New Dcoument (To Employer)' },
        { icon: <FaUserGroup />, text: 'New Dcoument (To Others)' }
      ]
    },
    { icon: <GrDocumentTime size={18} />, text: 'Document History' },
    { icon: <MdOutlineSettings size={18} />, text: 'Settings' },
  ];

  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ parent: number | null, sub: number | null }>({ parent: 0, sub: null });
  const [parentItemExpanded, setParentItemExpanded] = useState<boolean | null>(false);

  const handleItemClick = (parentIndex: number, subIndex: number | null = null) => {
    if (subIndex === null && items[parentIndex].subItems) {
      setExpandedItem(expandedItem === parentIndex ? null : parentIndex);
      setParentItemExpanded(false);
    } else {
      setSelectedItem({ parent: parentIndex, sub: subIndex });
      if (setActiveContent) {
        setActiveContent(items[parentIndex].text);
      }
    }
  };

  const handleSubItemClick = (parentIndex: number, subIndex: number) => {
    setSelectedItem({ parent: parentIndex, sub: subIndex });
    const subItems = items[parentIndex].subItems;
    if (subItems && setActiveContent) {
      setActiveContent(subItems[subIndex].text);
    }
  };
  

  return (
    <div className={`${isLeftSectionCollapsed ? 'sm:max-w-[70px] max-w-0' : 'sm:max-w-[190px] max-w-[70px]'} flex-grow bg-black-1 duration-200 ease-linear dark:bg-boxdark hover:text-white text-white`}>
      <div className={`logo bg-black-2 ${isLeftSectionCollapsed ? 'pt-4 text-2xl': (isSmallScreen ? 'pt-4 text-2xl':'pl-6 text-5xl')} duration-200 ease-linear`}>
      <span className="fancy">TMJV</span>
      </div>
      <ul className={`p-0 ${isSmallScreen && isLeftSectionCollapsed ? '-ml-8' : 'm-1'} text-sm`}>
        {items.map((item, index) => (
          <li key={index} className={`relative max-h-auto`}>
            <div onClick={() => handleItemClick(index)}
              className={`flex items-center px-4 py-2 cursor-pointer ${(selectedItem.parent === index && selectedItem.sub === null && !items[index].subItems) ? `selected-item ${isSmallScreen && isLeftSectionCollapsed ? '' : 'bg-gray-700'} text-white duration-200 ease-linear` : ''} ${!parentItemExpanded && selectedItem.parent === index ? 'parent-item-selected' : ''}`}>
              {item.icon}
              {!isLeftSectionCollapsed && !isSmallScreen && <span className="ml-2 text-xs">{item.text}</span>}
              {item.subItems && ((!isSmallScreen && !isLeftSectionCollapsed)) && (
                <span className={`ml-auto rotate-arrow ${expandedItem === index ? 'rotate-up' : 'rotate-down'}`}>
                  {expandedItem === index ? <FaChevronDown /> : <FaChevronDown />}
                </span>
              )}
            </div>
            {item.subItems && expandedItem === index ?
              <ul className={`pl-4 ${expandedItem === index ? 'sidebar-subitems-anim visible' : ''}`}>
                {item.subItems?.map((subItem, subIndex) => (
                  <li key={subIndex}
                    onClick={() => handleSubItemClick(index, subIndex)}
                    className={`flex items-center px-4 py-2 cursor-pointer ${selectedItem.parent === index && selectedItem.sub === subIndex ? `selected-item ${isSmallScreen && isLeftSectionCollapsed ? '' : 'bg-gray-600'} text-white duration-200 ease-linear` : ''}`}>
                    {subItem.icon}
                    {!isLeftSectionCollapsed && !isSmallScreen && <span className="ml-2 text-xs">{subItem.text}</span>}
                  </li>
                ))}
              </ul>
              :
              <ul className={`pl-4 sidebar-subitems-anim`}>
                {item.subItems?.map((subItem, subIndex) => (
                  <li key={subIndex}
                    onClick={() => handleSubItemClick(index, subIndex)}
                    className={`flex items-center px-4 py-2 cursor-pointer ${selectedItem.parent === index && selectedItem.sub === subIndex ? `selected-item ${isSmallScreen && isLeftSectionCollapsed ? '' : 'bg-gray-600'} text-white duration-200 ease-linear` : ''}`}>
                    {subItem.icon}
                    {!isLeftSectionCollapsed && !isSmallScreen && <span className="ml-2">{subItem.text}</span>}
                  </li>
                ))}
              </ul>
            }
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
