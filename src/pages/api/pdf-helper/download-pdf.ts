import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { pdfUrl } = req.query;
    
    if (!pdfUrl) {
      return res.status(400).json({ error: 'Missing PDF URL' });
    }

    const pdfBuffer = await fetch(pdfUrl as string).then((response) => response.arrayBuffer());

    const pdfPath = path.join(process.cwd(), 'public', 'downloaded.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));

    res.json({ filePath: '/downloaded.pdf' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
