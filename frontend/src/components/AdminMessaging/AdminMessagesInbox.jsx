import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Mail, CheckCircle2, Clock, Loader, MessageSquare, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminMessagesInbox = ({ refreshTrigger }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, unread, read

  // Fetch admin inbox
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const adminMessagesResponse = await adminAPI.getAdminReceivedMessages();
      const adminMessages = adminMessagesResponse.data || [];

      // Sort newest first
      adminMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMessages(adminMessages);
    } catch (error) {
      toast.error("Failed to fetch messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [refreshTrigger]);

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      await adminAPI.markAdminMessageAsRead(messageId);
      fetchMessages();
    } catch (error) {
      toast.error("Failed to mark as read");
      console.error(error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      await adminAPI.deleteAdminMessage(messageId);
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      toast.error("Failed to delete");
      console.error(error);
    }
  };

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  // Apply filter
  const filteredMessages = messages.filter(msg => {
    if (filterStatus === "read") return msg.is_read;
    if (filterStatus === "unread") return !msg.is_read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-3">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Messages Received
          </h3>
          <p className="text-sm text-gray-600">
            {messages.length} total ({unreadCount} unread)
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { id: "all", label: "All", count: messages.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "read", label: "Read", count: messages.filter(m => m.is_read).length }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === btn.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {btn.label} ({btn.count})
            </button>
          ))}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDEBAR: Messages list */}
        <div className="space-y-2 max-h-96 overflow-y-auto">

          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border rounded-lg">
              <Mail className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-gray-600 mt-2">No messages found</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <motion.div
                key={msg.id}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setSelectedMessage(msg);

                  if (!msg.is_read) {
                    markAsRead(msg.id);
                  }
                }}
                className={`p-4 rounded-lg cursor-pointer transition border ${
                  selectedMessage?.id === msg.id
                    ? "bg-blue-50 border-blue-500"
                    : msg.is_read
                    ? "bg-white border-gray-200 hover:border-gray-300"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {msg.receiver?.full_name || msg.receiver_name || "User"}
                    </p>
                    <p className="text-xs font-medium text-blue-600">
                      📧 Admin Message
                    </p>
                  </div>
                  {!msg.is_read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                </div>

                <p className="text-xs text-gray-500 mt-2">{formatDate(msg.created_at)}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* RIGHT PANEL: Message details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-gray-200 rounded-lg p-6 bg-white"
            >
              {/* HEADER */}
              <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold">
                  To: {selectedMessage.receiver?.full_name || selectedMessage.receiver_name || "User"}
                </h3>
                <p className="text-sm font-medium text-blue-600">
                  📧 Admin Message
                </p>

                <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>

              {/* CONTENT */}
              <div className="p-4 rounded-lg whitespace-pre-wrap bg-gray-50">
                {selectedMessage.content}
              </div>

              {/* ACTIONS */}
              <div className="flex justify-between mt-6 pt-4 border-t">
                {!selectedMessage.is_read && (
                  <button
                    onClick={() =>
                      markAsRead(selectedMessage.id)
                    }
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}

                <button
                  onClick={() =>
                    deleteMessage(selectedMessage.id)
                  }
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-50 border rounded-lg p-12 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminMessagesInbox;
