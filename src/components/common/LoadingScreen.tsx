import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-50">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="mt-4 text-lg font-medium text-primary">Loading...</p>
    </div>
  );
};

export default LoadingScreen;