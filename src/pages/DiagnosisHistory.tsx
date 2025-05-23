import { useEffect, useState } from 'react';
import { Calendar, Search, AlertCircle, Check, Trash2 } from 'lucide-react';
import { diagnosisService } from '../services/api';
import { useDiagnosisStore, type Diagnosis } from '../stores/diagnosisStore';
import Button from '../components/common/Button';

const DiagnosisHistory = () => {
  const { diagnoses, setDiagnoses, isLoading, setLoading, setError } = useDiagnosisStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchDiagnoses = async () => {
      setLoading(true);
      try {
        const data = await diagnosisService.getDiagnoses();
        setDiagnoses(data);
      } catch (error) {
        console.error('Error fetching diagnoses:', error);
        setError('Failed to load diagnosis history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiagnoses();
  }, []);
  
  // Filter diagnoses based on search term
  const filteredDiagnoses = diagnoses.filter((diagnosis) => 
    diagnosis.diseaseDetected.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Open diagnosis details modal
  const openDetailsModal = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setIsModalOpen(true);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Diagnosis History</h1>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by disease name..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Diagnosis List */}
        {isLoading ? (
          <div className="py-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 h-24 rounded-md"></div>
              ))}
            </div>
          </div>
        ) : filteredDiagnoses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiagnoses.map((diagnosis) => (
              <div 
                key={diagnosis.id} 
                className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => openDetailsModal(diagnosis)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={diagnosis.imagePath} 
                    alt={diagnosis.diseaseDetected} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{diagnosis.diseaseDetected}</h3>
                    <span 
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        diagnosis.confidence > 0.9
                          ? 'bg-green-100 text-green-800'
                          : diagnosis.confidence > 0.7
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {(diagnosis.confidence * 100).toFixed(1)}% confident
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(diagnosis.diagnosisDate)}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {diagnosis.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-flex rounded-full bg-yellow-100 p-4">
              <div className="rounded-full bg-yellow-200 p-2">
                <AlertCircle className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
            <h3 className="mt-5 text-base font-medium text-gray-900">No diagnoses found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm 
                ? `No results matching "${searchTerm}". Try a different search term.` 
                : 'You have no crop diagnosis history yet. Use the AI Assistant to analyze your crops.'}
            </p>
            <div className="mt-6">
              <Button onClick={() => window.location.href = '/chatbot'}>
                Go to AI Assistant
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Diagnosis Details Modal */}
      {isModalOpen && selectedDiagnosis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-start p-6 border-b">
              <h3 className="text-xl font-semibold">{selectedDiagnosis.diseaseDetected}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedDiagnosis.imagePath} 
                    alt={selectedDiagnosis.diseaseDetected} 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Diagnosis Date</p>
                    <p className="font-medium">{formatDate(selectedDiagnosis.diagnosisDate)}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Confidence Level</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedDiagnosis.confidence > 0.9
                              ? 'bg-green-600'
                              : selectedDiagnosis.confidence > 0.7
                              ? 'bg-blue-600'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${selectedDiagnosis.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {(selectedDiagnosis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Disease Detected</p>
                    <p className="font-medium text-lg">{selectedDiagnosis.diseaseDetected}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Recommended Solution</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{selectedDiagnosis.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-3"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would save/print the diagnosis
                    window.print();
                  }}
                >
                  Print Diagnosis
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisHistory;