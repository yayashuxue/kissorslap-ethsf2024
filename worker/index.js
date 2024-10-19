self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data.text());
  console.log("Push event received:", data);
  event.waitUntil(
    registration
      .showNotification(data.title, {
        body: data.message,
        icon: "/kissorslap-logo.png",
      })
      .catch((error) => {
        console.error("showNotification error:", error);
      })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow("/");
      })
  );
});
