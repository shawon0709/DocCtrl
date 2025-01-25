import { NextApiRequest, NextApiResponse } from 'next';
import { fetchToConsultantGoogleSheetData } from '@/components/utils/ToConsultantGoogleSheet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await fetchToConsultantGoogleSheetData();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
