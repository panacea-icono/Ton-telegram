import {
  Activity,
  Calendar,
  Download,
  Filter,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedBot, setSelectedBot] = useState('all');

  const periods = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  const bots = [
    { value: 'all', label: 'All Bots' },
    { value: '1', label: 'PanasToken Bot' },
    { value: '2', label: 'PanasPay Bot' },
    { value: '3', label: 'PanasShop Bot' },
    { value: '4', label: 'Support Bot' },
    { value: '5', label: 'Analytics Bot' }
  ];

  // Mock data for charts
  const messageData = [
    { date: '2024-01-14', messages: 45, users: 12 },
    { date: '2024-01-15', messages: 67, users: 18 },
    { date: '2024-01-16', messages: 89, users: 23 },
    { date: '2024-01-17', messages: 56, users: 15 },
    { date: '2024-01-18', messages: 78, users: 21 },
    { date: '2024-01-19', messages: 92, users: 25 },
    { date: '2024-01-20', messages: 45, users: 12 }
  ];

  const botPerformanceData = [
    { name: 'PanasToken Bot', messages: 1247, users: 89, uptime: 99.9 },
    { name: 'PanasPay Bot', messages: 892, users: 67, uptime: 99.8 },
    { name: 'PanasShop Bot', messages: 456, users: 34, uptime: 98.5 },
    { name: 'Support Bot', messages: 234, users: 23, uptime: 95.2 },
    { name: 'Analytics Bot', messages: 567, users: 45, uptime: 99.7 }
  ];

  const userEngagementData = [
    { name: 'New Users', value: 45, color: '#3b82f6' },
    { name: 'Active Users', value: 67, color: '#10b981' },
    { name: 'Returning Users', value: 23, color: '#f59e0b' },
    { name: 'Inactive Users', value: 12, color: '#ef4444' }
  ];

  const responseTimeData = [
    { time: '00:00', responseTime: 0.8 },
    { time: '04:00', responseTime: 0.6 },
    { time: '08:00', responseTime: 1.2 },
    { time: '12:00', responseTime: 1.5 },
    { time: '16:00', responseTime: 1.1 },
    { time: '20:00', responseTime: 0.9 },
    { time: '24:00', responseTime: 0.7 }
  ];

  const metrics = [
    {
      title: 'Total Messages',
      value: '3,456',
      change: '+12%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Response Time',
      value: '0.8s',
      change: '-15%',
      changeType: 'positive',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Uptime',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const getMetricColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    };
    return colors[color] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Bot performance and user engagement metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              className="input"
            >
              {bots.map(bot => (
                <option key={bot.value} value={bot.value}>
                  {bot.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <div className="flex items-center mt-1">
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getMetricColor(metric.color)}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Over Time */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Messages Over Time</h2>
            <p className="text-sm text-gray-600">Daily message volume and user activity</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Engagement */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">User Engagement</h2>
            <p className="text-sm text-gray-600">User distribution by activity level</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userEngagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userEngagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {userEngagementData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bot Performance */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Bot Performance</h2>
          <p className="text-sm text-gray-600">Individual bot metrics and uptime</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={botPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#6b7280"
                fontSize={12}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="messages" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Response Time</h2>
          <p className="text-sm text-gray-600">Average response time throughout the day</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value}s`, 'Response Time']}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
