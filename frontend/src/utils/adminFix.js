/**
 * Admin Status Fix Utility
 * This utility helps fix admin status issues by clearing cached data
 * and refreshing from the server.
 */

export const clearAdminCache = () => {
  console.log('🧹 Clearing admin cache...');
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  console.log('✅ Admin cache cleared. Please log in again.');
  
  // Reload the page to ensure clean state
  window.location.href = '/login';
};

export const forceAdminRefresh = async () => {
  console.log('🔄 Forcing admin refresh...');
  
  try {
    // Clear only user data, keep token
    localStorage.removeItem('user');
    
    // Reload the page to trigger fresh user data fetch
    window.location.reload();
  } catch (error) {
    console.error('❌ Error forcing admin refresh:', error);
  }
};

// Auto-fix function that can be called from console
window.fixAdminStatus = () => {
  console.log('🔧 Fixing admin status...');
  clearAdminCache();
};

// Add debug info to window
window.debugAdminStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Admin Status Debug:');
  console.log('  Token exists:', !!token);
  console.log('  User data:', user ? JSON.parse(user) : null);
  console.log('  is_admin from localStorage:', user ? JSON.parse(user).is_admin : 'N/A');
};
