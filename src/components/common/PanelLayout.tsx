import { ReactNode, useEffect, useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Dashboard from "../layout/Dashboard";
import FromConsultant from "../layout/incoming/FromConsultant";
import ToConsultant from "../layout/outgoing/ToConsultant";
import ToConsultantNew from "../layout/newdocument/ToConsultantNew";
import DocumentHistory from "../layout/DocumentHistory";
import FromEmployer from "../layout/incoming/FromEmployer";
import FromOthers from "../layout/incoming/FromOthers";
import ToOthers from "../layout/outgoing/ToOthers";
import ToEmployer from "../layout/outgoing/ToEmployer";


interface PanelLayoutProps {
    isLeftSectionCollapsed: boolean;
    toggleLeftSection: () => void;
}

const PanelLayout: React.FC<PanelLayoutProps> = ({ isLeftSectionCollapsed, toggleLeftSection }) => {

    const [activeContent, setActiveContent] = useState<string>('Dashboard');
    const sidebarItems = [
        { text: 'Dashboard' },
        { text: 'From Consultant' },
        { text: 'From Employer' },
        { text: 'From Others' },
        { text: 'To Consultant' },
        { text: 'To Employer' },
        { text: 'To Others' },
        { text: 'New Dcoument (To Consultant)' },
        { text: 'New Dcoument (To Employer)' },
        { text: 'New Dcoument (To Others)' },
        { text: 'Document History' },
        { text: 'Settings' },
        // Add more sidebar items as needed
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const [layoutTitle, setLayoutTitle] = useState<string>(sidebarItems[0].text); // Default to the first item

    useEffect(() => {
        // Update layoutTitle when activeContent changes
        const selectedLabel = sidebarItems.find(item => item.text === activeContent)?.text;
        if (selectedLabel) {
            setLayoutTitle(selectedLabel);
        }
    }, [activeContent, sidebarItems]);

    return (
        <div className="flex h-screen bg-rgb-241-245-249">

            {/* Left Section */}
            <Sidebar isLeftSectionCollapsed={isLeftSectionCollapsed} items={sidebarItems} setActiveContent={setActiveContent} />
            {/* Right Section */}
            <div className="flex-grow w-1/2">
                {/* Top Bar */}
                <TopBar isLeftSectionCollapsed={isLeftSectionCollapsed} toggleLeftSection={toggleLeftSection} title={activeContent}/>
                {/* Main Content */}
                <div className="flex-grow pl-2 pr-2 pt-2 pb-0 h-[90vh]">
                    {activeContent === 'Dashboard' ? <Dashboard /> : null}
                    {activeContent === 'From Consultant' ? <FromConsultant /> : null}
                    {activeContent === 'From Employer' ? <FromEmployer /> : null}
                    {activeContent === 'From Others' ? <FromOthers /> : null}
                    {activeContent === 'To Consultant' ? <ToConsultant /> : null}
                    {activeContent === 'To Employer' ? <ToEmployer /> : null}
                    {activeContent === 'To Others' ? <ToOthers /> : null}
                    {activeContent === 'New Dcoument (To Consultant)' ? <ToConsultantNew /> : null}
                    {activeContent === 'Document History' ? <DocumentHistory /> : null}
                </div>
            </div>



        </div>
    );
};

export default PanelLayout;