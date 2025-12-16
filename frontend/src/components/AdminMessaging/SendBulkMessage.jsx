import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Send, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { adminAPI } from '../../services/api';

const SendBulkMessage = ({ onMessageSent }) => {
  const [targetingMode, setTargetingMode] = useState('all'); // 'all', 'role', 'verified'
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedVerified, setSelectedVerified] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const roles = ['talent', 'employer', 'client'];

  const templatePlaceholders = [
    { placeholder: '{{full_name}}', description: 'User\'s full name' },
    { placeholder: '{{username}}', description: 'User\'s username' },
    { placeholder: '{{email}}', description: 'User\'s email address' }
  ];

  const insertPlaceholder = (placeholder) => {
    setContent(content + placeholder);
  };

  const handleSendBulkMessage = async (e) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      toast.error('Campaign name cannot be empty');
      return;
    }

    if (!content.trim()) {
      toast.error('Message content cannot be empty');
      return;
    }

    // Validate targeting criteria
    if (targetingMode === 'role' && !selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (targetingMode === 'verified' && selectedVerified === '') {
      toast.error('Please select verification status');
      return;
    }

    if (!window.confirm('Are you sure you want to send this message to multiple users? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        campaign_name: campaignName.trim(),
        content: content.trim(),
        include_all: targetingMode === 'all',
      };

      if (targetingMode === 'role') {
        payload.filter_role = selectedRole;
      } else if (targetingMode === 'verified') {
        payload.filter_verified = selectedVerified === 'true';
      }

      const response = await adminAPI.sendAdminBulkMessage(payload);

      toast.success(
        `Message sent! Campaign: ${response.data.campaign_name}\n` +
        `Recipients: ${response.data.total_sent}`
      );

      setContent('');
      setCampaignName('');
      setSelectedRole('');
      setSelectedVerified('');
      setPreview(null);
      onMessageSent?.();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to send bulk message');
    } finally {
      setLoading(false);
    }
  };

  const getTargetingDescription = () => {
    switch (targetingMode) {
      case 'all':
        return 'Message will be sent to all users (excluding admin)';
      case 'role':
        return selectedRole ? `Message will be sent to all ${selectedRole}s` : 'Select a role';
      case 'verified':
        return selectedVerified !== '' 
          ? `Message will be sent to ${selectedVerified === 'true' ? 'verified' : 'unverified'} users`
          : 'Select verification status';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <form onSubmit={handleSendBulkMessage} className="space-y-6">
        {/* Warning Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-900">Bulk Message Warning</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Bulk messages will be sent to multiple users. Please review carefully before sending.
            </p>
          </div>
        </div>

        {/* Targeting Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Target Audience *
          </label>
          <div className="space-y-3">
            {[
              { id: 'all', label: 'All Users', description: 'Send to all registered users (except admin)' },
              { id: 'role', label: 'By Role', description: 'Send to users with a specific role' },
              { id: 'verified', label: 'By Verification Status', description: 'Send to verified or unverified users' }
            ].map(mode => (
              <label key={mode.id} className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="targetingMode"
                  value={mode.id}
                  checked={targetingMode === mode.id}
                  onChange={(e) => setTargetingMode(e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div className="ml-4">
                  <div className="font-medium text-gray-900">{mode.label}</div>
                  <div className="text-sm text-gray-500">{mode.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Conditional Filter Options */}
        {targetingMode === 'role' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Choose a role --</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}s
                </option>
              ))}
            </select>
          </div>
        )}

        {targetingMode === 'verified' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Verification Status *
            </label>
            <select
              value={selectedVerified}
              onChange={(e) => setSelectedVerified(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Choose status --</option>
              <option value="true">Verified Users</option>
              <option value="false">Unverified Users</option>
            </select>
          </div>
        )}

        {/* Targeting Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">{getTargetingDescription()}</p>
          </div>
        </div>

        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., 'Welcome New Users', 'Monthly Newsletter', 'Feature Announcement'"
            maxLength="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="text-sm text-gray-500 mt-2">
            Give this campaign a descriptive name for easy tracking
          </div>
        </div>

        {/* Template Placeholders Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Template Placeholders</h3>
          <p className="text-sm text-gray-600 mb-3">
            Placeholders will be automatically replaced with each user's information:
          </p>
          <div className="flex flex-wrap gap-2">
            {templatePlaceholders.map(item => (
              <button
                key={item.placeholder}
                type="button"
                onClick={() => insertPlaceholder(item.placeholder)}
                title={item.description}
                className="px-3 py-1 bg-white border border-green-300 rounded text-green-700 hover:bg-green-100 text-sm font-mono transition-colors"
              >
                {item.placeholder}
              </button>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Message Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message. Use {{full_name}}, {{username}}, or {{email}} for personalization. Each recipient will see their own information..."
            rows="8"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="text-sm text-gray-500 mt-2">
            {content.length}/1000 characters
          </div>
        </div>

        {/* Examples */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Example Message:</h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <strong>Template:</strong>
            </p>
            <p className="bg-white p-2 border border-gray-300 rounded font-mono">
              Hi {'{{full_name}}'}, Thank you for joining! Your account {'{{username}}'} is active.
            </p>
            <p className="text-gray-700 mt-3">
              <strong>For user "John Doe" with username "johndoe":</strong>
            </p>
            <p className="bg-white p-2 border border-gray-300 rounded font-mono">
              Hi John Doe, Thank you for joining! Your account johndoe is active.
            </p>
          </div>
        </div>

        {/* Preview */}
        {content && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Message Preview (with sample data):</h4>
            <div className="bg-white border border-blue-300 rounded p-3 text-gray-700 whitespace-pre-wrap">
              {content
                .replace('{{full_name}}', 'John Doe')
                .replace('{{username}}', 'johndoe')
                .replace('{{email}}', 'john@example.com')}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !content.trim() || !campaignName.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send to Multiple Users
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => {
              setContent('');
              setCampaignName('');
              setSelectedRole('');
              setSelectedVerified('');
              setPreview(null);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Each recipient will receive a personalized message with their actual information replacing the placeholders.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default SendBulkMessage;
