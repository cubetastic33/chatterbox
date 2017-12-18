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

var db = firebase.database();
var storage = firebase.storage();

$('#signUp').submit(signUpUser);
$('#signIn').submit(signInUser);

$('#loggedStatus').hover(function() {
  $('#loggedStatus ul li ul').toggle();
});

function signUpUser(e) {
  e.preventDefault();
  //Get values
  var username = $("#username").val();
  var mobile = $('#mobile').val();
  var password = $("#password").val();
  var confPassword = $("#confPassword").val();
  if ((1 === 1) && (password == confPassword)) {
    Materialize.toast('Please wait...', 10000);
    if (password.length < 4) {
      $('#password').attr('class', 'invalid');
      $('#passwordLabel').attr('data-error', 'Password must be at least 4 characters long!');
    } else {
      $('#password').attr('class', 'validate');
      db.ref('users').push().on('value', function(data) {
        var newUser = db.ref('users/'+data.key);
        newUser.child('mobile').set(mobile);
        newUser.child('password').set(password);
        newUser.child('username').set(username);
        var uid = data.key;
        var profilePic = storage.ref("profile-pics/defaultProfilePic.png");
        profilePic.getDownloadURL().then(function(url) {
          db.ref('users/'+uid).child('profilePic').set(url);
          window.location.href = "index.html";
        });
      });
    }
  } else if (password != confPassword) {
    $('#confPassword').attr('class', 'invalid');
    $('#confPasswordLabel').attr('data-error', 'The two passwords don\'t match!');
  }
}

function signInUser(e) {
  e.preventDefault();
  var username = $('#username').val();
  var password = $('#password').val();
  Materialize.toast('Please wait...', 10000);
  var usersRef = db.ref('users').orderByChild('username').equalTo(username);
  usersRef.once('child_added', function(snapshot) {
    if (password === snapshot.child('password').val()) {
      alert(snapshot.key);
      localStorage.setItem('currentUser', snapshot.key);
      window.location.href = "index.html";
    }
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}
