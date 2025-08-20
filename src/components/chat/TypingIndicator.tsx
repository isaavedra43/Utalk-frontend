import React from 'react';
import { Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  users: Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
    timestamp: Date;
  }>;
}

const TypingIndicatorInner: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const typingUsers = users.filter(user => user.isTyping);
  
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} está escribiendo...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} y ${typingUsers[1].userName} están escribiendo...`;
    } else {
      return `${typingUsers[0].userName} y ${typingUsers.length - 1} más están escribiendo...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{getTypingText()}</span>
      </div>
      
      {/* Dots animation */}
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export const TypingIndicator = React.memo(TypingIndicatorInner, (prev, next) => {
  if (prev.users.length !== next.users.length) return false;
  const prevIds = prev.users.map(u => `${u.userId}:${u.isTyping}`).join('|');
  const nextIds = next.users.map(u => `${u.userId}:${u.isTyping}`).join('|');
  return prevIds === nextIds;
}); 