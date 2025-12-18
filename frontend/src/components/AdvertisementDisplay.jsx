import React, { useState, useEffect } from 'react';
import advertisementService from '../services/advertisementService';
import PictureAdCard from './PictureAdCard';

const AdvertisementDisplay = ({ category, itemType, limit = 3 }) => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    fetchAdvertisements();
  }, [category, itemType]);

  // Re-shuffle when dependencies change to get new order
  useEffect(() => {
    setShuffleKey(prev => prev + 1);
  }, [category, itemType]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const params = { limit };
      if (category) params.category = category;
      if (itemType) params.item_type = itemType;
      
      const ads = await advertisementService.getPublicAdvertisements(params);
      setAdvertisements(ads);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle for better randomization
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAdClick = async (ad) => {
    try {
      await advertisementService.trackClick(ad.id);
      
      // Handle CTA action - prioritize cta_url if available
      if (ad.cta_url) {
        // Use the provided URL directly
        const url = ad.cta_url.startsWith('http') ? ad.cta_url : `https://${ad.cta_url}`;
        window.open(url, '_blank');
      } else if (ad.cta_text.toLowerCase().includes('contact')) {
        // Open contact form or message modal
        window.location.href = `/messages?ad=${ad.id}`;
      } else if (ad.cta_text.toLowerCase().includes('apply')) {
        // Navigate to application page
        window.location.href = `/jobs/post?ref=${ad.id}`;
      } else if (ad.cta_text.toLowerCase().includes('learn')) {
        // Navigate to details page
        window.location.href = `/advertisement-details/${ad.id}`;
      } else {
        // Default: open in new tab
        window.open('#', '_blank');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdView = async (ad) => {
    try {
      await advertisementService.trackView(ad.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  useEffect(() => {
    // Track views when ads are loaded
    advertisements.forEach(ad => {
      handleAdView(ad);
    });
  }, [advertisements]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (advertisements.length === 0) {
    return null;
  }

  // Shuffle advertisements for variety
  const shuffledAds = shuffleArray(advertisements).slice(0, limit);
  
  // Separate picture ads from regular ads
  const pictureAds = shuffledAds.filter(ad => ad.is_picture_only || ad.picture_filename);
  const regularAds = shuffledAds.filter(ad => !(ad.is_picture_only || ad.picture_filename));
  
  // Group consecutive picture ads into pairs
  const groupedPictureAds = [];
  for (let i = 0; i < pictureAds.length; i += 2) {
    if (i + 1 < pictureAds.length) {
      groupedPictureAds.push([pictureAds[i], pictureAds[i + 1]]);
    } else {
      groupedPictureAds.push([pictureAds[i]]);
    }
  }
  
  // Interleave picture ad pairs with regular ads for better layout
  const combinedItems = [];
  let pictureIndex = 0;
  let regularIndex = 0;
  
  // Alternate: 2 picture ads, then regular ad, repeat
  while (pictureIndex < groupedPictureAds.length || regularIndex < regularAds.length) {
    if (pictureIndex < groupedPictureAds.length) {
      combinedItems.push({ type: 'picture_pair', data: groupedPictureAds[pictureIndex] });
      pictureIndex++;
    }
    if (regularIndex < regularAds.length) {
      combinedItems.push({ type: 'regular', data: regularAds[regularIndex] });
      regularIndex++;
    }
  }


  return (
    <div className="space-y-6">
      {combinedItems.map((item, index) => {
        if (item.type === 'picture_pair') {
          const [ad1, ad2] = item.data;
          return (
            <div key={`pair-${ad1.id}-${ad2?.id || 'single'}`} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PictureAdCard ad={ad1} onAdClick={handleAdClick} />
              {ad2 && <PictureAdCard ad={ad2} onAdClick={handleAdClick} />}
            </div>
          );
        }
        
        // Regular ad
        const ad = item.data;
        return (
          <div 
            key={ad.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleAdClick(ad)}
          >
            <div className="flex items-start space-x-4 p-4">
              {ad.image_url && (
                <img 
                  src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app'}${ad.image_url}`}
                  alt={ad.headline}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{ad.headline}</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {ad.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{ad.description}</p>
                {ad.offer && (
                  <p className="text-green-600 font-semibold text-sm mb-2">{ad.offer}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{ad.company_name}</span>
                  <button 
                    className="bg-orange-500 text-white px-4 py-1 rounded text-sm font-medium hover:bg-orange-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdClick(ad);
                    }}
                  >
                    {ad.cta_text}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdvertisementDisplay;
