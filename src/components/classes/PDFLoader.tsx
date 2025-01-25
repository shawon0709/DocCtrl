import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Empty, Select, Typography } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFLoaderProps {
  pdfFileUrlProp?: string | null;
}

const PDFLoader: React.FC<PDFLoaderProps> = ({ pdfFileUrlProp }) => {
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [zoomPercentage, setZoomPercentage] = useState<number>(100);
  const { Title } = Typography;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    deletePdfFile();
  };

  const deletePdfFile = async () => {
    if (pdfFile) {
      try {
        await fetch(`/api/pdf-helper/delete-pdf?filePath=${encodeURIComponent(pdfFile)}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error deleting PDF:', error);
      }
    }
  };

  const handleZoomIn = () => {
    setZoomPercentage((prevZoom) => Math.min(prevZoom + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomPercentage((prevZoom) => Math.max(prevZoom - 10, 10));
  };

  const updateScale = () => {
    setScale(zoomPercentage / 100);
  };

  const handleZoomChange = (value: number) => {
    setZoomPercentage(value);
  };

  const handleNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages || 1));
  };

  const handlePrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  useEffect(() => {
    updateScale();
  }, [zoomPercentage]);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setPdfFile(null);
        setNumPages(undefined);
        setPageNumber(1);

        if (pdfFileUrlProp) {
          const response = await axios.get('/api/google-drive/GetToConsultatntGoogleDrive', {
            params: { originalFileName: pdfFileUrlProp }
          });

          const { filePath } = response.data;

          if (filePath) {
            setPdfFile(filePath);
          } else {
            console.error('File path is null or undefined');
          }
        } else {
          console.error('Original file name is null or undefined');
        }
      } catch (error) {
        console.error('Error fetching and storing PDF:', error);
      }
    };

    if (pdfFileUrlProp) {
      loadPdf();
    }
  }, [pdfFileUrlProp]);

  const handleDownloadPdf = () => {
    if (pdfFile) {
      window.open(pdfFile, '_blank');
    }
  };

  return (
    <>
      {pdfFile ? (
        <>
          <div className='flex justify-center max-h-[90vh]'>
            <Button type="default" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            <Select
              className="w-30"
              value={zoomPercentage}
              dropdownMatchSelectWidth={false}
              onChange={(value) => handleZoomChange(value)}
              options={[
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
                { value: 125, label: '125%' },
                { value: 150, label: '150%' },
                { value: 200, label: '200%' },
              ]}
            />
            <Button type="default" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            <Button type="default" icon={<CloudDownloadOutlined />} onClick={handleDownloadPdf} />
          </div>

          <div className="pdf-container w-full max-h-[77vh] overflow-auto min-h-[77vh]">
            <div className='flex justify-center'>
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => console.error('Error loading PDF:', error)}
              >
                <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>
            </div>
          </div>

          <div className='flex justify-center'>
            <Button type="default" icon={<CaretLeftOutlined />} onClick={handlePrevPage} />
            <p className='p-1'>
              Page {pageNumber} of {numPages}
            </p>
            <Button type="default" icon={<CaretRightOutlined />} onClick={handleNextPage} />
          </div>
        </>
      ) : (
        <>
          <div className='flex justify-center'>
            <Title level={5}>Preview PDF</Title>
          </div>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No PDF Loaded
              </span>
            }
          />
        </>
      )}
    </>
  );
};

export default PDFLoader;
