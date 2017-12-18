// Initialize Firebase
var config = {
  apiKey: "AIzaSyDOv_3sUXUrPqF3SrBPmXiREQ-Ulm7VVh4",
  authDomain: "chatterbox-3fc39.firebaseapp.com",
  databaseURL: "https://chatterbox-3fc39.firebaseio.com",
  projectId: "chatterbox-3fc39",
  storageBucket: "chatterbox-3fc39.appspot.com",
  messagingSenderId: "180111850333"
};
firebase.initializeApp(config);

$(document).ready(function() {
  if ($('select').length) {
    $('select').material_select();
  }
});
