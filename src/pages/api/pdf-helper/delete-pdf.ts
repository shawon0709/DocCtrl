import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ error: 'Missing file path' });
    }

    const decodedFilePath = decodeURIComponent(filePath as string);
    const pdfPath = path.join(process.cwd(), 'public', decodedFilePath);

    // Check if the file exists before attempting to delete
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
