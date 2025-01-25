import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface FromOthersRowData {
  slNo: number;
  runnNum: string | null;
  draftBy: string | null;
  refNo: string | null;
  title: string | null;  
  subDate: string | null;
  comments: string | null;
  remarks: string | null;
}


interface FromOthersDataContext {
  fromOthersLoading: boolean;
  fromOthersData: FromOthersRowData[];
  fromOthersError: string | null;
  fetchFromOthersData: () => void;
  getAllSortedRefNoOthers: () => { refNos: string[] };
  getSubmissionByRefNoOthers: (refNos: string) => { date: string | null, title: string | null } | null;  
}

const FromOthersDataContext = createContext<FromOthersDataContext | undefined>(undefined);

export const FromOthersDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fromOthersLoading, setFromOthersLoading] = useState<boolean>(false);
  const [fromOthersData, setFromOthersData] = useState<FromOthersRowData[]>([]);
  const [fromOthersError, setFromOthersError] = useState<string | null>(null);
  
  const fetchFromOthersData = async () => {
    setFromOthersLoading(true);
      try {
        const response = await axios.get('/api/google-drive/GetFromOthersSheetData');
        const rawData = response.data;
        const rawSubData = response.data;

        // Skip the first row (column headers)
      const data = rawData.slice(1);


      console.log(response.data)
      // Set the data
      setFromOthersData(response.data);

      } catch (error) {
        setFromOthersError('Failed to fetch data');
      } finally {
        setFromOthersLoading(false);
      }
    };

  useEffect(() => {    
    fetchFromOthersData();
  }, []);

  const getAllSortedRefNoOthers = (): { refNos: string[]} => {
    if (!fromOthersLoading && !fromOthersError && fromOthersData.length > 0) {
      const refNos = [...fromOthersData]
        .map(row => row.refNo)
        .filter(refNo => refNo !== null && refNo.trim() !== '')
        .map(refNo => refNo as string) // Ensure non-null values are of type string
        .sort();
    console.log(refNos)
      return { refNos };
    }
    return { refNos: []};
  };  
  
  const getSubmissionByRefNoOthers = (refNos: string) => {
    if (!fromOthersLoading && !fromOthersError && fromOthersData.length > 0) {
      const foundRow = [...fromOthersData].find(row => row.refNo === refNos);
      if (foundRow) {
        return { date: foundRow.subDate, title: foundRow.title };
      }
    }
    return null;
  };
  
  return (
    <FromOthersDataContext.Provider
      value={{
        fromOthersLoading,
        fromOthersData,
        fromOthersError,
        fetchFromOthersData,
        getAllSortedRefNoOthers,
        getSubmissionByRefNoOthers,
      }}
    >
      {children}
    </FromOthersDataContext.Provider>
  );
};

export const FromOthersUseData = (): FromOthersDataContext => {
  const context = useContext(FromOthersDataContext);
  if (!context) {
    throw new Error('ToOthersUseData must be used within a ToOthersDataProvider');
  }
  return context;
};
