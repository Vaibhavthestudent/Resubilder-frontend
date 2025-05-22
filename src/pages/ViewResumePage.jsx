import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ResumePreview from '../components/resume/ResumePreview';
import { FiDownload, FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ViewResumePage = () => {
  const { shareToken } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resumePreviewRef = useRef();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/resume/shared/${shareToken}`);
        setResume(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared resume:', err);
        setError('This resume is either private or no longer available.');
        setLoading(false);
      }
    };

    fetchResume();
  }, [shareToken]);

  // Update the download handler
  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // Get the resume element
      const resumeElement = resumePreviewRef.current;
      
      // Set fixed dimensions for letter size paper (8.5" x 11")
      const pdfWidth = 8.5;
      const pdfHeight = 11;
      
      // Create a new jsPDF instance with letter size dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [pdfWidth, pdfHeight]
      });
      
      // Use html2canvas with fixed dimensions and higher quality
      const canvas = await html2canvas(resumeElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        width: resumeElement.offsetWidth,
        height: resumeElement.offsetHeight
      });
      
      // Calculate the aspect ratio to maintain proportions
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF with proper scaling
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight > pdfHeight ? pdfHeight : imgHeight);
      
      // Save the PDF
      pdf.save(`${resume.title.replace(/\s+/g, '_')}_resume.pdf`);
      
      setLoading(false);
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError('Failed to download resume');
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => resumePreviewRef.current,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Resume Not Available</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{resume.title}</h1>
          <p className="text-gray-600 mb-4">
            Template: <span className="capitalize">{resume.template}</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center"
            >
              <FiDownload className="mr-2" /> Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center"
            >
              <FiPrinter className="mr-2" /> Print
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-xl border border-gray-200 mx-auto">
          <ResumePreview resumeData={resume} ref={resumePreviewRef} />
        </div>
      </div>
    </div>
  );
};

export default ViewResumePage;