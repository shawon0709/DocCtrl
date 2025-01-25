import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface RowData {
  slNo: number;
  refNo: string | null;
  srrNo: string | null;
  title: string | null;
  draftBy: string | null;
  subDate: string | null;
  revDate: string | null;
  revRefDate: string | null;
  cscTransGrade: string | null;
  comments: string | null;
  project: string | null;
  projectDash: string | null;
  org: string | null;
  orgDash: string | null;
  system: string | null;
  systemDash: string | null;
  location: string | null;
  locationDash: string | null;
  type: string | null;
  typeDash: string | null;
  role: string | null;
  roleDash: string | null;
  number: string | null;
  numberDash: string | null;
  revision: string | null;
  info: string | null;
  [key: string]: any; // Add this if there are other properties
}

interface DraftByOption {
  name: string;
  title: string;
}

interface SrrItem {
  original: string;
  numeric: number;
}

interface ToConsultantDataContext {
  toConsultantLoading: boolean;
  toConsultantData: RowData[];
  toConsultantSubmission: RowData[];
  toConsultantError: string | null;
  getLastSlNo: () => number | null;
  getLastRefNo: () => string | null;
  getLastSrrNo: () => string | null;
  getLastNumberByType: (type: string) => string | null; // Update here
  getLastRevisionByTypeAndNumber: (type: string, number: string) => string | null; // Update here
  draftByOption: DraftByOption[];
  fetchData: () => void;
  getAllSortedRefNoAndSrrNo: () => { refNos: string[], srrNos: string[] };
  getSubmissionByRefNoOrSrrNo: (refNoOrSrrNo: string) => { subDate: string | null, title: string | null } | null;  
}

const ToConsultantDataContext = createContext<ToConsultantDataContext | undefined>(undefined);

