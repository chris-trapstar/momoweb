
  // requestNotificationPermissions = async () => {
  //   const registration_id = await firebase.messaging().getToken();
  //   if (registration_id) {
  //     this.registerPushToken(registration_id);
  //   } else {
  //     alert(
  //       'Please allow push notification permissions in the browser settings!'
  //     );
  //   }
  // };
  //
  // registerPushToken = async registration_id => {
  //   try {
  //     const res = await fetch(`${baseUrl}/api/alert/device/fcm`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         registration_id
  //       }),
  //       headers: {
  //         Authorization: `Bearer ${window.localStorage.getItem(
  //           'jwt_access_token'
  //         )}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     const data = await res.json();
  //   } catch (e) {
  //     console.error('Failed to register the push token', e);
  //   }
  // };
