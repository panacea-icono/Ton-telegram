import {
  Activity,
  Bot,
  Clock,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import React from 'react';
import ActivityChart from '../components/ActivityChart';
import BotCard from '../components/BotCard';
import StatsCard from '../components/StatsCard';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Bots',
      value: '29',
      change: '+2',
      changeType: 'positive',
      icon: Bot,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Messages Today',
      value: '3,456',
      change: '+8%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'purple'
    },
    {
      title: 'Response Time',
      value: '0.8s',
      change: '-15%',
      changeType: 'positive',
      icon: Clock,
      color: 'orange'
    }
  ];

  const recentBots = [
    {
      id: 1,
      name: 'PanasToken Bot',
      status: 'online',
      messages: 1247,
      users: 89,
      lastActivity: '2 minutes ago',
      avatar: '🤖'
    },
    {
      id: 2,
      name: 'PanasPay Bot',
      status: 'online',
      messages: 892,
      users: 67,
      lastActivity: '5 minutes ago',
      avatar: '💳'
    },
    {
      id: 3,
      name: 'PanasShop Bot',
      status: 'warning',
      messages: 456,
      users: 34,
      lastActivity: '1 hour ago',
      avatar: '🛒'
    },
    {
      id: 4,
      name: 'Support Bot',
      status: 'offline',
      messages: 234,
      users: 23,
      lastActivity: '3 hours ago',
      avatar: '🆘'
    }
  ];

  const quickActions = [
    {
      title: 'Deploy New Bot',
      description: 'Create and deploy a new Telegram bot',
      icon: Zap,
      color: 'blue',
      action: () => console.log('Deploy bot')
    },
    {
      title: 'View Analytics',
      description: 'Check detailed bot performance metrics',
      icon: TrendingUp,
      color: 'green',
      action: () => console.log('View analytics')
    },
    {
      title: 'Security Check',
      description: 'Run security audit on all bots',
      icon: Shield,
      color: 'red',
      action: () => console.log('Security check')
    },
    {
      title: 'Monitor Activity',
      description: 'Real-time bot activity monitoring',
      icon: Activity,
      color: 'purple',
      action: () => console.log('Monitor activity')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Panas Token Ecosystem</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            All systems operational
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bots */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bot Activity</h2>
              <p className="text-sm text-gray-600">Latest bot interactions and status</p>
            </div>
            <div className="space-y-4">
              {recentBots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${action.color}-100 mr-3`}>
                      <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Chart */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
            </div>
            <ActivityChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
