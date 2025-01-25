import { NextApiRequest, NextApiResponse } from 'next';
import { google, Auth } from 'googleapis'; // Import Auth to use JWT type
import path from 'path';

const SPREADSHEET_ID = '1xNONDEKOtaSA6S1gxLXwJmT6IuT0_LXBRKF_VaJhZdE'; // Use environment variable for spreadsheet ID
const KEYFILE_PATH = path.join(process.cwd(), 'credentials.json'); // Path to the service account credentials
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH, // Path to credentials.json
  scopes: SCOPES, // Scopes for Google Sheets API access
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sheetName, rowData } = req.body; // Expecting rowData to be an array of row data objects

    try {
      // Get an authenticated client
      const authClient = await auth.getClient();

      // Cast the authClient to Auth.JWT type
      const sheets = google.sheets({ version: 'v4', auth: authClient as Auth.JWT });

      // Fetch data to get the last filled row in the sheet
      const sheetData = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:A`, // Fetch only column A to determine the last row
      });

      const rows = sheetData.data.values || [];
      const lastRow = rows.length;

      // Prepare the data for inserting multiple rows
      const values: string[][] = rowData.map((rowData: any) => {
        const row: string[] = new Array(26).fill('');
        Object.entries(rowData).forEach(([column, data]) => {
          const columnIndex = column
            .split('')
            .reduce((acc, char, i) => acc + (char.charCodeAt(0) - 64) * Math.pow(26, column.length - 1 - i), 0) - 1;
          row[columnIndex] = data as string;
        });
        return row;
      });

      console.log('Prepared values for insertion:', values);

      const range = `${sheetName}!A${lastRow + 1}:Z${lastRow + values.length}`;

      // Insert or update values in the Google Sheet
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED', // Use USER_ENTERED to allow Google Sheets to format the values
        requestBody: {
          values,
        },
      });

      console.log('Rows data inserted successfully:', response.data);

      res.status(200).json({ message: 'Rows data inserted successfully' });
    } catch (error: any) {
      console.error('Error inserting row data:', error.message);
      res.status(500).json({ error: `Error inserting row data: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
