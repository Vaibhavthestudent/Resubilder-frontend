import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ResumePreview from './ResumePreview';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../../context/AuthContext';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ViewResume = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resumePreviewRef = useRef();
  const { token } = useAuth();

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => resumePreviewRef.current,
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        // Use auth token to fetch the user's own resume
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        };
        
        const res = await axios.get(`${API_URL}/api/dashboard/resume/${id}`, config);
        setResume(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Resume not found or you do not have permission to view it');
        setLoading(false);
      }
    };

    if (id && token) {
      fetchResume();
    } else if (!token) {
      setError('You must be logged in to view this resume');
      setLoading(false);
    } else {
      setError('Invalid resume ID');
      setLoading(false);
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-6 text-indigo-600 text-xl font-medium">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <p className="text-gray-600 mb-6">The resume you're looking for could not be found or you don't have permission to view it.</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
            >
              <FiPrinter className="mr-2" /> Print
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {resume && (
            <div className="flex justify-center">
              <ResumePreview resumeData={resume} ref={resumePreviewRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResume;