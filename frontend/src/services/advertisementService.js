class AdvertisementService {
  constructor() {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app';
    this.baseURL = `${apiBaseUrl}/api/advertisements`;
    this.apiBaseUrl = apiBaseUrl;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async uploadAdvertisementImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.apiBaseUrl}/api/uploads/supabase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading advertisement image:', error);
      throw error;
    }
  }

  async createAdvertisementWithImage(advertisementData) {
    try {
      const response = await fetch(`${this.baseURL}/with-image`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(advertisementData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create advertisement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating advertisement with image:', error);
      throw error;
    }
  }

  async createAdvertisement(advertisementData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(advertisementData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create advertisement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  }

  async createPictureAd(pictureAdData) {
    try {
      const response = await fetch(`${this.baseURL}/picture`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(pictureAdData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create picture advertisement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating picture advertisement:', error);
      throw error;
    }
  }

  async getUserAdvertisements(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const url = `${this.baseURL}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      throw error;
    }
  }

  async getAdvertisement(adId) {
    try {
      const response = await fetch(`${this.baseURL}/${adId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advertisement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching advertisement:', error);
      throw error;
    }
  }

  async updateAdvertisement(adId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/${adId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update advertisement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  }

  async deleteAdvertisement(adId) {
    try {
      const response = await fetch(`${this.baseURL}/${adId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete advertisement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  }

  async trackView(adId) {
    try {
      const response = await fetch(`${this.baseURL}/${adId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to track view');
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking view:', error);
      throw error;
    }
  }

  async trackClick(adId) {
    try {
      const response = await fetch(`${this.baseURL}/${adId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to track click');
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking click:', error);
      throw error;
    }
  }

  async getPublicAdvertisements(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.skip) queryParams.append('skip', params.skip);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      if (params.item_type) queryParams.append('item_type', params.item_type);

      const url = `${this.baseURL}/public/all?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch public advertisements');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching public advertisements:', error);
      throw error;
    }
  }

  getImageUrl(imageFilename) {
    if (!imageFilename) return null;
    return `${this.apiBaseUrl}/uploads/${imageFilename}`;
  }
}

export default new AdvertisementService();
