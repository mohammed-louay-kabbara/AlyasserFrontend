import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <p className="text-gray-500">
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => navigate(-1)}
              className="w-full"
              variant="outline"
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
