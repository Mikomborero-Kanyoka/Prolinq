# Lottie Animations

This directory contains Lottie animation JSON files for the Prolinq frontend application.

## How to Add Lottie Animations

### 1. Place your JSON files
Add your Lottie JSON animation files to this directory (`frontend/src/assets/animations/`).

### 2. Import and Export in index.js
Update the `index.js` file to import and export your animations:

```javascript
// Import your animation
import successAnimation from './success.json';
import loadingAnimation from './loading.json';

// Export them
export { successAnimation, loadingAnimation };

// Add to the animations object for easy access
export const animations = {
  success: successAnimation,
  loading: loadingAnimation,
};
```

### 3. Use in Components
Use the LottieAnimation component in your React components:

```jsx
import LottieAnimation from '../animations/components/LottieAnimation';
import { animations } from '../assets/animations';

function MyComponent() {
  return (
    <LottieAnimation
      animationData={animations.success}
      width={200}
      height={200}
      loop={false}
    />
  );
}
```

## Recommended Animation Sources

- [LottieFiles](https://lottiefiles.com/) - Free and premium animations
- [Lottie Animation Gallery](https://airbnb.design/lottie/)
- Create your own with Adobe After Effects + Bodymovin plugin

## File Naming Convention

Use descriptive names in kebab-case:
- `success-checkmark.json`
- `loading-spinner.json`
- `error-warning.json`
- `celebration-confetti.json`

## Performance Tips

1. **Optimize file size** - Keep JSON files under 100KB when possible
2. **Use appropriate settings** - Disable unnecessary features in LottieFiles
3. **Lazy load** - Only load animations when needed
4. **Cache animations** - Consider caching frequently used animations

## Common Animation Categories

### UI Feedback
- Success animations
- Error states
- Loading indicators
- Empty states

### Celebrations
- Confetti
- Fireworks
- Sparkles
- Checkmarks

### Illustrations
- Hero illustrations
- Onboarding animations
- Feature highlights
- Background animations
