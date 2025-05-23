import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Leaf className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-3 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <div className="mt-10">
          <Link to="/">
            <Button className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;