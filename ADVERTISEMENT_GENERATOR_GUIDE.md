# Prolinq Advertisement Generator Guide

## Overview

The Prolinq Advertisement Generator is a comprehensive system for creating clean, modern advertisements suitable for products, services, gigs, events, or any company offering. The system ensures all advertisements follow consistent design rules and maintain brand standards.

## Features

- **Template-based Generation**: Automatically generates both image prompts and text advertisements
- **Design Rules Compliance**: Ensures all ads follow specified formatting rules
- **Category-specific Customization**: Tailors visuals and messaging based on item category
- **Real-time Preview**: Shows visual and text previews of generated advertisements
- **Copy-to-Clipboard**: Easy export of generated content
- **Input Validation**: Prevents errors and ensures data quality

## Files Structure

```
├── PROLINQ_ADVERTISEMENT_TEMPLATE.md     # Complete template documentation
├── frontend/src/utils/advertisementGenerator.js  # Core generation logic
├── frontend/src/components/AdvertisementGenerator.jsx  # React component
└── frontend/src/pages/AdvertisementDemo.jsx  # Demo page
```

## Quick Start

### 1. Using the React Component

```jsx
import AdvertisementGenerator from '../components/AdvertisementGenerator';

function MyPage() {
  return <AdvertisementGenerator />;
}
```

### 2. Using the Utility Directly

```javascript
import { AdvertisementGenerator } from '../utils/advertisementGenerator';

const inputData = {
  itemType: 'Service',
  name: 'Professional Web Development',
  category: 'Technology',
  companyName: 'TechCraft Solutions',
  price: '$75/hour',
  benefit: 'Fast, responsive websites that convert visitors',
  ctaText: 'Get Quote'
};

const ad = AdvertisementGenerator.generateAdvertisement(inputData);
console.log(ad.imagePrompt);
console.log(ad.textAd);
```

## Input Data Format

```javascript
{
  itemType: 'Service|Product|Event|Gig|Digital Product',
  name: 'Item name (max 6 words)',
  category: 'Technology|Design|Marketing|Business|Furniture|Education|Health|Finance|Entertainment|Food',
  companyName: 'Company or provider name',
  price: '$price or $rate/hour (optional)',
  benefit: 'Main benefit or value proposition',
  ctaText: 'Call-to-action text (max 3 words)'
}
```

## Output Format

### Image Prompt
```
"A clean, modern picture ad showing [visual description], with [color] gradient background, [theme], and the text '[short text]' prominently displayed in clean typography"
```

### Text Advertisement
```javascript
{
  headline: 'Max 6 words',
  description: '1-2 lines describing the benefit',
  offer: 'Optional price/offer information',
  cta: 'Max 3 words call-to-action'
}
```

## Design Rules Compliance

### Image Ad Rules
✅ Minimalist, modern, mobile-friendly layout  
✅ Clean background with soft gradients  
✅ Clear visual focus that represents the item  
✅ Short text inside the image (max 6–7 words)  
✅ No clutter, no tiny text  

### Text Ad Rules
✅ Headline max 6 words  
✅ 1–2 line description  
✅ Optional offer/price  
✅ CTA max 3 words  
✅ No emojis, professional and clean  

## Category-Specific Customization

### Color Schemes
- **Technology**: Soft blue gradients
- **Design**: Soft purple gradients
- **Marketing**: Soft teal gradients
- **Business**: Soft gray gradients
- **Furniture**: Soft green gradients
- **Education**: Soft orange gradients
- **Health**: Soft green gradients
- **Finance**: Deep blue gradients
- **Entertainment**: Vibrant pink gradients
- **Food**: Warm orange gradients

### Visual Themes
Each category has specific visual themes:
- **Technology**: Modern tech aesthetic, minimalist design
- **Design**: Creative layout, artistic elements
- **Marketing**: Dynamic composition, professional branding
- **Business**: Corporate aesthetic, professional setting
- **Furniture**: Clean lifestyle setting, modern interior
- **Education**: Learning environment, academic setting
- **Health**: Wellness atmosphere, clean medical aesthetic
- **Finance**: Professional business setting, corporate environment
- **Entertainment**: Vibrant energy, engaging atmosphere
- **Food**: Appetizing presentation, culinary setting

## Examples

### Example 1: Freelance Service
**Input:**
```javascript
{
  itemType: 'Service',
  name: 'Professional Web Development',
  category: 'Technology',
  companyName: 'TechCraft Solutions',
  price: '$75/hour',
  benefit: 'Fast, responsive websites that convert visitors into customers',
  ctaText: 'Get Quote'
}
```

