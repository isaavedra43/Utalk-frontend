import React from 'react';
import { NotificationList } from './components';

export const NotificationsModule: React.FC = () => {
  return (
    <div className="notifications-module">
      <NotificationList />
    </div>
  );
};

export default NotificationsModule;