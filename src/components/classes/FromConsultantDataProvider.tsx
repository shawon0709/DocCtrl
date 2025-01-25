import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface FromConsultantRowData {
  slNo: number;
  refNo: string | null;
  title: string | null;
  date: string | null;
}


interface FromConsultantDataContext {
  fromConsultantLoading: boolean;
  fromConsultantData: FromConsultantRowData[];
  fromConsultantError: string | null;
  fetchFromConsultantData: () => void;
  getAllSortedRefNoConsultant: () => { refNos: string[] };
  getSubmissionByRefNoConsultant: (refNos: string) => { date: string | null, title: string | null } | null;  
}

const FromConsultantDataContext = createContext<FromConsultantDataContext | undefined>(undefined);

export const FromConsultantDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fromConsultantLoading, setFromConsultantLoading] = useState<boolean>(false);
  const [fromConsultantData, setFromConsultantData] = useState<FromConsultantRowData[]>([]);
  const [fromConsultantError, setFromConsultantError] = useState<string | null>(null);
  
  const fetchFromConsultantData = async () => {
    setFromConsultantLoading(true);
      try {
        const response = await axios.get('/api/google-drive/GetFromConsultatntSheetData');
        const rawData = response.data;
        const rawSubData = response.data;

        // Skip the first row (column headers)
      const data = rawData.slice(1);


      console.log(response.data)
      // Set the data
      setFromConsultantData(response.data);

      } catch (error) {
        setFromConsultantError('Failed to fetch data');
      } finally {
        setFromConsultantLoading(false);
      }
    };

  useEffect(() => {    
    fetchFromConsultantData();
  }, []);

  const getAllSortedRefNoConsultant = (): { refNos: string[]} => {
    if (!fromConsultantLoading && !fromConsultantError && fromConsultantData.length > 0) {
      const refNos = [...fromConsultantData]
        .map(row => row.refNo)
        .filter(refNo => refNo !== null && refNo.trim() !== '')
        .map(refNo => refNo as string) // Ensure non-null values are of type string
        .sort();
    console.log(refNos)
      return { refNos };
    }
    return { refNos: []};
  };  
  
  const getSubmissionByRefNoConsultant = (refNos: string) => {
    if (!fromConsultantLoading && !fromConsultantError && fromConsultantData.length > 0) {
      const foundRow = [...fromConsultantData].find(row => row.refNo === refNos);
      if (foundRow) {
        return { date: foundRow.date, title: foundRow.title };
      }
    }
    return null;
  };
  
  return (
    <FromConsultantDataContext.Provider
      value={{
        fromConsultantLoading,
        fromConsultantData,
        fromConsultantError,
        fetchFromConsultantData,
        getAllSortedRefNoConsultant,
        getSubmissionByRefNoConsultant,
      }}
    >
      {children}
    </FromConsultantDataContext.Provider>
  );
};

export const FromConsultantUseData = (): FromConsultantDataContext => {
  const context = useContext(FromConsultantDataContext);
  if (!context) {
    throw new Error('ToConsultantUseData must be used within a ToConsultantDataProvider');
  }
  return context;
};