**Output:**
```
IMAGE_PROMPT: "A clean, modern picture ad showing a sleek laptop displaying a beautifully designed website interface, with soft blue gradient background, minimalist design, and the text 'Professional Web Development' prominently displayed in clean typography"

TEXT_AD:
Headline: Professional Web Development
Description: Fast, responsive websites that convert visitors into customers
Offer: Starting at $75/hour
CTA: Get Quote
```

### Example 2: Digital Product
**Input:**
```javascript
{
  itemType: 'Digital Product',
  name: 'Social Media Templates Pack',
  category: 'Marketing',
  companyName: 'Creative Studio Pro',
  price: '$29',
  benefit: 'Save hours with professional social media designs for all platforms',
  ctaText: 'Download Now'
}
```

**Output:**
```
IMAGE_PROMPT: "A clean, modern picture ad showing multiple phone screens displaying beautifully designed social media templates, arranged in an elegant grid pattern with soft purple gradient background, and the text 'Professional Social Media Templates' in bold, readable font"

TEXT_AD:
Headline: Social Media Templates Pack
Description: Save hours with professional social media designs for all platforms
Offer: Only $29 one-time
CTA: Download Now
```

## API Reference

### AdvertisementGenerator.generateAdvertisement(inputData)

Generates a complete advertisement from input data.

**Parameters:**
- `inputData` (Object): The item data containing all required fields

**Returns:**
```javascript
{
  imagePrompt: String,
  textAd: {
    headline: String,
    description: String,
    offer: String,
    cta: String
  },
  metadata: {
    itemType: String,
    name: String,
    category: String,
    companyName: String,
    generatedAt: String
  }
}
```

### AdvertisementGenerator.validateInput(inputData)

Validates input data against required fields and rules.

**Parameters:**
- `inputData` (Object): The item data to validate

**Returns:**
```javascript
{
  isValid: Boolean,
  errors: Array<String>
}
```

## Integration with Prolinq

### Adding to Existing Pages

1. **Import the component:**
```javascript
import AdvertisementGenerator from '../components/AdvertisementGenerator';
```

2. **Add to your page:**
```jsx
<div className="advertisement-generator-section">
  <AdvertisementGenerator />
</div>
```

### Custom Styling

The component uses Tailwind CSS classes. You can override styles by:

1. **Custom CSS:**
```css
.custom-ad-generator .bg-blue-600 {
  background-color: #your-brand-color;
}
```

2. **Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#your-color'
      }
    }
  }
}
```

### Backend Integration

To save generated advertisements to your database:

```javascript
// Example API call
const saveAdvertisement = async (adData) => {
  try {
    const response = await fetch('/api/advertisements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving advertisement:', error);
  }
};
```

## Best Practices

### For Content Creators
1. **Keep names concise** (max 6 words for headlines)
2. **Focus on benefits** rather than features
3. **Use clear, action-oriented CTAs**
4. **Choose appropriate categories** for better visual matching

### For Developers
1. **Validate inputs** before generation
2. **Handle errors gracefully**
3. **Provide user feedback** for copy operations
4. **Consider accessibility** in color choices

### For Marketers
1. **Test different CTA texts** for better conversion
2. **A/B test image prompts** with different visual themes
3. **Monitor performance** of generated advertisements
4. **Customize categories** based on your specific industry

## Troubleshooting

### Common Issues

**Issue:** Generated text is too long
**Solution:** Ensure input names and CTA text follow word count limits

**Issue:** Image prompt doesn't match expectations
**Solution:** Check category selection and item type for better visual matching

**Issue:** Copy to clipboard not working
**Solution:** Ensure HTTPS context for clipboard API in production

**Issue:** Styling conflicts
**Solution:** Use CSS modules or scoped styles to prevent conflicts

### Error Messages

- `"itemType is required"` - Select an item type from the dropdown
- `"Name should be maximum 6 words for headline compliance"` - Shorten the item name
- `"CTA text should be maximum 3 words"` - Shorten the call-to-action text

## Future Enhancements

### Planned Features
- [ ] AI-powered image generation integration
- [ ] Advanced customization options
- [ ] Advertisement performance analytics
- [ ] Batch generation for multiple items
- [ ] Template export/import functionality
- [ ] Multi-language support

### Integration Opportunities
- [ ] Connect with Prolinq job posting system
- [ ] Integrate with user profile services
- [ ] Link to campaign management tools
- [ ] Connect with analytics dashboard

## Support

For questions, issues, or feature requests:
1. Check this documentation first
2. Review the component source code
3. Test with the demo page
4. Contact the development team

## License

This advertisement generator system is part of the Prolinq platform and follows the same licensing terms as the main application.
