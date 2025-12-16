/**
 * Prolinq Advertisement Generator
 * Generates clean, modern advertisements for products, services, gigs, events, or any company offering
 */

export class AdvertisementGenerator {
  /**
   * Generate a complete advertisement (image prompt + text ad) based on input data
   * @param {Object} inputData - The item data
   * @param {string} inputData.itemType - Type of item (Service, Product, Event, Gig, etc.)
   * @param {string} inputData.name - Name of the item
   * @param {string} inputData.category - Category of the item
   * @param {string} inputData.companyName - Company or provider name
   * @param {string} [inputData.price] - Price or rate (optional)
   * @param {string} inputData.benefit - Main benefit or value proposition
   * @param {string} inputData.ctaText - Call-to-action button text
   * @returns {Object} Generated advertisement with imagePrompt and textAd
   */
  static generateAdvertisement(inputData) {
    const { itemType, name, category, companyName, price, benefit, ctaText } = inputData;
    
    const imagePrompt = this.generateImagePrompt(inputData);
    const textAd = this.generateTextAd(inputData);
    
    return {
      imagePrompt,
      textAd,
      metadata: {
        itemType,
        name,
        category,
        companyName,
        generatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Generate AI image prompt based on item type and details
   * @param {Object} inputData - The item data
   * @returns {string} AI-generated image prompt
   */
  static generateImagePrompt(inputData) {
    const { itemType, name, category, benefit } = inputData;
    
    // Get visual theme and color based on category
    const visualTheme = this.getVisualTheme(category);
    const colorScheme = this.getColorScheme(category);
    
    // Generate item-specific visual description
    const itemVisual = this.getItemVisualDescription(inputData);
    
    // Generate short text for image (max 6-7 words)
    const imageText = this.generateImageText(inputData);
    
    return `A clean, modern picture ad showing ${itemVisual}, with ${colorScheme} gradient background, ${visualTheme}, and the text '${imageText}' prominently displayed in clean typography`;
  }
  
  /**
   * Generate text advertisement following the specified rules
   * @param {Object} inputData - The item data
   * @returns {Object} Text ad with headline, description, offer, and CTA
   */
  static generateTextAd(inputData) {
    const { name, benefit, price, ctaText } = inputData;
    
    // Generate headline (max 6 words)
    const headline = this.generateHeadline(name);
    
    // Generate description (1-2 lines)
    const description = this.generateDescription(benefit);
    
    // Generate offer/price line
    const offer = price ? this.generateOffer(price) : '';
    
    // CTA (max 3 words)
    const cta = this.truncateWords(ctaText, 3);
    
    return {
      headline,
      description,
      offer,
      cta
    };
  }
  
  /**
   * Get visual theme based on category
   * @param {string} category - Item category
   * @returns {string} Visual theme description
   */
  static getVisualTheme(category) {
    const themes = {
      'Technology': 'minimalist design, modern tech aesthetic',
      'Design': 'creative layout, artistic elements',
      'Marketing': 'dynamic composition, professional branding',
      'Business': 'corporate aesthetic, professional setting',
      'Furniture': 'clean lifestyle setting, modern interior',
      'Education': 'learning environment, academic setting',
      'Health': 'wellness atmosphere, clean medical aesthetic',
      'Finance': 'professional business setting, corporate environment',
      'Entertainment': 'vibrant energy, engaging atmosphere',
      'Food': 'appetizing presentation, culinary setting'
    };
    
    return themes[category] || 'minimalist design, professional aesthetic';
  }
  
  /**
   * Get color scheme based on category
   * @param {string} category - Item category
   * @returns {string} Color scheme description
   */
  static getColorScheme(category) {
    const colors = {
      'Technology': 'soft blue',
      'Design': 'soft purple',
      'Marketing': 'soft teal',
      'Business': 'soft gray',
      'Furniture': 'soft green',
      'Education': 'soft orange',
      'Health': 'soft green',
      'Finance': 'deep blue',
      'Entertainment': 'vibrant pink',
      'Food': 'warm orange'
    };
    
    return colors[category] || 'soft blue';
  }
  
  /**
   * Get item-specific visual description
   * @param {Object} inputData - The item data
   * @returns {string} Visual description for the image
   */
  static getItemVisualDescription(inputData) {
    const { itemType, name, category } = inputData;
    
    if (itemType === 'Service') {
      return this.getServiceVisual(category, name);
    } else if (itemType === 'Product') {
      return this.getProductVisual(category, name);
    } else if (itemType === 'Event') {
      return this.getEventVisual(category, name);
    } else if (itemType === 'Gig') {
      return this.getGigVisual(category, name);
    } else if (itemType === 'Digital Product') {
      return this.getDigitalProductVisual(category, name);
    }
    
    return `a professional representation of ${name}`;
  }
  
  /**
   * Get service visual description
   */
  static getServiceVisual(category, name) {
    const serviceVisuals = {
      'Technology': 'a sleek laptop displaying professional work',
      'Design': 'creative design tools and mockups',
      'Marketing': 'marketing analytics dashboard or campaign visuals',
      'Business': 'professional business consultation setting',
      'Education': 'learning materials or educational interface',
      'Health': 'wellness service or health consultation setting'
    };
    
    return serviceVisuals[category] || 'a professional service representation';
  }
  
  /**
   * Get product visual description
   */
  static getProductVisual(category, name) {
    return `a ${name.toLowerCase()} in a professional lifestyle setting`;
  }
  
  /**
   * Get event visual description
   */
  static getEventVisual(category, name) {
    return 'a professional event setting with engaged attendees';
  }
  
  /**
   * Get gig visual description
   */
  static getGigVisual(category, name) {
    const gigVisuals = {
      'Design': 'a collection of professional design work displayed as mockups',
      'Technology': 'coding interface or technical work demonstration',
      'Writing': 'writing samples or content creation tools',
      'Marketing': 'marketing materials or campaign examples'
    };
    
    return gigVisuals[category] || 'professional work samples and deliverables';
  }
  
  /**
   * Get digital product visual description
   */
  static getDigitalProductVisual(category, name) {
    return `multiple screens displaying ${name.toLowerCase()} in an elegant grid pattern`;
  }
  
  /**
   * Generate short text for image (max 6-7 words)
   * @param {Object} inputData - The item data
   * @returns {string} Short text for image
   */
  static generateImageText(inputData) {
    const { name, benefit, itemType } = inputData;
    
    // Extract key benefit words
    const benefitWords = benefit.split(' ').filter(word => word.length > 3);
    const keyBenefit = benefitWords.slice(0, 3).join(' ');
    
    // Create concise text based on item type
    if (itemType === 'Service') {
      return `Professional ${name.split(' ').slice(0, 2).join(' ')}`;
    } else if (itemType === 'Product') {
      return `Premium ${name.split(' ').slice(0, 2).join(' ')}`;
    } else if (itemType === 'Event') {
      return `${name.split(' ').slice(0, 2).join(' ')} 2024`;
    } else if (itemType === 'Gig') {
      return `Expert ${name.split(' ').slice(0, 2).join(' ')}`;
    }
    
    // Default to benefit-focused text
    return this.truncateWords(keyBenefit, 6);
  }
  
  /**
   * Generate headline (max 6 words)
   * @param {string} name - Item name
   * @returns {string} Generated headline
   */
  static generateHeadline(name) {
    return this.truncateWords(name, 6);
  }
  
  /**
   * Generate description (1-2 lines)
   * @param {string} benefit - Main benefit
   * @returns {string} Generated description
   */
  static generateDescription(benefit) {
    // Split into sentences and take first 1-2
    const sentences = benefit.split('.').filter(s => s.trim());
    return sentences.slice(0, 2).join('. ').trim();
  }
  
  /**
   * Generate offer line
   * @param {string} price - Price information
   * @returns {string} Generated offer
   */
  static generateOffer(price) {
    if (price.includes('/')) {
      return `Starting at ${price}`;
    } else if (price.includes('$')) {
      return `Only ${price}`;
    }
    return price;
  }
  
  /**
   * Truncate text to specified word count
   * @param {string} text - Text to truncate
   * @param {number} maxWords - Maximum word count
   * @returns {string} Truncated text
   */
  static truncateWords(text, maxWords) {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
  }
  
  /**
   * Validate input data
   * @param {Object} inputData - The item data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateInput(inputData) {
    const errors = [];
    const required = ['itemType', 'name', 'category', 'companyName', 'benefit', 'ctaText'];
    
    required.forEach(field => {
      if (!inputData[field] || inputData[field].trim() === '') {
        errors.push(`${field} is required`);
      }
    });
    
    // Validate text length rules
    if (inputData.name && inputData.name.split(' ').length > 6) {
      errors.push('Name should be maximum 6 words for headline compliance');
    }
    
    if (inputData.ctaText && inputData.ctaText.split(' ').length > 3) {
      errors.push('CTA text should be maximum 3 words');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Example usage:
 * 
 * const inputData = {
 *   itemType: 'Service',
 *   name: 'Professional Web Development',
 *   category: 'Technology',
 *   companyName: 'TechCraft Solutions',
 *   price: '$75/hour',
 *   benefit: 'Fast, responsive websites that convert visitors',
 *   ctaText: 'Get Quote'
 * };
 * 
 * const ad = AdvertisementGenerator.generateAdvertisement(inputData);
 * console.log(ad.imagePrompt);
 * console.log(ad.textAd);
 */

export default AdvertisementGenerator;