export const ToConsultantDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toConsultantLoading, setLoading] = useState<boolean>(false);
  const [toConsultantData, setData] = useState<RowData[]>([]);
  const [toConsultantSubmission, setSubmission] = useState<RowData[]>([]);
  const [toConsultantError, setError] = useState<string | null>(null);
  const [draftByOption, setDraftByOption] = useState<DraftByOption[]>([]);
  
  const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/google-drive/GetToConsultatntSheetData');
        const rawData = response.data;
        const rawSubData = response.data;

        // Set the data
        setData(response.data);


        // Filter the data for toConsultantSubmission where srrNo or number is not null
        const filteredSubmissionData = rawSubData.filter((row: RowData) => row.srrNo !== null || row.number !== null);
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
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const sortedData = [...toConsultantData].sort((a, b) => b.slNo - a.slNo);
      const lastSerialNo = sortedData[0].slNo;
      const nextSerialNo = lastSerialNo + 1;
      return nextSerialNo;
    }
    return null;
  };

  const getLastRefNo = () => {
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const sortedData = [...toConsultantData]
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

  const getLastSrrNo = () => {
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const sortedData = [...toConsultantData]
        .filter(row => row.srrNo !== null && row.srrNo.trim() !== '')
        .sort((a, b) => b.slNo - a.slNo);
      const srrNos = [...toConsultantData].map(item => item.srrNo).filter(srrNo => srrNo !== null).sort();;

      const sortedSrrNos = srrNos
        .map<SrrItem | null>(item => {
          if (item) {
            const match = item.match(/(\d+)-(\d+)/); // Extract the number parts from the SRR string
            if (match) {
              const prefix = match[1];
              const suffix = match[2];
              return { original: item, numeric: parseInt(`${prefix}${suffix}`, 10) };
            }
          }
          return null;
        })
        .filter((item): item is SrrItem => item !== null) // Type guard to filter out null values
        .sort((a, b) => a.numeric - b.numeric)
        .map(item => item.original);

      const lastSrrNos = sortedSrrNos[sortedSrrNos.length - 1];
      const cleanedLastSrrNo = lastSrrNos.replace(/\s\(Rev.*\)$/, '');

      // Extract the last SRR number from the cleanedLastSrrNo
      const lastSrrNumber = parseInt(cleanedLastSrrNo.match(/(\d+)$/)?.[1] || '0'); // Extract last number, default to 0 if not found

      // Increment the last SRR number by one
      const incrementedSrrNumber = lastSrrNumber + 1;

      // Reconstruct the SRR string with the incremented number
      const nextSrrNo = cleanedLastSrrNo.replace(/\d+$/, incrementedSrrNumber.toString().padStart(3, '0'));

      return nextSrrNo;
    }
    return null;
  };

  const getLastNumberByType = (type: string) => {
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const filteredData = [...toConsultantData]
        .filter(row => row.type === type && row.number !== null && row.number.trim() !== '')
        .sort((a, b) => b.slNo - a.slNo);

      if (filteredData.length === 0) {
        return null;
      }

      const lastNumber = filteredData[0].number;

      const nextNumber = String(Number(lastNumber) + 1).padStart(5, '0');

      return nextNumber;
    }

    return null;
  };

  const getLastRevisionByTypeAndNumber = (type: string, number: string) => {
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const filteredData = [...toConsultantData]
        .filter(row => row.type === type && row.number === number && row.revision !== null && row.revision.trim() !== '')
        .sort((a, b) => b.slNo - a.slNo);
  
      if (filteredData.length === 0) {
        return null;
      }
  
      const lastRevision = filteredData[0].revision;
  
      // Extract the alphabetic and numeric parts
      const match = lastRevision?.match(/^([A-Z]+)(\d+)$/);
      if (!match) {
        return null;
      }
  
      const alphabeticPart = match[1];
      const numericPart = match[2];
  
      // Increment the alphabetic part
      const nextAlphabeticPart = String.fromCharCode(alphabeticPart.charCodeAt(0) + 1);
  
      // Combine the incremented alphabetic part with the numeric part
      const nextRevision = `${nextAlphabeticPart}${numericPart}`;
  
      return nextRevision;
    }
  
    return null;
  };
  
  const getAllSortedRefNoAndSrrNo = (): { refNos: string[], srrNos: string[] } => {
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const refNos = [...toConsultantData]
        .map(row => row.refNo)
        .filter(refNo => refNo !== null && refNo.trim() !== '')
        .map(refNo => refNo as string) // Ensure non-null values are of type string
        .sort();
    
      const srrNos = [...toConsultantData]
        .map(row => row.srrNo)
        .filter(srrNo => srrNo !== null && srrNo.trim() !== '')
        .map(srrNo => srrNo as string) // Ensure non-null values are of type string
        .sort();
    
      return { refNos, srrNos };
    }
    return { refNos: [], srrNos: [] };
  };
  
  const getSubmissionByRefNoOrSrrNo = (refNoOrSrrNo: string) => {
    if (!toConsultantLoading && !toConsultantError && toConsultantData.length > 0) {
      const foundRow = [...toConsultantData].find(row => row.refNo === refNoOrSrrNo || row.srrNo === refNoOrSrrNo);
      if (foundRow) {
        return { subDate: foundRow.subDate, title: foundRow.title };
      }
    }
    return null;
  };

  return (
    <ToConsultantDataContext.Provider
      value={{
        toConsultantLoading,
        toConsultantData,
        toConsultantError,
        toConsultantSubmission,
        getLastSlNo,
        getLastRefNo,
        getLastSrrNo,
        getLastNumberByType,
        getLastRevisionByTypeAndNumber,
        draftByOption,
        fetchData,
        getAllSortedRefNoAndSrrNo,
        getSubmissionByRefNoOrSrrNo,
      }}
    >
      {children}
    </ToConsultantDataContext.Provider>
  );
};

export const ToConsultantUseData = (): ToConsultantDataContext => {
  const context = useContext(ToConsultantDataContext);
  if (!context) {
    throw new Error('ToConsultantUseData must be used within a ToConsultantDataProvider');
  }
  return context;
};
