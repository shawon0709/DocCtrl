import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface RowData {
  slNo: number;
  runnNum: string | null;
  draftBy: string | null;
  refNo: string | null;
  title: string | null;  
  subDate: string | null;
  comments: string | null;
  remarks: string | null;
  [key: string]: any; // Add this if there are other properties
}

interface DraftByOption {
  name: string;
  title: string;
}

interface ToOthersDataContext {
  toOthersLoading: boolean;
  toOthersData: RowData[];
  toOthersSubmission: RowData[];
  toOthersError: string | null;
  getLastSlNo: () => number | null;
  getLastRefNo: () => string | null;
  draftByOption: DraftByOption[];
  fetchData: () => void;
}

const ToOthersDataContext = createContext<ToOthersDataContext | undefined>(undefined);

export const ToOthersDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toOthersLoading, setLoading] = useState<boolean>(false);
  const [toOthersData, setData] = useState<RowData[]>([]);
  const [toOthersSubmission, setSubmission] = useState<RowData[]>([]);
  const [toOthersError, setError] = useState<string | null>(null);
  const [draftByOption, setDraftByOption] = useState<DraftByOption[]>([]);
  
  const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/google-drive/GetToOthersSheetData');
        const rawData = response.data;
        const rawSubData = response.data;

        // Set the data
        setData(response.data);


        // Filter the data for toConsultantSubmission where slNo or refNo is not null
        const filteredSubmissionData = rawSubData.filter((row: RowData) => row.slNo !== null || row.refNo !== null);
        setSubmission(filteredSubmissionData);

        // Create an array of draftBy values
        const draftByArray: string[] = [];
        rawData.forEach((row: any) => {
          if (row.draftBy && row.draftBy.trim() !== '') {
            draftByArray.push(row.draftBy);
          }
        });
        // Separate the data by ')' and create a new array
        const separatedArray = draftByArray.flatMap((draftBy: string) => {
          return draftBy.split(')').map(entry => entry.trim() + ')');
        });
        // Define a regular expression pattern to match the desired format
        const formatRegex = /^[A-Za-z.]+\s+[A-Za-z]+\s*\(.*\)$/;

        // Filter the array to keep only the items that match the format
        const filteredArray = separatedArray.filter(entry => formatRegex.test(entry));

        // Remove duplicate values and create an array with unique values
        const uniqueArray = Array.from(new Set(filteredArray));


        // Transform the uniqueArray into an array of DraftByOption objects
        const draftByOptions: DraftByOption[] = uniqueArray.map((name: string) => {
          const titleIndex = name.indexOf('(');
          const title = titleIndex !== -1 ? name.substring(titleIndex + 1, name.length - 1) : '';
          const namePart = name.substring(0, titleIndex !== -1 ? titleIndex : name.length);
          return { name: namePart, title };
        });

        // Remove '\n' from the name property of each object in the draftByOptions array
        const updatedDraftByOptions = draftByOptions.map((option: DraftByOption) => {
          option.name = option.name.replace(/\n/g, '');
          const name = option.name.trim();
          const lastChar = name.slice(-1);
          if (lastChar === ' ') {
            option.name = name.slice(0, -1);
          } else {
            option.name = name;
          }
          option.title = '(' + option.title + ')';
          return option;
        });

        // Set the draftByOptions
        setDraftByOption(updatedDraftByOptions);


      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {    
    fetchData();
  }, []);

  const getLastSlNo = () => {
    if (!toOthersLoading && !toOthersError && toOthersData.length > 0) {
      const sortedData = [...toOthersData].sort((a, b) => b.slNo - a.slNo);
      const lastSerialNo = sortedData[0].slNo;
      const nextSerialNo = lastSerialNo + 1;
      return nextSerialNo;
    }
    return null;
  };

  const getLastRefNo = () => {
    if (!toOthersLoading && !toOthersError && toOthersData.length > 0) {
      const sortedData = [...toOthersData]
        .filter(row => row.refNo !== null && row.refNo.trim() !== '')
        .sort((a, b) => b.slNo - a.slNo);

      if (sortedData.length === 0) {
        return null;
      }

      const lastRefNo = sortedData[0].refNo;

      if (lastRefNo === null) {
        return null;
      }

      const parts = lastRefNo.split('-');

      if (parts.length !== 2) {
        return null;
      }

      const prefix = parts[0];
      const lastNumber = parseInt(parts[1]);
      if (isNaN(lastNumber)) {
        return null;
      }

      const nextNumber = lastNumber + 1;
      const nextRefNo = `${prefix}-${nextNumber}`;

      return nextRefNo;
    }

    return null;
  };



  return (
    <ToOthersDataContext.Provider
      value={{
        toOthersLoading,
        toOthersData,
        toOthersError,
        toOthersSubmission,
        getLastSlNo,
        getLastRefNo,
        draftByOption,
        fetchData,
      }}
    >
      {children}
    </ToOthersDataContext.Provider>
  );
};

export const ToOthersUseData = (): ToOthersDataContext => {
  const context = useContext(ToOthersDataContext);
  if (!context) {
    throw new Error('ToOthersUseData must be used within a ToOthersDataProvider');
  }
  return context;
};
