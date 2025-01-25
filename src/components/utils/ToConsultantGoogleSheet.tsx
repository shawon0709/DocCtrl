import { google } from 'googleapis';
import path from 'path';

const KEYFILE_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

const SPREADSHEET_ID = '1xNONDEKOtaSA6S1gxLXwJmT6IuT0_LXBRKF_VaJhZdE';
const SHEET_NAME = 'CSCOutgoing';
const RANGE = `${SHEET_NAME}!A2:AI`;


export interface RowData {
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
      refNo: row[1] || null,
      srrNo: row[34] || null,
      title: row[4] || null,
      draftBy: row[3] || null,
      subDate: row[5] || null,
      revDate: row[6] || null,
      revRefDate: row[7] || null,
      cscTransGrade: row[9] || null,
      comments: row[14] || null,
      project: row[18] || null,
      projectDash: row[19] || null,
      org: row[20] || null,
      orgDash: row[21] || null,
      system: row[22] || null,
      systemDash: row[23] || null,
      location: row[24] || null,
      locationDash: row[25] || null,
      type: row[26] || null,
      typeDash: row[27] || null,
      role: row[28] || null,
      roleDash: row[29] || null,
      number: row[30] || null,
      numberDash: row[31] || null,
      revision: row[32] || null,
      info: row[8] || null,
    }));
}

export async function fetchToConsultantGoogleSheetData(): Promise<RowData[]> {
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
