import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/useAuthContext';
import { Shield, Eye, EyeOff, User, Key, Database } from 'lucide-react';

export const AdminDetectionDebug: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { backendUser } = useAuthContext();

  useEffect(() => {
    const updateDebugInfo = () => {
      const token = localStorage.getItem('access_token');
      let tokenPayload = null;
      
      if (token) {
        try {
          tokenPayload = JSON.parse(atob(token.split('.')[1]));
        } catch (error) {
          tokenPayload = { error: 'Error parsing token' };
        }
      }

      const info = {
        backendUser: backendUser,
        token: tokenPayload,
        localStorage: {
          access_token: token ? 'Present' : 'Not found',
          userEmail: localStorage.getItem('userEmail'),
          userRole: localStorage.getItem('userRole'),
        },
        sessionStorage: {
          userEmail: sessionStorage.getItem('userEmail'),
          userRole: sessionStorage.getItem('userRole'),
        },
        detection: {
          fromBackendUser: backendUser?.role?.toLowerCase().includes('admin') || 
                          backendUser?.email?.includes('admin') ||
                          backendUser?.email === 'admin@company.com',
          fromToken: tokenPayload?.role === 'admin' || 
                    tokenPayload?.email === 'admin@company.com' ||
                    tokenPayload?.email?.includes('admin'),
          fromStorage: localStorage.getItem('userEmail') === 'admin@company.com' ||
                      localStorage.getItem('userRole') === 'admin'
        }
      };

      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);
    return () => clearInterval(interval);
  }, [backendUser]);

  if (!isVisible) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
          title="Debug Admin Detection"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-w-md max-h-96 overflow-hidden">
      <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="font-medium">Admin Detection Debug</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-red-200"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto text-xs">
        <div className="space-y-4">
          {/* Backend User */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Backend User
            </h4>
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div><strong>Email:</strong> {debugInfo.backendUser?.email || 'null'}</div>
              <div><strong>Role:</strong> {debugInfo.backendUser?.role || 'null'}</div>
              <div><strong>Name:</strong> {debugInfo.backendUser?.name || 'null'}</div>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded text-xs ${
                  debugInfo.detection?.fromBackendUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugInfo.detection?.fromBackendUser ? '✅ Admin detected' : '❌ Not admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Token */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              JWT Token
            </h4>
            <div className="bg-gray-50 p-2 rounded text-xs">
              {debugInfo.token ? (
                <>
                  <div><strong>Email:</strong> {debugInfo.token.email || 'null'}</div>
                  <div><strong>Role:</strong> {debugInfo.token.role || 'null'}</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      debugInfo.detection?.fromToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {debugInfo.detection?.fromToken ? '✅ Admin detected' : '❌ Not admin'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-red-600">No token found</div>
              )}
            </div>
          </div>

          {/* Local Storage */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Local Storage
            </h4>
            <div className="bg-gray-50 p-2 rounded text-xs">
              <div><strong>Token:</strong> {debugInfo.localStorage?.access_token || 'Not found'}</div>
              <div><strong>Email:</strong> {debugInfo.localStorage?.userEmail || 'null'}</div>
              <div><strong>Role:</strong> {debugInfo.localStorage?.userRole || 'null'}</div>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded text-xs ${
                  debugInfo.detection?.fromStorage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {debugInfo.detection?.fromStorage ? '✅ Admin detected' : '❌ Not admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Final Detection */}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Final Detection</h4>
            <div className="text-sm">
              {debugInfo.detection?.fromBackendUser || debugInfo.detection?.fromToken || debugInfo.detection?.fromStorage ? (
                <div className="text-green-700 font-medium">✅ USER IS ADMIN</div>
              ) : (
                <div className="text-red-700 font-medium">❌ USER IS NOT ADMIN</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};