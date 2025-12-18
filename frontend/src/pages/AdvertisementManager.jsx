import React, { useState, useEffect, useCallback } from 'react';
import advertisementService from '../services/advertisementService';
import toast from 'react-hot-toast';

const AdvertisementManager = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    item_type: 'Service',
    name: '',
    category: 'Technology',
    company_name: '',
    price: '',
    benefit: '',
    cta_text: 'Get Started'
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'Technology', 'Design', 'Marketing', 'Business', 'Furniture',
    'Education', 'Health', 'Finance', 'Entertainment', 'Food'
  ];

  const itemTypes = [
    'Service', 'Product', 'Event', 'Gig', 'Digital Product'
  ];

  const fetchAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      const ads = await advertisementService.getUserAdvertisements();
      setAdvertisements(ads || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Failed to load advertisements');
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      event.target.value = '';
      return;
    }

    setUploadedImage(file);
    toast.success('Image uploaded successfully');
  };

  const saveAdvertisement = async () => {
    // Validation
    if (!formData.name?.trim() || !formData.company_name?.trim() || 
        !formData.benefit?.trim() || !formData.cta_text?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    
    try {
      let imageFilename = null;
      let imageUrl = null;

      // Upload image if present
      if (uploadedImage) {
        try {
          const uploadResult = await advertisementService.uploadAdvertisementImage(uploadedImage);
          imageFilename = uploadResult.filename;
          imageUrl = uploadResult.image_url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('Failed to upload image. Creating ad without image.');
        }
      }

      // Prepare advertisement data
      const adData = {
        item_type: formData.item_type,
        name: formData.name.trim(),
        category: formData.category,
        company_name: formData.company_name.trim(),
        price: formData.price?.trim() || '',
        benefit: formData.benefit.trim(),
        cta_text: formData.cta_text.trim(),
        image_filename: imageFilename,
        image_url: imageUrl
      };

      // Create advertisement
      if (uploadedImage && imageFilename) {
        await advertisementService.createAdvertisementWithImage(adData);
      } else {
        await advertisementService.createAdvertisement(adData);
      }

      toast.success('Advertisement created successfully!');
      setShowCreateForm(false);
      resetForm();
      await fetchAdvertisements();
      
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast.error(error?.message || 'Failed to save advertisement');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAdvertisement = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      await advertisementService.deleteAdvertisement(adId);
      toast.success('Advertisement deleted successfully');
      await fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('Failed to delete advertisement');
    }
  };

  const resetForm = () => {
    setFormData({
      item_type: 'Service',
      name: '',
      category: 'Technology',
      company_name: '',
      price: '',
      benefit: '',
      cta_text: 'Get Started'
    });
    setUploadedImage(null);
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Handle full URLs
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Handle relative URLs
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app';
    return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Advertisements</h1>
          <p className="text-gray-600 mt-2">Create and manage your advertisements</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create Advertisement'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Advertisement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Type *
              </label>
              <select
                value={formData.item_type}
                onChange={(e) => handleInputChange('item_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {itemTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name * (max 6 words)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Professional Web Development"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="e.g., TechCraft Solutions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price/Rate (optional)
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., $75/hour or $29"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Text * (max 3 words)
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => handleInputChange('cta_text', e.target.value)}
                placeholder="e.g., Get Started"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Benefit / Value *
              </label>
              <textarea
                value={formData.benefit}
                onChange={(e) => handleInputChange('benefit', e.target.value)}
                placeholder="e.g., Fast, responsive websites that convert visitors into customers"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertisement Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your own image (max 5MB) or leave empty to auto-generate
              </p>
              
              {uploadedImage && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">{uploadedImage.name}</span>
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        const fileInput = document.querySelector('input[type="file"]');
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={saveAdvertisement}
              disabled={isSaving}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Advertisement'}
            </button>
            <button
              onClick={resetForm}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Advertisements List */}
      <div className="space-y-4">
        {advertisements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No advertisements yet. Create your first one!</p>
          </div>
        ) : (
          advertisements.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {ad.image_url && (
                    <img 
                      src={getImageUrl(ad.image_url)}
                      alt={ad.headline || ad.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ad.headline || ad.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {ad.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {ad.description || ad.benefit}
                    </p>
                    {ad.offer && (
                      <p className="text-green-600 font-semibold text-sm mb-2">{ad.offer}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span>{ad.company_name}</span>
                        {ad.views !== undefined && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{ad.views} views</span>
                          </>
                        )}
                        {ad.clicks !== undefined && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{ad.clicks} clicks</span>
                          </>
                        )}
                      </div>
                      <button className="bg-orange-500 text-white px-4 py-1 rounded text-sm font-medium hover:bg-orange-600 transition-colors">
                        {ad.cta_text}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => deleteAdvertisement(ad.id)}
                    className="text-red-500 hover:text-red-700"
                    type="button"
                    aria-label="Delete advertisement"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdvertisementManager;
