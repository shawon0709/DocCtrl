import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { filePath } = req.body;

    try {
      const fullFilePath = path.join(process.cwd(), 'public', 'documents', filePath);

      // Check if the file exists
      if (!fs.existsSync(fullFilePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete the file
      fs.unlinkSync(fullFilePath);

      console.log(`File ${filePath} deleted successfully.`);
      res.status(200).json({ success: true, message: `File ${filePath} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'An error occurred while deleting the file. ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
