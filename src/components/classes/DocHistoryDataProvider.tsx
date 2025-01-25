import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface DocHisRowData {
  uniqueRefNo: string | null;
  sequence: string | null;
  title: string | null;
  refNo: string | null;
  date: string | null;
  sender: string | null;
  comment: string | null;
  remarks: string | null;
}


interface DocHistoryDataContext {
  docHistoryLoading: boolean;
  docHistoryData: DocHisRowData[];
  toConsultantSubmission: DocHisRowData[];
  docHistoryError: string | null;
  getLastUniqueRef: () => string | null;
  fetchDocHistoryData: () => void;
}

const DocHistoryDataContext = createContext<DocHistoryDataContext | undefined>(undefined);

export const DocHistoryDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [docHistoryLoading, setDocHistoryLoading] = useState<boolean>(false);
  const [docHistoryData, setDocHistoryData] = useState<DocHisRowData[]>([]);
  const [toConsultantSubmission, setSubmission] = useState<DocHisRowData[]>([]);
  const [docHistoryError, setDocHistoryError] = useState<string | null>(null);
  
  const fetchDocHistoryData = async () => {
      setDocHistoryLoading(true);
      try {
        const response = await axios.get('/api/google-drive/GetDocHistoryGoogleSheetData');
        const rawData = response.data;
        const rawSubData = response.data;

        // Skip the first row (column headers)
      const data = rawData.slice(1);

      // Set the data
      setDocHistoryData(response.data);


      } catch (error) {
        setDocHistoryError('Failed to fetch data');
      } finally {
        setDocHistoryLoading(false);
      }
    };

  useEffect(() => {    
    fetchDocHistoryData();
  }, []);

  const getLastUniqueRef = () => {
    if (!docHistoryLoading && !docHistoryError && docHistoryData.length > 0) {
      // Sort the data by uniqueRefNo
      const sortedData = [...docHistoryData].sort((a, b) => {
        const numA = parseInt(a.uniqueRefNo?.split('-')[1] || '0', 10);
        const numB = parseInt(b.uniqueRefNo?.split('-')[1] || '0', 10);
        return numB - numA;
      });
  
      const lastUniqueRef = sortedData[0].uniqueRefNo;
      console.log("lastUniqueRef : ", lastUniqueRef)
      if (lastUniqueRef) {
        // Extract the numeric part, increment it, and format it back
        const parts = lastUniqueRef.split('-');
        const prefix = parts[0];
        const number = parseInt(parts[1], 10) + 1;
        const nextUniqueRef = `${prefix}-${number.toString().padStart(3, '0')}`;
        return nextUniqueRef;
      }
    }
    
    return "MRTL1CP01-HIS-REF-001";
  };
  


  

  return (
    <DocHistoryDataContext.Provider
      value={{
        docHistoryLoading,
        docHistoryData,
        docHistoryError,
        toConsultantSubmission,
        getLastUniqueRef,
        fetchDocHistoryData,
      }}
    >
      {children}
    </DocHistoryDataContext.Provider>
  );
};

export const DocHistoryUseData = (): DocHistoryDataContext => {
  const context = useContext(DocHistoryDataContext);
  if (!context) {
    throw new Error('ToConsultantUseData must be used within a ToConsultantDataProvider');
  }
  return context;
};
