const cacheName = "netqwix";

self.addEventListener('install', () => {
  console.log('service worker installed')
});

self.addEventListener('activate', () => {
  console.log('service worker activated')
});


self.addEventListener('push', function(event) {
    const data = event.data.json();
    console.log('Received a push notification:', data);

    // Display the notification
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.description,
        icon: '/netquix-logo.png' 
      })
    );
});