import { google } from 'googleapis';
import path from 'path';

const KEYFILE_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

const SPREADSHEET_ID = '1xNONDEKOtaSA6S1gxLXwJmT6IuT0_LXBRKF_VaJhZdE';
const SHEET_NAME = 'OtherOutgoing';
const RANGE = `${SHEET_NAME}!A2:AH`;


export interface RowData {
  slNo: number;
  runnNum: string | null;
  draftBy: string | null;
  refNo: string | null;
  title: string | null;  
  subDate: string | null;
  comments: string | null;
  remarks: string | null;
}

async function getSheetData(): Promise<string[][] | undefined> {
  const sheets = google.sheets({ version: 'v4', auth: auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
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
      slNo: Number(row[0]), // Convert the first column to a number
      runnNum: row[1] || null,
      draftBy: row[2] || null,
      refNo: row[3] || null,
      title: row[4] || null,
      subDate: row[5] || null,
      comments: row[6] || null,
      remarks: row[7] || null,
    }));
}

export async function fetchToOthersGoogleSheetData(): Promise<RowData[]> {
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
