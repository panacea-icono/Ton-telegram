import {
  Activity,
  Bot,
  Clock,
  Filter,
  MessageSquare,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

const Bots = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const bots = [
    {
      id: 1,
      name: 'PanasToken Bot',
      username: '@panastoken_bot',
      status: 'online',
      messages: 1247,
      users: 89,
      lastActivity: '2 minutes ago',
      avatar: '🤖',
      description: 'Main bot for PanasToken ecosystem',
      modules: ['core', 'ai', 'payments'],
      uptime: '99.9%'
    },
    {
      id: 2,
      name: 'PanasPay Bot',
      username: '@panaspay_bot',
      status: 'online',
      messages: 892,
      users: 67,
      lastActivity: '5 minutes ago',
      avatar: '💳',
      description: 'Payment processing bot',
      modules: ['payments', 'wallet'],
      uptime: '99.8%'
    },
    {
      id: 3,
      name: 'PanasShop Bot',
      username: '@panasshop_bot',
      status: 'warning',
      messages: 456,
      users: 34,
      lastActivity: '1 hour ago',
      avatar: '🛒',
      description: 'E-commerce bot for medical services',
      modules: ['shop', 'inventory'],
      uptime: '98.5%'
    },
    {
      id: 4,
      name: 'Support Bot',
      username: '@panassupport_bot',
      status: 'offline',
      messages: 234,
      users: 23,
      lastActivity: '3 hours ago',
      avatar: '🆘',
      description: 'Customer support bot',
      modules: ['support', 'tickets'],
      uptime: '95.2%'
    },
    {
      id: 5,
      name: 'Analytics Bot',
      username: '@panasanalytics_bot',
      status: 'online',
      messages: 567,
      users: 45,
      lastActivity: '10 minutes ago',
      avatar: '📊',
      description: 'Analytics and reporting bot',
      modules: ['analytics', 'reports'],
      uptime: '99.7%'
    }
  ];

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || bot.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bot Management</h1>
          <p className="text-gray-600">Manage and monitor your Telegram bots</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Bot
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBots.map((bot) => (
          <div key={bot.id} className="card hover:shadow-md transition-shadow">
            {/* Bot Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                  {bot.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                  <p className="text-sm text-gray-500">{bot.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)}`}></div>
                <span className="text-xs text-gray-500">{getStatusText(bot.status)}</span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bot Description */}
            <p className="text-sm text-gray-600 mb-4">{bot.description}</p>

            {/* Bot Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm">
                <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-gray-600">{bot.messages} messages</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-600">{bot.users} users</span>
              </div>
              <div className="flex items-center text-sm">
                <Activity className="h-4 w-4 text-purple-500 mr-2" />
                <span className="text-gray-600">{bot.uptime} uptime</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-orange-500 mr-2" />
                <span className="text-gray-600">{bot.lastActivity}</span>
              </div>
            </div>

            {/* Modules */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Modules</p>
              <div className="flex flex-wrap gap-1">
                {bot.modules.map((module, index) => (
                  <span key={index} className="badge-info text-xs">
                    {module}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {bot.status === 'online' ? (
                <button className="btn-outline flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </button>
              ) : (
                <button className="btn-success flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </button>
              )}
              <button className="btn-outline">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBots.length === 0 && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bots found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first bot'
            }
          </p>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add New Bot
          </button>
        </div>
      )}
    </div>
  );
};

export default Bots;
