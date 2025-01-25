import { NextApiRequest, NextApiResponse } from 'next';
import { Auth, google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const FOLDER_ID = '1lC19TPyrT7bt4RXos3gXlXFGtNO4q5B-'; // Replace with your actual folder ID
const KEYFILE_PATH = path.join(process.cwd(), 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: SCOPES,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const originalFileName = req.query.originalFileName as string;
    const newFileName = 'downloaded.pdf';

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient as Auth.JWT });

    const driveRes = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and mimeType='application/pdf'`,
      fields: 'files(id, name)',
    });

    if (driveRes.data.files && driveRes.data.files.length) {
      const files = driveRes.data.files;
      for (const file of files) {
        if (file.id && file.name === originalFileName) {
          const destPath = path.resolve(process.cwd(), 'public', file.name);
          const newPath = path.resolve(process.cwd(), 'public', newFileName);

          const dest = fs.createWriteStream(destPath);
          await drive.files.get(
            { fileId: file.id, alt: 'media' },
            { responseType: 'stream' }
          ).then(res => {
            return new Promise<void>((resolve, reject) => {
              res.data
                .on('end', () => resolve())
                .on('error', err => reject(err))
                .pipe(dest);
            });
          });

          await new Promise<void>((resolve, reject) => {
            fs.rename(destPath, newPath, err => {
              if (err) reject(err);
              else resolve();
            });
          });

          const filePath = `${newFileName}`;
          res.status(200).json({ success: true, filePath });
          return;
        }
      }
      res.status(404).json({ success: false, message: 'No matching files found.' });
    } else {
      res.status(404).json({ success: false, message: 'No files found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'File operations failed.', error });
  }
};
