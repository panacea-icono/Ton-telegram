import {
    Bell,
    Database,
    Eye,
    EyeOff,
    Globe,
    Key,
    Save,
    Shield,
    User
} from 'lucide-react';
import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      botName: 'PanasToken Ecosystem',
      timezone: 'UTC-5',
      language: 'en',
      theme: 'light'
    },
    api: {
      telegramApiKey: 'YOUR_TELEGRAM_BOT_TOKEN_HERE',
      openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
      huggingfaceApiKey: 'YOUR_HUGGINGFACE_API_KEY_HERE',
      webhookUrl: 'https://api.telegram.org/bot***/setWebhook'
    },
    notifications: {
      emailNotifications: true,
      slackNotifications: false,
      webhookNotifications: true,
      errorAlerts: true,
      performanceAlerts: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipWhitelist: '',
      auditLogs: true
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: User },
    { id: 'api', name: 'API Keys', icon: Key },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'webhooks', name: 'Webhooks', icon: Globe }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Simulate save operation
    console.log('Saving settings:', settings);
    // Show success message
    alert('Settings saved successfully!');
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="label">Bot Ecosystem Name</label>
        <input
          type="text"
          value={settings.general.botName}
          onChange={(e) => handleSettingChange('general', 'botName', e.target.value)}
          className="input"
          placeholder="Enter ecosystem name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="input"
          >
            <option value="UTC-5">UTC-5 (EST)</option>
            <option value="UTC-4">UTC-4 (EDT)</option>
            <option value="UTC-3">UTC-3 (BRT)</option>
            <option value="UTC+0">UTC+0 (GMT)</option>
            <option value="UTC+1">UTC+1 (CET)</option>
          </select>
        </div>

        <div>
          <label className="label">Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="input"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="pt">Português</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Theme</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={settings.general.theme === 'light'}
              onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
              className="mr-2"
            />
            Light
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={settings.general.theme === 'dark'}
              onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
              className="mr-2"
            />
            Dark
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={settings.general.theme === 'auto'}
              onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
              className="mr-2"
            />
            Auto
          </label>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <Shield className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              API keys are sensitive information. Keep them secure and never share them publicly.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="label">Telegram Bot API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={showApiKey ? settings.api.telegramApiKey : maskApiKey(settings.api.telegramApiKey)}
            onChange={(e) => handleSettingChange('api', 'telegramApiKey', e.target.value)}
            className="input pr-10"
            placeholder="Enter Telegram API key"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="label">OpenAI API Key</label>
        <div className="relative">
          <input
            type="password"
            value={maskApiKey(settings.api.openaiApiKey)}
            onChange={(e) => handleSettingChange('api', 'openaiApiKey', e.target.value)}
            className="input pr-10"
            placeholder="Enter OpenAI API key"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Hugging Face API Key</label>
        <div className="relative">
          <input
            type="password"
            value={maskApiKey(settings.api.huggingfaceApiKey)}
            onChange={(e) => handleSettingChange('api', 'huggingfaceApiKey', e.target.value)}
            className="input pr-10"
            placeholder="Enter Hugging Face API key"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Webhook URL</label>
        <input
          type="url"
          value={settings.api.webhookUrl}
          onChange={(e) => handleSettingChange('api', 'webhookUrl', e.target.value)}
          className="input"
          placeholder="https://panans.app/webhook"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Error Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when bots encounter errors</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.errorAlerts}
                onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Performance Alerts</h4>
              <p className="text-sm text-gray-600">Get notified about performance issues</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.performanceAlerts}
                onChange={(e) => handleSettingChange('notifications', 'performanceAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <label className="label">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="input"
              min="5"
              max="480"
            />
          </div>

          <div>
            <label className="label">IP Whitelist</label>
            <textarea
              value={settings.security.ipWhitelist}
              onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
              className="input"
              rows="3"
              placeholder="Enter IP addresses (one per line)"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'api':
        return renderApiSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Settings for this section are coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your bot ecosystem configuration</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon
                  className={`mr-3 h-5 w-5 ${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
