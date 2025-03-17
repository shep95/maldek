
// FastSpring integration utilities

// Store ID - replace with your actual FastSpring store ID
export const FASTSPRING_STORE_ID = 'yourfastspringstoreid';

// Product IDs - replace with your actual FastSpring product IDs
export const PRODUCT_IDS = {
  basicInvestment: 'basic-investment-monthly',
  vipInvestment: 'vip-investment-yearly',
};

/**
 * Initializes the FastSpring popup store
 */
export const initFastSpring = () => {
  // Create FastSpring script if it doesn't exist
  if (!document.getElementById('fastspring-script')) {
    const script = document.createElement('script');
    script.id = 'fastspring-script';
    script.src = `https://d1f8f9xcsvx3ha.cloudfront.net/sbl/${FASTSPRING_STORE_ID}.js`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    // Initialize FastSpring when the script loads
    script.onload = () => {
      if (window.fastspring) {
        window.fastspring.builder.push({
          'reset': true,
          'data': {
            'user': {
              // Will be populated when launching the store
            }
          }
        });
      }
    };
  }
};

/**
 * Opens the FastSpring popup store for a specific product
 */
export const openFastSpringStore = (productId: string, userInfo: { email?: string, userId: string }) => {
  if (!window.fastspring) {
    console.error('FastSpring not initialized');
    return;
  }

  // Set user data
  window.fastspring.builder.push({
    'reset': true,
    'data': {
      'user': {
        email: userInfo.email,
        userId: userInfo.userId,
      }
    }
  });

  // Launch the store for the selected product
  window.fastspring.builder.checkout(productId);
};

// Add FastSpring types to the global Window interface
declare global {
  interface Window {
    fastspring: {
      builder: {
        push: (config: any) => void;
        checkout: (product: string | string[]) => void;
      };
    };
  }
}
