import { google } from 'googleapis';

const SHEET_NAME = 'LetterHistory';
const API_KEY = 'AIzaSyBrgj4raIYX7uH9Wn8j6B-SNCIeo6zRZqQ';
const SHEET_ID = '1AljoNJgkNKdTHUcSD_5Wb4JOiZxMI9UkAnEDG_SXKok';
const RANGE = 'A2:H'; // Adjusted to skip the first row

export interface RowData {
  uniqueRefNo: string | null;
  sequence: string | null;
  title: string | null;
  refNo: string | null;
  date: string | null;
  sender: string | null;
  comment: string | null;
  remarks: string | null;
}

async function getSheetData(): Promise<string[][] | undefined> {
  const sheets = google.sheets({ version: 'v4', auth: API_KEY });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!${RANGE}`,
    key: API_KEY,
  });
  return (response.data.values as string[][]) || undefined;
}

function isEmptyRow(row: string[]): boolean {
  return row.every(cell => cell === undefined || cell === null || cell === '');
}

function transformData(data: string[][]): RowData[] {
  return data
    .filter(row => !isEmptyRow(row)) // Filter out empty rows
    .map((row, index) => ({
      uniqueRefNo: row[0] || null,
      sequence: row[1] || null,
      title: row[2] || null,
      refNo: row[3] || null,
      date: row[4] || null,
      sender: row[5] || null,
      comment: row[6] || null,
      remarks: row[7] || null,
    }));
}

export async function fetchDocHistoryGoogleSheetData(): Promise<RowData[]> {
  try {
    const data = await getSheetData();
    if (data) {
      return transformData(data);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return [];
  }
}
