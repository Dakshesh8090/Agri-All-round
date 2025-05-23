import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Leaf, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const from = (location.state as any)?.from || '/dashboard';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  
  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(data.email, data.password);
      
      login(response.user, response.token);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Agri-All-Round
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          AI-Powered Agricultural Assistant
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="form-input"
                defaultValue="demo@example.com" // Pre-filled for demo purposes
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Please enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="form-input"
                defaultValue="password" // Pre-filled for demo purposes
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <div>
              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                Sign in
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary-dark"
              >
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;