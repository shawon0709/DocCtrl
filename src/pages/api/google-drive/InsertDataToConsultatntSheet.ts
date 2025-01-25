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

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { sheetName, rowData, rowNumber } = req.body;

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

      // Get the sheet data to determine the last row
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        ranges: [`${sheetName}!A:R`],
        includeGridData: false,
      });

      const sheet = sheetInfo.data.sheets?.find(sheet => sheet.properties?.title === sheetName);
      if (!sheet || !sheet.properties || !sheet.properties.sheetId) {
        throw new Error(`Sheet with name ${sheetName} not found or properties are missing`);
      }

      const lastRow = sheet.properties.gridProperties?.rowCount ?? 0;

      const columnsToUpdate = [
        { startColumnIndex: 0, endColumnIndex: 1 }, // Columns A
        { startColumnIndex: 1, endColumnIndex: 2 },
        { startColumnIndex: 2, endColumnIndex: 3 },
        { startColumnIndex: 3, endColumnIndex: 4 },
        { startColumnIndex: 4, endColumnIndex: 5 },
        { startColumnIndex: 5, endColumnIndex: 6 },
        { startColumnIndex: 6, endColumnIndex: 7 },
        { startColumnIndex: 7, endColumnIndex: 8 },
        { startColumnIndex: 8, endColumnIndex: 9 },
        { startColumnIndex: 9, endColumnIndex: 10 },
        { startColumnIndex: 10, endColumnIndex: 11 },
        { startColumnIndex: 11, endColumnIndex: 12 },
        { startColumnIndex: 12, endColumnIndex: 13 },
        { startColumnIndex: 13, endColumnIndex: 14 },
        { startColumnIndex: 14, endColumnIndex: 15 },
        { startColumnIndex: 15, endColumnIndex: 16 },
        { startColumnIndex: 16, endColumnIndex: 17 },
        { startColumnIndex: 17, endColumnIndex: 18 },
        { startColumnIndex: 18, endColumnIndex: 33 }, // Column S to AG
        { startColumnIndex: 34, endColumnIndex: 35 },
        { startColumnIndex: 35, endColumnIndex: 35 },
        // Add more column ranges as needed
      ];

      if (!sheet || !sheet.properties || !sheet.properties.sheetId) {
        throw new Error(`Sheet with name ${sheetName} not found or properties are missing`);
      }

      const borderRequests = columnsToUpdate.map(({ startColumnIndex, endColumnIndex }) => {
        // Check if sheet and sheet.properties are defined before accessing sheetId
        if (!sheet || !sheet.properties) {
          throw new Error("Sheet or properties are undefined.");
        }

        return {
          updateBorders: {
            range: {
              sheetId: sheet.properties.sheetId,
              startRowIndex: lastRow,
              endRowIndex: lastRow + 1,
              startColumnIndex,
              endColumnIndex,
            },
            left: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
            right: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
          },
        };
      });

      const batchUpdateRequest = {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: "ROWS",
                startIndex: lastRow,
                endIndex: lastRow + 1,
              },
              inheritFromBefore: true,
            },
          },
          {
            updateBorders: {
              range: {
                sheetId: sheet.properties.sheetId,
                startRowIndex: lastRow,
                endRowIndex: lastRow + 1,
                startColumnIndex: 0,
                endColumnIndex: 35, // Assuming there are 18 columns
              },
              top: {
                style: 'SOLID',
                width: 1,
                color: { red: 0, green: 0, blue: 0 },
              },
              bottom: {
                style: 'SOLID',
                width: 1,
                color: { red: 0, green: 0, blue: 0 },
              },
              left: {
                style: 'SOLID',
                width: 1,
                color: { red: 0, green: 0, blue: 0 },
              },
              right: {
                style: 'SOLID',
                width: 1,
                color: { red: 0, green: 0, blue: 0 },
              },
            },
          },
          ...borderRequests,
        ],
      };

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: batchUpdateRequest,
      });
      // Prepare the data for updating the new row (lastRow + 1)
      const values: string[][] = [[]];
      Object.entries(rowData).forEach(([column, data]) => {
        const columnIndex = column
          .split('')
          .reduce((acc, char, i) => acc + (char.charCodeAt(0) - 64) * Math.pow(26, column.length - 1 - i), 0) - 1;
        values[0][columnIndex] = data as string;
      });

      const range = `${sheetName}!A${lastRow + 1}:AI${lastRow + 1}`;

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
  console.log('Row data inserted successfully:', response.data);

      res.status(200).json({ message: 'Row data inserted successfully' });
    } catch (error) {
      console.error('Error inserting row data:', error);
      res.status(500).json({ error: 'Error inserting row data' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
