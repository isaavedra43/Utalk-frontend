import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Loader2 } from 'lucide-react';

interface PermissionNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export const PermissionNotification: React.FC<PermissionNotificationProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  show = true
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [show]);

  useEffect(() => {
    if (duration > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      case 'loading':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${getTextColor()}`}>
              {title}
            </h3>
            {message && (
              <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent`}
            >
              <span className="sr-only">Cerrar</span>
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para usar notificaciones de permisos
export const usePermissionNotification = () => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    title: string;
    message?: string;
    duration?: number;
  } | null>(null);

  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info' | 'loading',
    title: string,
    message?: string,
    duration?: number
  ) => {
    setNotification({ type, title, message, duration });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification('success', title, message);
  };

  const showError = (title: string, message?: string) => {
    showNotification('error', title, message);
  };

  const showWarning = (title: string, message?: string) => {
    showNotification('warning', title, message);
  };

  const showInfo = (title: string, message?: string) => {
    showNotification('info', title, message);
  };

  const showLoading = (title: string, message?: string) => {
    showNotification('loading', title, message, 0); // Sin duración para loading
  };

  const NotificationComponent = () => {
    if (!notification) return null;

    return (
      <PermissionNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
        onClose={hideNotification}
        show={!!notification}
      />
    );
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideNotification,
    NotificationComponent
  };
};
