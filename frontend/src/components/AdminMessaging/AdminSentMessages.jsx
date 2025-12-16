import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Trash2, Loader, MessageSquare, Eye, Calendar, User, BarChart3 } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminSentMessages = ({ onMessageDeleted = () => {} }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'bulk', 'individual'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const fetchSentMessages = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminSentMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      toast.error('Failed to load sent messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStats = async (campaignId) => {
    try {
      setLoadingStats(true);
      const response = await adminAPI.getAdminCampaignDetails(campaignId);
      setCampaignStats(response.data);
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      toast.error('Failed to load campaign details');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSelectCampaign = async (campaignId) => {
    setSelectedCampaign(campaignId);
    await fetchCampaignStats(campaignId);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This will remove it from the recipient\'s inbox.')) {
      return;
    }

    try {
      await adminAPI.deleteSentAdminMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted successfully');
      
      // Refresh stats if a campaign is selected
      if (selectedCampaign) {
        await fetchCampaignStats(selectedCampaign);
      }
      
      // Notify parent to refresh stats
      onMessageDeleted();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteAllCampaignMessages = async (campaignId, campaignName) => {
    const campaignMessages = messages.filter(m => m.bulk_campaign_id === campaignId);
    
    if (!window.confirm(
      `Are you sure you want to delete all ${campaignMessages.length} messages from "${campaignName}" campaign? This will remove them from all recipients' inboxes.`
    )) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete all messages in the campaign
      for (const msg of campaignMessages) {
        await adminAPI.deleteSentAdminMessage(msg.id);
      }
      
      setMessages(prev => prev.filter(m => m.bulk_campaign_id !== campaignId));
      setSelectedCampaign(null);
      setCampaignStats(null);
      toast.success(`All ${campaignMessages.length} messages from "${campaignName}" deleted`);
      
      // Notify parent to refresh stats
      onMessageDeleted();
    } catch (error) {
      console.error('Error deleting campaign messages:', error);
      toast.error('Failed to delete campaign messages');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllMessages = async () => {
    if (!window.confirm(
      `Are you sure you want to delete ALL ${messages.length} messages and start fresh? This action cannot be undone.`
    )) {
      return;
    }

    try {
      setLoading(true);
      const totalMessages = messages.length;
      
      // Delete all messages
      for (const msg of messages) {
        await adminAPI.deleteSentAdminMessage(msg.id);
      }
      
      setMessages([]);
      setSelectedCampaign(null);
      setCampaignStats(null);
      setSearchQuery('');
      setFilter('all');
      toast.success(`All ${totalMessages} messages cleared successfully`);
      
      // Notify parent to refresh stats
      onMessageDeleted();
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast.error('Failed to clear messages');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMessages = () => {
    let filtered = messages;

    if (filter === 'bulk') {
      filtered = filtered.filter(m => m.is_bulk);
    } else if (filter === 'individual') {
      filtered = filtered.filter(m => !m.is_bulk);
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        (m.bulk_campaign_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  // Group messages by campaign
  const groupedByCampaign = messages.reduce((acc, msg) => {
    if (msg.is_bulk) {
      const campaignId = msg.bulk_campaign_id;
      if (!acc[campaignId]) {
        acc[campaignId] = {
          campaignId,
          campaignName: msg.bulk_campaign_name,
          messages: [],
          createdAt: msg.created_at
        };
      }
      acc[campaignId].messages.push(msg);
    }
    return acc;
  }, {});

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading sent messages...</p>
        </div>
      </div>
    );
  }

  const filteredMessages = getFilteredMessages();
  const bulkCampaigns = Object.values(groupedByCampaign);
  const individualMessages = messages.filter(m => !m.is_bulk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sent Messages</h2>
          <p className="text-gray-600 mt-1">Manage all messages you've sent to users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSentMessages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Refresh
          </button>
          {messages.length > 0 && (
            <button
              onClick={handleClearAllMessages}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              title="Delete all messages and start fresh"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bulk Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{bulkCampaigns.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Individual Messages</p>
              <p className="text-3xl font-bold text-gray-900">{individualMessages.length}</p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <input
          type="text"
          placeholder="Search by campaign name or message content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('bulk')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Bulk
          </button>
          <button
            onClick={() => setFilter('individual')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'individual'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Individual
          </button>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No messages found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk Campaigns Section */}
          {filter !== 'individual' && bulkCampaigns.filter(c =>
            !searchQuery || c.campaignName?.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(campaign => (
            <motion.div
              key={campaign.campaignId}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className="p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => handleSelectCampaign(campaign.campaignId)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        📢 {campaign.campaignName}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex-shrink-0">
                        {campaign.messages.length} recipients
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(campaign.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {campaign.messages.filter(m => m.is_read).length} read
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAllCampaignMessages(campaign.campaignId, campaign.campaignName);
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                    title="Delete entire campaign"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                {/* Campaign Stats */}
                {selectedCampaign === campaign.campaignId && campaignStats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    {/* Campaign Details Header */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Campaign Details</p>
                      <p className="text-lg font-semibold text-blue-900 mt-1">
                        {campaignStats.campaign_name || 'Unnamed Campaign'}
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        ID: {campaignStats.campaign_id}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-xs text-blue-600 mb-1">Total Sent</p>
                        <p className="text-2xl font-bold text-blue-900">{campaignStats.total_sent}</p>
                      </div>
                      <div className="bg-green-50 rounded p-3">
                        <p className="text-xs text-green-600 mb-1">Read</p>
                        <p className="text-2xl font-bold text-green-900">{campaignStats.read_count}</p>
                      </div>
                      <div className="bg-yellow-50 rounded p-3">
                        <p className="text-xs text-yellow-600 mb-1">Unread</p>
                        <p className="text-2xl font-bold text-yellow-900">{campaignStats.unread_count}</p>
                      </div>
                      <div className="bg-red-50 rounded p-3">
                        <p className="text-xs text-red-600 mb-1">Deleted by Users</p>
                        <p className="text-2xl font-bold text-red-900">{campaignStats.deleted_by_user_count}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${campaignStats.read_percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {campaignStats.read_percentage.toFixed(1)}% open rate
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Individual Messages Section */}
          {filter !== 'bulk' && individualMessages.map(message => (
            <motion.div
              key={message.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      📧 Individual Message to User #{message.receiver_id}
                    </h4>
                  </div>
                  <p className="text-gray-700 break-words mb-2">{message.content}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(message.created_at)}
                    </div>
                    <div>
                      Status: {message.is_read ? (
                        <span className="text-green-600 font-medium">✓ Read</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">○ Unread</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminSentMessages;