import React, { useState } from 'react';
import { AdvertisementGenerator } from '../utils/advertisementGenerator';
import advertisementService from '../services/advertisementService';
import toast from 'react-hot-toast';

const AdvertisementGeneratorComponent = () => {
  const [inputData, setInputData] = useState({
    itemType: 'Service',
    name: '',
    category: 'Technology',
    companyName: '',
    price: '',
    benefit: '',
    ctaText: 'Get Started'
  });

  const [generatedAd, setGeneratedAd] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    'Technology', 'Design', 'Marketing', 'Business', 'Furniture',
    'Education', 'Health', 'Finance', 'Entertainment', 'Food'
  ];

  const itemTypes = [
    'Service', 'Product', 'Event', 'Gig', 'Digital Product'
  ];

  const handleInputChange = (field, value) => {
    setInputData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const generateAdvertisement = () => {
    // Validate input
    const validation = AdvertisementGenerator.validateInput(inputData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Generate advertisement
    const ad = AdvertisementGenerator.generateAdvertisement(inputData);
    setGeneratedAd(ad);
    setShowPreview(true);
    setErrors([]);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const resetForm = () => {
    setInputData({
      itemType: 'Service',
      name: '',
      category: 'Technology',
      companyName: '',
      price: '',
      benefit: '',
      ctaText: 'Get Started'
    });
    setGeneratedAd(null);
    setShowPreview(false);
    setErrors([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Advertisement</h2>
        <p className="text-gray-600">Generate professional ads with AI-powered image prompts and optimized text content</p>
      </div>
      
      <div className="p-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Advertisement Details</h2>
            
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm">• {error}</div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type *
                </label>
                <select
                  value={inputData.itemType}
                  onChange={(e) => handleInputChange('itemType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {itemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name * (max 6 words)
                </label>
                <input
                  type="text"
                  value={inputData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Professional Web Development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={inputData.category}
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
                  Company Name *
                </label>
                <input
                  type="text"
                  value={inputData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
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
                  value={inputData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., $75/hour or $29"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Benefit / Value *
                </label>
                <textarea
                  value={inputData.benefit}
                  onChange={(e) => handleInputChange('benefit', e.target.value)}
                  placeholder="e.g., Fast, responsive websites that convert visitors into customers"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Button Text * (max 3 words)
                </label>
                <input
                  type="text"
                  value={inputData.ctaText}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder="e.g., Get Started"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={generateAdvertisement}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Advertisement
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {showPreview && generatedAd && (
            <>
              {/* Image Prompt Preview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Image Prompt</h3>
                  <button
                    onClick={() => copyToClipboard(generatedAd.imagePrompt, 'Image prompt')}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">{generatedAd.imagePrompt}</p>
                </div>
              </div>

              {/* Text Ad Preview */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Text Advertisement</h3>
                  <button
                    onClick={() => copyToClipboard(
                      `Headline: ${generatedAd.textAd.headline}\nDescription: ${generatedAd.textAd.description}\n${generatedAd.textAd.offer ? `Offer: ${generatedAd.textAd.offer}\n` : ''}CTA: ${generatedAd.textAd.cta}`,
                      'Text ad'
                    )}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                
                {/* Visual Preview */}
                <div className="p-6 bg-white border border-gray-200 rounded-md">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-lg mb-3">
                      {generatedAd.textAd.headline}
                    </div>
                  </div>
                  <p className="text-gray-700 text-center mb-4">
                    {generatedAd.textAd.description}
                  </p>
                  {generatedAd.textAd.offer && (
                    <p className="text-center text-green-600 font-semibold mb-4">
                      {generatedAd.textAd.offer}
                    </p>
                  )}
                  <div className="text-center">
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                      {generatedAd.textAd.cta}
                    </button>
                  </div>
                </div>

                {/* Text Format */}
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                  <div className="space-y-2 text-sm">
                    <div><strong>Headline:</strong> {generatedAd.textAd.headline}</div>
                    <div><strong>Description:</strong> {generatedAd.textAd.description}</div>
                    {generatedAd.textAd.offer && (
                      <div><strong>Offer:</strong> {generatedAd.textAd.offer}</div>
                    )}
                    <div><strong>CTA:</strong> {generatedAd.textAd.cta}</div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Generated Metadata</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Type:</strong> {generatedAd.metadata.itemType}</div>
                  <div><strong>Category:</strong> {generatedAd.metadata.category}</div>
                  <div><strong>Company:</strong> {generatedAd.metadata.companyName}</div>
                  <div><strong>Generated:</strong> {new Date(generatedAd.metadata.generatedAt).toLocaleString()}</div>
                </div>
              </div>
            </>
          )}

          {!showPreview && (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-600">Fill in the details and click "Generate Advertisement" to see your ad preview here</p>
            </div>
          )}
        </div>
      </div>

        {/* Rules Reference */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Design Rules Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Image Ad Rules</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Minimalist, modern, mobile-friendly layout</li>
                <li>✅ Clean background with soft gradients</li>
                <li>✅ Clear visual focus that represents the item</li>
                <li>✅ Short text inside the image (max 6–7 words)</li>
                <li>✅ No clutter, no tiny text</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Text Ad Rules</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Headline max 6 words</li>
                <li>✅ 1–2 line description</li>
                <li>✅ Optional offer/price</li>
                <li>✅ CTA max 3 words</li>
                <li>✅ No emojis, professional and clean</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementGeneratorComponent;
