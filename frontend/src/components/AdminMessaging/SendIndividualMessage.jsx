import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Send, Search, Loader } from 'lucide-react';
import { adminAPI } from '../../services/api';

const SendIndividualMessage = ({ onMessageSent }) => {
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch users for selection
  const fetchUsers = async (search = '') => {
    try {
      setSearchLoading(true);
      const params = search ? { search } : {};
      const response = await adminAPI.getUsers(params);
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search users
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      fetchUsers(value);
      setShowUserList(true);
    } else {
      setShowUserList(false);
      setUsers([]);
    }
  };

  // Select user
  const selectUser = (user) => {
    setSelectedUser(user);
    setReceiverId(user.id);
    setShowUserList(false);
    setSearchTerm(`${user.full_name} (${user.email})`);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!receiverId) {
      toast.error('Please select a recipient');
      return;
    }

    if (!content.trim()) {
      toast.error('Message content cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.sendAdminIndividualMessage({
        receiver_id: parseInt(receiverId),
        content: content.trim()
      });

      toast.success('Message sent successfully!');
      setContent('');
      setReceiverId('');
      setSelectedUser(null);
      setSearchTerm('');
      onMessageSent?.();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const templatePlaceholders = [
    { placeholder: '{{full_name}}', description: 'User\'s full name' },
    { placeholder: '{{username}}', description: 'User\'s username' },
    { placeholder: '{{email}}', description: 'User\'s email address' }
  ];

  const insertPlaceholder = (placeholder) => {
    setContent(content + placeholder);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <form onSubmit={handleSendMessage} className="space-y-6">
        {/* Recipient Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Select Recipient *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchTerm && setShowUserList(true)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* User List Dropdown */}
          {showUserList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <Loader className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                users.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      {user.primary_role} • {user.is_verified ? '✓ Verified' : 'Unverified'}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {selectedUser && (
            <div className="mt-2 inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-700">
                Selected: <strong>{selectedUser.full_name}</strong> ({selectedUser.email})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setReceiverId('');
                  setSearchTerm('');
                }}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Template Placeholders Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Template Placeholders</h3>
          <p className="text-sm text-gray-600 mb-3">
            Click to insert placeholders that will be replaced with user data:
          </p>
          <div className="flex flex-wrap gap-2">
            {templatePlaceholders.map(item => (
              <button
                key={item.placeholder}
                type="button"
                onClick={() => insertPlaceholder(item.placeholder)}
                title={item.description}
                className="px-3 py-1 bg-white border border-blue-300 rounded text-blue-600 hover:bg-blue-100 text-sm font-mono transition-colors"
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
            placeholder="Type your message here. Use {{full_name}}, {{username}}, or {{email}} for personalization..."
            rows="6"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="text-sm text-gray-500 mt-2">
            {content.length}/1000 characters
          </div>
        </div>

        {/* Preview */}
        {content && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Message Preview:</h4>
            <div className="bg-white border border-gray-300 rounded p-3 text-gray-700 whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !receiverId || !content.trim()}
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
                Send Message
              </>
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => {
              setContent('');
              setReceiverId('');
              setSelectedUser(null);
              setSearchTerm('');
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Info Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✓ This message will be sent as an admin message and will appear with an admin badge in the user's inbox.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default SendIndividualMessage;