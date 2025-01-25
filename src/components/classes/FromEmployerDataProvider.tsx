import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface FromEmployerRowData {
  slNo: number;
  refNo: string | null;
  title: string | null;
  date: string | null;
}


interface FromEmployerDataContext {
  fromEmployerLoading: boolean;
  fromEmployerData: FromEmployerRowData[];
  fromEmployerError: string | null;
  fetchFromEmployerData: () => void;
  getAllSortedRefNoEmployer: () => { refNos: string[] };
  getSubmissionByRefNoEmployer: (refNos: string) => { date: string | null, title: string | null } | null;  
}

const FromEmployerDataContext = createContext<FromEmployerDataContext | undefined>(undefined);

export const FromEmployerDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fromEmployerLoading, setFromEmployerLoading] = useState<boolean>(false);
  const [fromEmployerData, setFromEmployerData] = useState<FromEmployerRowData[]>([]);
  const [fromEmployerError, setFromEmployerError] = useState<string | null>(null);
  
  const fetchFromEmployerData = async () => {
    setFromEmployerLoading(true);
      try {
        const response = await axios.get('/api/google-drive/GetFromEmployerSheetData');
        const rawData = response.data;
        const rawSubData = response.data;

        // Skip the first row (column headers)
      const data = rawData.slice(1);


      console.log(response.data)
      // Set the data
      setFromEmployerData(response.data);

      } catch (error) {
        setFromEmployerError('Failed to fetch data');
      } finally {
        setFromEmployerLoading(false);
      }
    };

  useEffect(() => {    
    fetchFromEmployerData();
  }, []);

  const getAllSortedRefNoEmployer = (): { refNos: string[]} => {
    if (!fromEmployerLoading && !fromEmployerError && fromEmployerData.length > 0) {
      const refNos = [...fromEmployerData]
        .map(row => row.refNo)
        .filter(refNo => refNo !== null && refNo.trim() !== '')
        .map(refNo => refNo as string) // Ensure non-null values are of type string
        .sort();
    console.log(refNos)
      return { refNos };
    }
    return { refNos: []};
  };  
  
  const getSubmissionByRefNoEmployer = (refNos: string) => {
    if (!fromEmployerLoading && !fromEmployerError && fromEmployerData.length > 0) {
      const foundRow = [...fromEmployerData].find(row => row.refNo === refNos);
      if (foundRow) {
        return { date: foundRow.date, title: foundRow.title };
      }
    }
    return null;
  };
  
  return (
    <FromEmployerDataContext.Provider
      value={{
        fromEmployerLoading,
        fromEmployerData,
        fromEmployerError,
        fetchFromEmployerData,
        getAllSortedRefNoEmployer,
        getSubmissionByRefNoEmployer,
      }}
    >
      {children}
    </FromEmployerDataContext.Provider>
  );
};

export const FromEmployerUseData = (): FromEmployerDataContext => {
  const context = useContext(FromEmployerDataContext);
  if (!context) {
    throw new Error('ToEmployerUseData must be used within a ToEmployerDataProvider');
  }
  return context;
};
