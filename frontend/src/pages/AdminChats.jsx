import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminChats = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('conversations');
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getConversations();
      setConversations(response.data);
      setError('');
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (userId) => {
    try {
      setMessagesLoading(true);
      const response = await adminAPI.getConversationMessages(userId);
      setMessages(response.data);
      setSelectedConversation(userId);
      setError('');
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.searchMessages(searchQuery);
      setSearchResults(response.data);
      setError('');
    } catch (err) {
      console.error('Error searching messages:', err);
      setError('Failed to search messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await adminAPI.deleteMessage(messageId);

      if (selectedConversation) {
        await loadConversationMessages(selectedConversation);
      }

      if (activeTab === 'search' && searchQuery) {
        await searchMessages();
      }

      setError('');
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Conversations
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Search Messages
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
            {error}
          </div>
        )}

        <div className="p-6">
          {/* ------------------------------------------
              TAB 1: CONVERSATIONS
          ------------------------------------------- */}
          {activeTab === 'conversations' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Conversations List */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Conversations</h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No conversations found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.user_id}
                        onClick={() => loadConversationMessages(conv.user_id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conv.user_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900">{conv.user_name}</h4>

                          {conv.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">{conv.user_email}</p>

                        {conv.last_message && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {truncateMessage(conv.last_message)}
                          </p>
                        )}

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-400">
                            {conv.total_messages} messages
                          </span>

                          {conv.last_message_time && (
                            <span className="text-xs text-gray-400">
                              {formatDate(conv.last_message_time)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages View */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <div>
                    <div className="border-b border-gray-200 pb-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Conversation with{' '}
                        {conversations.find(c => c.user_id === selectedConversation)?.user_name}
                      </h3>
                    </div>

                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-500">Loading messages...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === selectedConversation
                                ? 'justify-start'
                                : 'justify-end'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === selectedConversation
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">
                                  {message.sender_name}
                                </span>

                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="ml-2 text-red-500 hover:text-red-700 text-xs"
                                  title="Delete message"
                                >
                                  ×
                                </button>
                              </div>

                              <p className="text-sm">{message.content}</p>

                              <p
                                className={`text-xs mt-1 ${
                                  message.sender_id === selectedConversation
                                    ? 'text-gray-500'
                                    : 'text-blue-100'
                                }`}
                              >
                                {formatDate(message.created_at)}
                                {message.is_read ? ' ✓' : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Select a conversation to view messages
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ------------------------------------------
                TAB 2: SEARCH MESSAGES
            ------------------------------------------- */
            <div>
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchMessages()}
                    placeholder="Search messages by content..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <button
                    onClick={searchMessages}
                    disabled={!searchQuery.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-500">Searching...</p>
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  No messages found for "{searchQuery}"
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Search Results ({searchResults.length})
                  </h3>

                  {searchResults.map((message) => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{message.sender_name}</span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="font-medium text-gray-900">{message.receiver_name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDate(message.created_at)}
                          </span>

                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Delete message"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
                        {message.content}
                      </p>

                      <div className="mt-2 text-xs text-gray-500">
                        {message.is_read ? 'Read' : 'Unread'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
