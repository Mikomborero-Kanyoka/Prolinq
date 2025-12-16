import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BarChart3, Loader, TrendingUp, Mail, Eye, Send, RefreshCw, Trash2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../../services/api';

const CampaignStats = ({ refreshTrigger, onMessageDeleted = () => {} }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch sent messages to get campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminSentMessages();
      const messages = response.data || [];
      
      console.log(`📊 Fetching campaigns: total messages=${messages.length}, bulk messages=${messages.filter(m => m.is_bulk).length}`);
      
      // Group by campaign
      const campaignMap = new Map();
      
      messages.forEach(msg => {
        if (msg.is_bulk && msg.bulk_campaign_id) {
          if (!campaignMap.has(msg.bulk_campaign_id)) {
            campaignMap.set(msg.bulk_campaign_id, {
              campaign_id: msg.bulk_campaign_id,
              campaign_name: msg.bulk_campaign_name || 'Untitled Campaign',
              created_at: msg.created_at,
              total_messages: 0,
              read_count: 0,
              unread_count: 0,
              last_updated: msg.created_at
            });
          }
          
          const campaign = campaignMap.get(msg.bulk_campaign_id);
          campaign.total_messages += 1;
          if (msg.is_read) {
            campaign.read_count += 1;
          } else {
            campaign.unread_count += 1;
          }
          if (new Date(msg.created_at) > new Date(campaign.last_updated)) {
            campaign.last_updated = msg.created_at;
          }
        }
      });
      
      const finalCampaigns = Array.from(campaignMap.values()).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      console.log(`📊 Final campaigns count: ${finalCampaigns.length}`);
      console.log(`📊 Campaign details:`, finalCampaigns.map(c => ({
        id: c.campaign_id,
        name: c.campaign_name,
        total: c.total_messages
      })));
      
      setCampaigns(finalCampaigns);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [refreshTrigger]);

  // Fetch stats for selected campaign
  const fetchCampaignStats = async (campaignId) => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getAdminCampaignStats(campaignId);
      setCampaignStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch campaign stats');
      console.error(error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch campaign message content
  const fetchCampaignMessage = async (campaignId) => {
    try {
      setStatsLoading(true);
      const response = await adminAPI.getAdminSentMessages();
      const messages = response.data || [];
      
      console.log(`🔍 Fetching messages for campaign ${campaignId}:`, {
        totalMessages: messages.length,
        bulkMessages: messages.filter(msg => msg.is_bulk).length,
        campaignMessages: messages.filter(msg => msg.is_bulk && msg.bulk_campaign_id === campaignId).length
      });
      
      // Find the first message for this campaign to get the content
      const campaignMessage = messages.find(msg => 
        msg.is_bulk && msg.bulk_campaign_id === campaignId
      );
      
      if (campaignMessage) {
        setCampaignStats(prev => ({
          ...prev,
          message_content: campaignMessage.content,
          message_subject: campaignMessage.subject || 'No Subject'
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch campaign message');
      console.error(error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    fetchCampaignStats(campaign.campaign_id);
    fetchCampaignMessage(campaign.campaign_id);
  };

  // Delete individual campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      console.log(`🗑️ Deleting campaign ${campaignId}`);
      
      // Delete all messages for this campaign
      const response = await adminAPI.getAdminSentMessages();
      const messages = response.data || [];
      const campaignMessages = messages.filter(msg => 
        msg.is_bulk && msg.bulk_campaign_id === campaignId
      );

      console.log(`📊 Found ${campaignMessages.length} messages to delete for campaign ${campaignId}`);

      // Delete each message in the campaign
      for (const message of campaignMessages) {
        console.log(`🗑️ Deleting message ${message.id}`);
        await adminAPI.deleteSentAdminMessage(message.id);
      }

      // Clear selection if deleted campaign was selected
      if (selectedCampaign?.campaign_id === campaignId) {
        setSelectedCampaign(null);
        setCampaignStats(null);
      }

      // Force refresh to get updated data
      console.log(`🔄 Refreshing campaigns after deletion...`);
      await fetchCampaigns();
      
      toast.success('Campaign deleted successfully');
      
      // Notify parent to refresh stats
      onMessageDeleted();
    } catch (error) {
      toast.error('Failed to delete campaign');
      console.error('Delete campaign error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear all campaigns
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL campaigns? This action cannot be undone and will delete all bulk messages.')) {
      return;
    }

    try {
      setLoading(true);
      // Get all sent messages and delete bulk messages
      const response = await adminAPI.getAdminSentMessages();
      const messages = response.data || [];
      const bulkMessages = messages.filter(msg => msg.is_bulk);

      // Delete all bulk messages
      for (const message of bulkMessages) {
        await adminAPI.deleteSentAdminMessage(message.id);
      }

      setSelectedCampaign(null);
      setCampaignStats(null);
      await fetchCampaigns();
      toast.success('All campaigns deleted successfully');
      
      // Notify parent to refresh stats
      onMessageDeleted();
    } catch (error) {
      toast.error('Failed to delete all campaigns');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh campaigns
  const handleRefresh = async () => {
    await fetchCampaigns();
    if (selectedCampaign) {
      await fetchCampaignStats(selectedCampaign.campaign_id);
    }
    toast.success('Data refreshed');
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate read percentage
  const getReadPercentage = (campaign) => {
    if (campaign.total_messages === 0) return 0;
    return Math.round((campaign.read_count / campaign.total_messages) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-3">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Campaign Analytics
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track the performance of your bulk messaging campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Refresh campaigns"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {campaigns.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Clear all campaigns"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Mail className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-3">No bulk campaigns yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaigns List */}
          <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto">
            {campaigns.map(campaign => {
              const readPct = getReadPercentage(campaign);
              return (
                <motion.div
                  key={campaign.campaign_id}
                  whileHover={{ x: 4 }}
                  onClick={() => handleSelectCampaign(campaign)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCampaign?.campaign_id === campaign.campaign_id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {campaign.campaign_name}
                    </h4>
                    <p className="text-xs font-mono text-gray-500 mt-1">
                      ID: {campaign.campaign_id.substring(0, 12)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(campaign.created_at)}
                    </p>
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">{campaign.total_messages} sent</span>
                      <span className="font-medium text-blue-600">{readPct}% read</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${readPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {campaign.total_messages} sent
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        {campaign.read_count} read
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        {campaign.unread_count} unread
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCampaign(campaign.campaign_id);
                      }}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors group"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Campaign Detail */}
          <div className="lg:col-span-2">
            {selectedCampaign ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                {/* Header */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-xl text-gray-900 mb-2">
                        {selectedCampaign.campaign_name}
                      </h4>
                      <p className="text-sm font-mono text-gray-600">
                        ID: {selectedCampaign.campaign_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statsLoading && (
                        <Loader className="w-5 h-5 animate-spin text-blue-600" />
                      )}
                      <button
                        onClick={() => handleDeleteCampaign(selectedCampaign.campaign_id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        title="Delete this campaign"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Campaign
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Created: {formatDate(selectedCampaign.created_at)}
                  </p>
                </div>

                {/* Message Content */}
                {campaignStats?.message_content && (
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      Message Content
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {campaignStats.message_subject && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">Subject: </span>
                          <span className="text-sm text-gray-900">{campaignStats.message_subject}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {campaignStats.message_content}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCampaign.total_messages}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Total Recipients</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCampaign.read_count}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Messages Read</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedCampaign.unread_count}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Unread</div>
                  </div>
                </div>

                {/* Read Percentage */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">Read Rate</span>
                    <span className="text-lg font-bold text-blue-600">
                      {getReadPercentage(selectedCampaign)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${getReadPercentage(selectedCampaign)}%` }}
                    />
                  </div>
                </div>

                {/* Charts */}
                {campaignStats && (
                  <div className="space-y-6">
                    {/* Pie Chart for Read/Unread */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-4">Read Status Distribution</h5>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Read', value: selectedCampaign.read_count, fill: '#10b981' },
                              { name: 'Unread', value: selectedCampaign.unread_count, fill: '#f59e0b' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h6 className="font-medium text-blue-900">Campaign Summary</h6>
                          <p className="text-sm text-blue-800 mt-1">
                            This campaign reached {selectedCampaign.total_messages} recipients with 
                            a {getReadPercentage(selectedCampaign)}% read rate. {selectedCampaign.unread_count} recipients 
                            haven't opened the message yet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {statsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500 mt-3">Select a campaign to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CampaignStats;
