import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Send,
  Users,
  Mail,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Clock
} from 'lucide-react';
import SendIndividualMessage from '../components/AdminMessaging/SendIndividualMessage';
import SendBulkMessage from '../components/AdminMessaging/SendBulkMessage';
import AdminMessagesInbox from '../components/AdminMessaging/AdminMessagesInbox';
import AdminSentMessages from '../components/AdminMessaging/AdminSentMessages';
import CampaignStats from '../components/AdminMessaging/CampaignStats';
import { adminAPI } from '../services/api';

const AdminMessaging = () => {
  const [activeTab, setActiveTab] = useState('send-individual');
  const [stats, setStats] = useState({
    unread_count: 0,
    total_sent: 0,
    active_campaigns: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch admin messaging stats
  const fetchStats = async () => {
    try {
      const unreadResponse = await adminAPI.getAdminUnreadCount();
      const messagesResponse = await adminAPI.getAdminSentMessages();
      
      setStats({
        unread_count: unreadResponse.data?.count || 0,
        total_sent: messagesResponse.data?.length || 0,
        active_campaigns: messagesResponse.data?.filter(m => m.is_bulk)?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Trigger refresh when message is sent
  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchStats();
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div style={{ color: color }} className="opacity-20">
          <Icon className="w-12 h-12" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            Admin Messaging Center
          </h1>
          <p className="text-gray-600 mt-2">Send and manage messages to users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Mail}
            title="Unread Messages"
            value={stats.unread_count}
            color="#3b82f6"
          />
          <StatCard
            icon={Send}
            title="Total Messages Sent"
            value={stats.total_sent}
            color="#10b981"
          />
          <StatCard
            icon={Users}
            title="Active Campaigns"
            value={stats.active_campaigns}
            color="#f59e0b"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'send-individual', label: 'Send Individual Message', icon: Mail },
              { id: 'send-bulk', label: 'Send Bulk Message', icon: Users },
              { id: 'sent', label: 'Sent Messages', icon: Send },
              { id: 'inbox', label: 'Messages Received', icon: MessageSquare },
              { id: 'campaigns', label: 'Campaign Stats', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'send-individual' && (
              <SendIndividualMessage onMessageSent={handleMessageSent} />
            )}
            {activeTab === 'send-bulk' && (
              <SendBulkMessage onMessageSent={handleMessageSent} />
            )}
            {activeTab === 'sent' && (
              <AdminSentMessages onMessageDeleted={handleMessageSent} />
            )}
            {activeTab === 'inbox' && (
              <AdminMessagesInbox refreshTrigger={refreshTrigger} />
            )}
            {activeTab === 'campaigns' && (
              <CampaignStats refreshTrigger={refreshTrigger} onMessageDeleted={handleMessageSent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessaging;