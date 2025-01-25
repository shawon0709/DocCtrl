// pages/api/word-editor.ts
import fs from 'fs';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { filePath, replacements } = req.body;

    try {
      const wordPath = path.join(process.cwd(), 'public', 'documents', filePath);
      const outputPath = path.join(process.cwd(), 'public', 'documents', 'SRR [Submission Review Request].docx');

      // Read the Word file as a binary
      const content = fs.readFileSync(wordPath, 'binary');

      // Create a PizZip instance with the Word file content
      const zip = new PizZip(content);

      // Create a Docxtemplater instance with the PizZip instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Logging: Log the replacements data
      console.log('Replacements data:', replacements);

      // Find and replace placeholders in the Word document
      doc.setData(replacements);
      doc.render();

      // Logging: Log the content of the Word document after rendering
      const renderedContent = doc.getZip().generate({ type: 'nodebuffer' });
      console.log('Rendered content:', renderedContent);

      // Generate the modified Word document
      const updatedContent = doc.getZip().generate({ type: 'nodebuffer' });

      // Save the modified Word document to a new file
      fs.writeFileSync(outputPath, updatedContent);

      console.log('Find and replace operation completed successfully.');
      

      res.status(200).json({ success: true, outputPath: 'updated_' + filePath });
    } catch (error) {
      // Error handling: Log the error message and stack trace
      console.error('Error:', error);

      // Respond with a detailed error message
      res.status(500).json({ error: 'An error occurred while processing the document. ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
