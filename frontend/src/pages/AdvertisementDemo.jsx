import React, { useState } from 'react';
import { Megaphone, Plus, List, TrendingUp } from 'lucide-react';
import AdvertisementCreator from '../components/AdvertisementCreator';
import AdvertisementManager from '../components/AdvertisementManager';

const AdvertisementDemo = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full">
                <Megaphone className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Advertisement Studio
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Create, manage, and track professional advertisements for your business
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create Advertisement
            </button>
            
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
              Manage Advertisements
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'create' && (
          <AdvertisementCreator 
            onAdvertisementCreated={() => setActiveTab('manage')}
          />
        )}
        
        {activeTab === 'manage' && (
          <AdvertisementManager />
        )}
      </div>

      {/* Footer Tips */}
      <div className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Advertisement Best Practices</h2>
            <p className="text-gray-600">Follow these guidelines for maximum impact</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Keep It Simple</h3>
              <p className="text-gray-600 text-sm">Use clear, concise messaging that gets straight to the point</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Strong Call-to-Action</h3>
              <p className="text-gray-600 text-sm">Use action words that encourage immediate response</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Test & Optimize</h3>
              <p className="text-gray-600 text-sm">Monitor performance and adjust your ads for better results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementDemo;