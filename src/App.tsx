import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AuthGuard from './components/common/AuthGuard';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy-loaded components
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChatBot = lazy(() => import('./pages/ChatBot'));
const CropManagement = lazy(() => import('./pages/CropManagement'));
const WeatherForecast = lazy(() => import('./pages/WeatherForecast'));
const DiagnosisHistory = lazy(() => import('./pages/DiagnosisHistory'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  const { isLoggedIn } = useAuthStore();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/dashboard" replace />} />
        
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/crops" element={<CropManagement />} />
          <Route path="/weather" element={<WeatherForecast />} />
          <Route path="/diagnosis-history" element={<DiagnosisHistory />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;