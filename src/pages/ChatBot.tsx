import { useState, useRef, useEffect } from 'react';
import { Send, Image, Loader2, X, Check } from 'lucide-react';
import { useChatStore, type Message } from '../stores/chatStore';
import { chatService, diagnosisService } from '../services/api';
import { useDiagnosisStore } from '../stores/diagnosisStore';
import Button from '../components/common/Button';

const ChatBot = () => {
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
  const { addDiagnosis } = useDiagnosisStore();
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle text message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' && !selectedImage) return;

    // If we have text input, send it
    if (inputValue.trim() !== '') {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      
      addMessage(userMessage);
      setInputValue('');
      setLoading(true);
      
      try {
        const response = await chatService.sendMessage(inputValue);
        addMessage(response);
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage({
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    } 
    // If we have an image, handle image upload
    else if (selectedImage) {
      handleImageUpload();
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle image upload and analysis
  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: 'I need help identifying this crop issue.',
      sender: 'user',
      timestamp: new Date().toISOString(),
      hasImage: true,
      imageUrl: URL.createObjectURL(selectedImage),
    };
    
    addMessage(userMessage);
    setLoading(true);
    clearSelectedImage();
    
    try {
      const response = await chatService.analyzeCropImage(selectedImage);
      addMessage(response);
      
      // Save diagnosis to history
      if (response.diagnosisResult) {
        const diagnosis = await diagnosisService.saveDiagnosis({
          imagePath: response.imageUrl,
          diseaseDetected: response.diagnosisResult.disease,
          solution: response.diagnosisResult.treatment,
          confidence: response.diagnosisResult.confidence,
        });
        
        addDiagnosis(diagnosis);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      addMessage({
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error analyzing your image. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">AI Farming Assistant</h1>
        <p className="text-gray-600">
          Ask me about crop management, disease identification, or weather-related farming advice. You can also upload images of your crops for analysis.
        </p>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-lg shadow-md mt-4 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="w-16 h-16 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">No messages yet</p>
              <p className="text-center max-w-md">
                Start a conversation by sending a message or uploading an image of your crop for analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.hasImage && message.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={message.imageUrl}
                          alt="Uploaded crop"
                          className="rounded-md max-h-60 w-auto"
                        />
                      </div>
                    )}
                    <p>{message.content}</p>
                    
                    {message.diagnosisResult && (
                      <div className="mt-4 p-3 bg-white rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-800">Diagnosis Result</h4>
                          <span 
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              message.diagnosisResult.confidence > 0.9
                                ? 'bg-green-100 text-green-800'
                                : message.diagnosisResult.confidence > 0.7
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {(message.diagnosisResult.confidence * 100).toFixed(1)}% confident
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                          {message.diagnosisResult.disease}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Treatment: </span>
                          {message.diagnosisResult.treatment}
                        </p>
                      </div>
                    )}
                    
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-gray-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <p className="text-gray-600">AI Assistant is thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
          )}
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 pt-2">
            <div className="flex items-start space-x-2 bg-gray-50 p-2 rounded-md">
              <img
                src={imagePreview}
                alt="Selected"
                className="h-16 w-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium truncate">
                  {selectedImage?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedImage?.size ?? 0) / 1000 < 1000
                    ? `${Math.round((selectedImage?.size ?? 0) / 1000)} KB`
                    : `${((selectedImage?.size ?? 0) / 1000000).toFixed(2)} MB`}
                </p>
              </div>
              <button
                onClick={clearSelectedImage}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t flex items-end space-x-2"
        >
          <Button
            type="button"
            variant="outline"
            className="p-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-5 h-5" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your farming question..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={1}
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="p-2"
            disabled={isLoading || (inputValue.trim() === '' && !selectedImage)}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;