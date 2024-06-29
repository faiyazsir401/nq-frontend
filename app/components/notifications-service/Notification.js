import { postSubscription } from "./notification.api";

export const WebPushRegister = async() => {
  console.log('Web Push')
  const register = async () => {
    const register = await navigator.serviceWorker.register('/sw.js', {
      scope: "/dashboard",
    });
    console.log(register, "service worker registered");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
      urlBase64ToUint8Array("BG88ZDil6E8uFnYyE0E5tO1GdUu2GaK2Fm6JSVkKUMWT7t4tOt21sZJSBuH5BRpXTBoEdt9cMjau13GNihKONeo"),
      // urlBase64ToUint8Array("BN0d35Litphrans8GESVSf8QMmVnXO-H21LnWMwWXHsglVR2YxX6wqiCbuvBcYg9Uyh-U9j9-RMrUPI-3eLp88M"),
    });
    console.log(subscription, "service worker subscription Id");
    const response = await postSubscription(JSON.stringify({subscription}));
    console.log(response, "service worker subscription Id");
  };
  
  if ("serviceWorker" in navigator) {
    await register().catch((error) => {
      console.log(error);
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
