import { useEffect, useState } from 'react';
import { MapPin, Thermometer, Droplets, Wind, BarChart4, Cloud, Sun, CloudRain } from 'lucide-react';
import { weatherService } from '../services/api';
import { useWeatherStore } from '../stores/weatherStore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeatherForecast = () => {
  const { currentWeather, forecast, setCurrentWeather, setForecast, isLoading, setLoading, setError } = useWeatherStore();
  const [location, setLocation] = useState('Current Location');
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily');
  
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // Fetch current weather
        const weather = await weatherService.getCurrentWeather(location);
        setCurrentWeather(weather);
        
        // Fetch forecast data
        const forecastData = await weatherService.getForecast(location);
        setForecast(forecastData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Failed to fetch weather data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWeatherData();
  }, [location]);
  
  // Function to get weather icon based on description
  const getWeatherIcon = (description: string, size = 'w-6 h-6') => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle')) {
      return <CloudRain className={`${size} text-blue-500`} />;
    } else if (lowerDesc.includes('cloud')) {
      return <Cloud className={`${size} text-gray-500`} />;
    } else if (lowerDesc.includes('clear') || lowerDesc.includes('sunny')) {
      return <Sun className={`${size} text-yellow-500`} />;
    } else {
      return <Cloud className={`${size} text-gray-500`} />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Prepare data for chart
  const prepareChartData = () => {
    if (!forecast) return null;
    
    const data = activeTab === 'daily' ? forecast.daily : forecast.hourly;
    
    return {
      labels: data.map((item) => 
        activeTab === 'daily' ? formatDate(item.date) : formatTime(item.date)
      ),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: data.map((item) => item.temperature),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Humidity (%)',
          data: data.map((item) => item.humidity),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Weather Forecast</h1>
        
        {/* Location Selection */}
        <div className="flex items-center">
          <MapPin className="mr-2 text-primary w-5 h-5" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input py-1 pl-2 pr-8 max-w-xs"
          >
            <option value="Current Location">Current Location</option>
            <option value="New York">New York</option>
            <option value="London">London</option>
            <option value="Tokyo">Tokyo</option>
            <option value="Sydney">Sydney</option>
          </select>
        </div>
      </div>
      
      {/* Current Weather Card */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : currentWeather ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Weather</h2>
              <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentWeather.isFavorable 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentWeather.isFavorable ? 'Favorable for Crops' : 'Monitor Crop Conditions'}
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-lg bg-blue-50 flex items-center justify-center mr-6">
                {getWeatherIcon(currentWeather.description, 'w-12 h-12')}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{currentWeather.temperature}°C</h3>
                <p className="text-lg text-gray-600">{currentWeather.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600 mb-1">Humidity</p>
                <p className="font-semibold">{currentWeather.humidity}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Wind className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600 mb-1">Wind</p>
                <p className="font-semibold">{currentWeather.windSpeed} km/h</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="text-xs text-gray-600 mb-1">Rainfall</p>
                <p className="font-semibold">{currentWeather.rainfall} mm</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center text-gray-500">
          Weather data unavailable
        </div>
      )}
      
      {/* Forecast Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'daily'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('daily')}
            >
              Daily Forecast
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'hourly'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('hourly')}
            >
              Hourly Forecast
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6 animate-pulse">
            <div className="h-60 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : forecast ? (
          <div className="p-6">
            {/* Chart */}
            <div className="mb-6 h-60">
              {prepareChartData() && <Line data={prepareChartData()!} options={chartOptions} />}
            </div>
            
            {/* Forecast Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {activeTab === 'daily'
                ? forecast.daily.slice(0, 5).map((day, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">{formatDate(day.date)}</p>
                      <div className="flex justify-center mb-2">
                        {getWeatherIcon(day.description, 'w-8 h-8')}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{day.description}</p>
                      <p className="text-lg font-semibold">{day.temperature}°C</p>
                      <div className="grid grid-cols-3 gap-1 mt-3">
                        <div className="text-center">
                          <Droplets className="w-4 h-4 mx-auto text-blue-500" />
                          <p className="text-xs mt-1">{day.humidity}%</p>
                        </div>
                        <div className="text-center">
                          <Wind className="w-4 h-4 mx-auto text-gray-500" />
                          <p className="text-xs mt-1">{day.windSpeed}</p>
                        </div>
                        <div className="text-center">
                          <CloudRain className="w-4 h-4 mx-auto text-blue-500" />
                          <p className="text-xs mt-1">{day.rainfall}</p>
                        </div>
                      </div>
                    </div>
                  ))
                : forecast.hourly.slice(0, 5).map((hour, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="font-medium mb-2">{formatTime(hour.date)}</p>
                      <div className="flex justify-center mb-2">
                        {getWeatherIcon(hour.description, 'w-8 h-8')}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{hour.description}</p>
                      <p className="text-lg font-semibold">{hour.temperature}°C</p>
                      <div className="grid grid-cols-3 gap-1 mt-3">
                        <div className="text-center">
                          <Droplets className="w-4 h-4 mx-auto text-blue-500" />
                          <p className="text-xs mt-1">{hour.humidity}%</p>
                        </div>
                        <div className="text-center">
                          <Wind className="w-4 h-4 mx-auto text-gray-500" />
                          <p className="text-xs mt-1">{hour.windSpeed}</p>
                        </div>
                        <div className="text-center">
                          <CloudRain className="w-4 h-4 mx-auto text-blue-500" />
                          <p className="text-xs mt-1">{hour.rainfall}</p>
                        </div>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Forecast data unavailable
          </div>
        )}
      </div>
      
      {/* Crop Weather Advisory */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Crop Weather Advisory</h2>
        <div className="border-l-4 border-primary pl-4 py-2">
          <p className="text-gray-700">
            Based on the current weather conditions, ensure adequate irrigation for your crops. 
            The temperature and humidity levels are favorable for growth, but monitor for pest activity 
            as these conditions may promote insect proliferation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;