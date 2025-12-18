import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Image, Type, Eye, Download, Share2 } from 'lucide-react';
import advertisementService from '../services/advertisementService';

const AdvertisementCreator = ({ onAdvertisementCreated }) => {
  const [formData, setFormData] = useState({
    item_type: '',
    name: '',
    category: '',
    company_name: '',
    price: '',
    benefit: '',
    cta_text: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [createdAd, setCreatedAd] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const itemTypes = [
    'Service',
    'Product', 
    'Event',
    'Gig',
    'Digital Product'
  ];

  const categories = [
    'Technology',
    'Design',
    'Marketing',
    'Business',
    'Furniture',
    'Education',
    'Health',
    'Finance',
    'Entertainment',
    'Food'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.item_type) errors.push('Item type is required');
    if (!formData.name) errors.push('Name is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.company_name) errors.push('Company name is required');
    if (!formData.benefit) errors.push('Benefit is required');
    if (!formData.cta_text) errors.push('CTA text is required');

    // Word count validations
    if (formData.name && formData.name.split(' ').length > 6) {
      errors.push('Name should be maximum 6 words for headline compliance');
    }

    if (formData.cta_text && formData.cta_text.split(' ').length > 3) {
      errors.push('CTA text should be maximum 3 words');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      const advertisement = await advertisementService.createAdvertisement(formData);
      setCreatedAd(advertisement);
      setShowPreview(true);
      toast.success('Advertisement created successfully!');
      
      if (onAdvertisementCreated) {
        onAdvertisementCreated(advertisement);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create advertisement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      item_type: '',
      name: '',
      category: '',
      company_name: '',
      price: '',
      benefit: '',
      cta_text: ''
    });
    setCreatedAd(null);
    setShowPreview(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const downloadImage = () => {
    if (createdAd && createdAd.image_url) {
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app'}${createdAd.image_url}`;
      link.download = `${createdAd.name.replace(/\s+/g, '_')}_ad.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image download started!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Type className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Advertisement</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type *
              </label>
              <select
                name="item_type"
                value={formData.item_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select item type</option>
                {itemTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name * <span className="text-xs text-gray-500">(max 6 words)</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Professional Web Development"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Words: {formData.name.split(' ').filter(word => word.length > 0).length}/6
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="e.g., TechCraft Solutions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., $75/hour or $299"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Benefit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Benefit *
              </label>
              <textarea
                name="benefit"
                value={formData.benefit}
                onChange={handleInputChange}
                placeholder="e.g., Fast, responsive websites that convert visitors into customers"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* CTA Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call-to-Action * <span className="text-xs text-gray-500">(max 3 words)</span>
              </label>
              <input
                type="text"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleInputChange}
                placeholder="e.g., Get Quote"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Words: {formData.cta_text.split(' ').filter(word => word.length > 0).length}/3
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Advertisement'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
          </div>

          {createdAd ? (
            <div className="space-y-6">
              {/* Image Preview */}
              {createdAd.image_url && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Advertisement Image
                    </h3>
                    <button
                      onClick={downloadImage}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app'}${createdAd.image_url}`}
                      alt={createdAd.headline}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              {/* Text Advertisement */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Text Advertisement
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Headline:</span>
                      <button
                        onClick={() => copyToClipboard(createdAd.headline, 'Headline')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{createdAd.headline}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Description:</span>
                      <button
                        onClick={() => copyToClipboard(createdAd.description, 'Description')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-700">{createdAd.description}</p>
                  </div>

                  {createdAd.offer && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Offer:</span>
                        <button
                          onClick={() => copyToClipboard(createdAd.offer, 'Offer')}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-blue-600 font-semibold">{createdAd.offer}</p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Call-to-Action:</span>
                      <button
                        onClick={() => copyToClipboard(createdAd.cta_text, 'CTA')}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Copy
                      </button>
                    </div>
                    <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-semibold">
                      {createdAd.cta_text}
                    </span>
                  </div>
                </div>

                {/* Copy All Button */}
                <button
                  onClick={() => {
                    const fullText = `${createdAd.headline}\n\n${createdAd.description}${createdAd.offer ? `\n\n${createdAd.offer}` : ''}\n\n${createdAd.cta_text}`;
                    copyToClipboard(fullText, 'Full advertisement');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Share2 className="w-4 h-4" />
                  Copy Full Advertisement
                </button>
              </div>

              {/* Advertisement Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Advertisement Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium">{createdAd.item_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">{createdAd.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Views:</span>
                    <span className="ml-2 font-medium">{createdAd.views}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Clicks:</span>
                    <span className="ml-2 font-medium">{createdAd.clicks}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Create an advertisement to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvertisementCreator;
