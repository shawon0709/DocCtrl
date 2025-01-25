import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

import path from 'path';

const KEYFILE_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

const SPREADSHEET_ID = '1xNONDEKOtaSA6S1gxLXwJmT6IuT0_LXBRKF_VaJhZdE';
const SHEET_NAME = 'User';
const RANGE = `${SHEET_NAME}!A:A`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sheets = google.sheets({ version: 'v4', auth: auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const values = response.data.values;
    const userIds = values ? values.flat() : [];
    res.status(200).json(userIds);
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}

