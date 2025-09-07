import { Clock, MessageSquare, MoreVertical, Users } from 'lucide-react';
import React from 'react';

const BotCard = ({ bot }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'warning':
        return 'Warning';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
            {bot.avatar}
          </div>
        </div>

        {/* Bot Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {bot.name}
            </h3>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`}></div>
            <span className="text-xs text-gray-500">{getStatusText(bot.status)}</span>
          </div>

          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center text-xs text-gray-500">
              <MessageSquare className="h-3 w-3 mr-1" />
              {bot.messages} messages
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              {bot.users} users
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {bot.lastActivity}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button className="p-1 text-gray-400 hover:text-gray-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BotCard;
