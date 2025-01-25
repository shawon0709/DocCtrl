import fs from 'fs';
import { createReadStream } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { docfilePath } = req.query;

    try {
      const fileUrl = path.join(process.cwd(), 'public', 'documents', docfilePath as string);

      // Check if the file exists before attempting to read it
      if (!fs.existsSync(fileUrl)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const fileStream = createReadStream(fileUrl);

      // Set headers before piping the file stream
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=${path.basename(docfilePath as string)}`);
      res.setHeader('Content-Length', fs.statSync(fileUrl).size);

      // Pipe the file stream to the response
      fileStream.pipe(res);

      // Properly handle errors in the file stream
      fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        res.status(500).json({ error: 'An error occurred while downloading the file.' });
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while downloading the file.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
