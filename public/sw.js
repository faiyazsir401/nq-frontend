const cacheName = "netqwix";

self.addEventListener('install', () => {
   
});

self.addEventListener('activate', () => {
   
});


self.addEventListener('push', function(event) {
    const data = event.data.json();
     

    // Display the notification
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.description,
        icon: '/netquix-logo.png' 
      })
    );
});