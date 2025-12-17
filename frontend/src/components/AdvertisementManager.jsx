import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  MousePointer, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  Archive,
  Download,
  ExternalLink,
  Calendar,
  TrendingUp
} from 'lucide-react';
import advertisementService from '../services/advertisementService';

const AdvertisementManager = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadAdvertisements();
  }, [filter]);

  const loadAdvertisements = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const ads = await advertisementService.getUserAdvertisements(params);
      setAdvertisements(ads);
    } catch (error) {
      toast.error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (adId, newStatus) => {
    try {
      await advertisementService.updateAdvertisement(adId, { status: newStatus });
      toast.success(`Advertisement ${newStatus === 'active' ? 'activated' : newStatus === 'paused' ? 'paused' : 'archived'}`);
      loadAdvertisements();
    } catch (error) {
      toast.error('Failed to update advertisement status');
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      return;
    }

    try {
      await advertisementService.deleteAdvertisement(adId);
      toast.success('Advertisement deleted successfully');
      loadAdvertisements();
    } catch (error) {
      toast.error('Failed to delete advertisement');
    }
  };

  const downloadImage = (ad) => {
    if (ad.image_url) {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8001';
      const link = document.createElement('a');
      link.href = `${baseUrl}${ad.image_url}`;
      link.download = `${ad.name.replace(/\s+/g, '_')}_ad.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image download started!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Archive className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading advertisements...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertisement Manager</h1>
          <p className="text-gray-600 mt-2">Manage and track your advertisements</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['all', 'active', 'paused', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ads</p>
              <p className="text-2xl font-bold text-gray-900">{advertisements.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {advertisements.reduce((sum, ad) => sum + ad.views, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {advertisements.reduce((sum, ad) => sum + ad.clicks, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <MousePointer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Ads</p>
              <p className="text-2xl font-bold text-gray-900">
                {advertisements.filter(ad => ad.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Play className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advertisements List */}
      {advertisements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You haven't created any advertisements yet."
              : `No ${filter} advertisements found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {advertisements.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Image */}
              {ad.image_url && (
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8001'}${ad.image_url}`}
                    alt={ad.headline}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {getStatusIcon(ad.status)}
                      {ad.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{ad.headline}</h3>
                    <p className="text-sm text-gray-600">{ad.company_name} • {ad.category}</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{ad.description}</p>

                {ad.offer && (
                  <p className="text-blue-600 font-semibold text-sm mb-4">{ad.offer}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {ad.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-4 h-4" />
                    {ad.clicks}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(ad.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Status Actions */}
                  {ad.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(ad.id, 'paused')}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm"
                    >
                      <Pause className="w-3 h-3" />
                      Pause
                    </button>
                  ) : ad.status === 'paused' ? (
                    <button
                      onClick={() => handleStatusChange(ad.id, 'active')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
                    >
                      <Play className="w-3 h-3" />
                      Activate
                    </button>
                  ) : null}

                  {ad.status !== 'archived' && (
                    <button
                      onClick={() => handleStatusChange(ad.id, 'archived')}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  )}

                  {/* Download */}
                  {ad.image_url && (
                    <button
                      onClick={() => downloadImage(ad)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementManager;
