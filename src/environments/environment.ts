// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: "http://localhost:3000/v1/",
  imgUrl: "http://localhost:3000/uploads/",
  firebaseConfig: {
    apiKey: "AIzaSyDu4WF-7oely4T3JPHjxAzKxKA1rC-9YDM",
    authDomain: "banner-web-b98bc.firebaseapp.com",
    projectId: "banner-web-b98bc",
    storageBucket: "banner-web-b98bc.appspot.com",
    messagingSenderId: "311720436742",
    appId: "1:311720436742:web:c433b2f1a58c893229cf87",
    measurementId: "G-CQP0QPNN61",
  },
  basicUser: "admin", // This should match your backend BASIC_USER
  basicPassword: "password123", // This should match your backend BASIC_PASSWORD
  RAZORPAY_KEY_ID: "rzp_test_HJG5Rtuy8Xh2NB"
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
