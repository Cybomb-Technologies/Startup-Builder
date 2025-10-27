// Create a new file: src/utils/newsletter.js
export const subscribeToNewsletter = (email, userData = {}) => {
    const subscriber = {
      id: generateId(),
      email,
      subscribedAt: new Date().toISOString(),
      isActive: true,
      ...userData
    };
    
    const existingSubscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
    const updatedSubscribers = [...existingSubscribers, subscriber];
    localStorage.setItem('newsletterSubscribers', JSON.stringify(updatedSubscribers));
    
    return subscriber;
  };
  
  export const unsubscribeFromNewsletter = (email) => {
    const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
    const updatedSubscribers = subscribers.map(sub => 
      sub.email === email ? { ...sub, isActive: false, unsubscribedAt: new Date().toISOString() } : sub
    );
    localStorage.setItem('newsletterSubscribers', JSON.stringify(updatedSubscribers));
  };
  
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };