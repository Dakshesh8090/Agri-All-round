import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Leaf, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { confirmPassword, ...userData } = data;
      const response = await authService.register(userData);
      
      login(response.user, response.token);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Agri-All-Round and transform your farming experience
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
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="form-input"
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="form-input"
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
              <label htmlFor="phone" className="form-label">
                Phone Number (optional)
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className="form-input"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="form-input"
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
            
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'The passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div>
              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                Create account
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;