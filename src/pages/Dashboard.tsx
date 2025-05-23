import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Cloud, 
  MessageSquare, 
  History, 
  ArrowRight, 
  Droplets, 
  Thermometer, 
  Wind 
} from 'lucide-react';
import { weatherService, cropService } from '../services/api';
import { useWeatherStore } from '../stores/weatherStore';
import { useCropStore } from '../stores/cropStore';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { currentWeather, setCurrentWeather } = useWeatherStore();
  const { crops, setCrops } = useCropStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current weather
        const weather = await weatherService.getCurrentWeather('Current Location');
        setCurrentWeather(weather);
        
        // Fetch crops
        const userCrops = await cropService.getCrops();
        setCrops(userCrops);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Format date
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Simulate some pending tasks
  const pendingTasks = [
    'Irrigation for Wheat field due today',
    'Apply fertilizer to Rice crops',
    'Check for pests in Tomato plants',
  ];
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user?.name}</h1>
            <p className="text-gray-600">{formatDate()}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              to="/chatbot" 
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <span>Ask AI Assistant</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/chatbot" className="card p-6 hover:bg-green-50 transition-colors duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">Ask AI Assistant</h3>
              <p className="text-sm text-gray-600">Get crop advice</p>
            </div>
          </div>
        </Link>
        
        <Link to="/crops" className="card p-6 hover:bg-green-50 transition-colors duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">Manage Crops</h3>
              <p className="text-sm text-gray-600">{crops.length} crops</p>
            </div>
          </div>
        </Link>
        
        <Link to="/weather" className="card p-6 hover:bg-green-50 transition-colors duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">Weather Forecast</h3>
              <p className="text-sm text-gray-600">View predictions</p>
            </div>
          </div>
        </Link>
        
        <Link to="/diagnosis-history" className="card p-6 hover:bg-green-50 transition-colors duration-300">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">Diagnosis History</h3>
              <p className="text-sm text-gray-600">View past results</p>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <div className="card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">Current Weather</h2>
          </div>
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentWeather ? (
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-md">
                  <Cloud className="w-8 h-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-600">Current Location</p>
                  <h3 className="text-xl font-bold">{currentWeather.description}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <Thermometer className="w-5 h-5 mx-auto text-red-500" />
                  <p className="text-xs text-gray-600 mt-1">Temperature</p>
                  <p className="font-semibold">{currentWeather.temperature}°C</p>
                </div>
                <div className="text-center">
                  <Droplets className="w-5 h-5 mx-auto text-blue-500" />
                  <p className="text-xs text-gray-600 mt-1">Humidity</p>
                  <p className="font-semibold">{currentWeather.humidity}%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-5 h-5 mx-auto text-gray-500" />
                  <p className="text-xs text-gray-600 mt-1">Wind</p>
                  <p className="font-semibold">{currentWeather.windSpeed} km/h</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/weather" 
                  className="text-primary text-sm hover:text-primary-dark flex items-center justify-center"
                >
                  View detailed forecast
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Weather data unavailable
            </div>
          )}
        </div>
        
        {/* Crop Status */}
        <div className="card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">Crop Status</h2>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-md bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : crops.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {crops.slice(0, 3).map((crop) => (
                  <div key={crop.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{crop.name}</p>
                      <p className="text-sm text-gray-600">
                        {crop.growthStage} • {crop.soilType}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        crop.growthStage === 'Seedling' 
                          ? 'bg-blue-100 text-blue-800' 
                          : crop.growthStage === 'Maturation' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {crop.growthStage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/crops" 
                  className="text-primary text-sm hover:text-primary-dark flex items-center justify-center"
                >
                  Manage all crops
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No crops added yet</p>
              <Link 
                to="/crops" 
                className="btn btn-primary"
              >
                Add your first crop
              </Link>
            </div>
          )}
        </div>
        
        {/* Tasks Due */}
        <div className="card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">Tasks Due</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {pendingTasks.map((task, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-5 h-5 rounded-full border-2 border-primary mt-0.5 flex-shrink-0"></div>
                  <span className="ml-3">{task}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-md text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300">
                Add new task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;