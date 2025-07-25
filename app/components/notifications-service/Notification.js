import { postSubscription } from "./notification.api";

export const WebPushRegister = async() => {
  const registerServiceWorker = async () => {
    try {
      const register = await navigator.serviceWorker.register('/sw.js');
      // Service worker registered successfully
    } catch (error) {
      // Error handling without console.log
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      // Error handling without console.log
    }
  };
  
  if ("serviceWorker" in navigator) {
    await registerServiceWorker().catch((error) => {
      // Error handling without console.log
    });
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
