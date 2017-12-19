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
  if ($('.modal').length) {
    $('.modal').modal();
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
        password = sjcl.encrypt('password', password);
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
    var reqPassword = sjcl.decrypt('password', snapshot.child('password').val());
    if (password === reqPassword) {
      localStorage.setItem('currentUser', snapshot.key);
      window.location.href = "index.html";
    }
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
}

function signOutUser() {
  localStorage.setItem('currentUser', '');
  window.location.href = "index.html";
}

if ($('#header').length) {
  //User is in the profile page
  if (localStorage.getItem('currentUser').length > 5) {
    var uid = localStorage.getItem('currentUser');
    var existingProfilePic = db.ref("users/"+uid).child("profilePic");
    existingProfilePic.on("value", function(data) {
      data.val();
      $("#profilePicAtProfile").attr("src", data.val());
      $("#profilePicAtProfile").click(function() {$("#newProfilePic").click();});
      $("#newProfilePic").on("change", function(e) {
        console.log("Chose new file");
        var newProfilePic = e.target.files[0];
        storage.ref("profile-pics/"+uid+"/"+newProfilePic.name).put(newProfilePic).then(function() {
          var imageRef = storage.ref("profile-pics/"+uid+"/"+newProfilePic.name);
          imageRef.getDownloadURL().then(function(url) {
            existingProfilePic.set(url);
            window.location.href="/profile.html";
          });
        });
      });
    });
    var userRef = db.ref("users/"+uid);
    var username;
    var mobile;
    userRef.on("value", function(data) {
      username = data.val().username;
      mobile = data.val().mobile;
      $('#profileUsername').append(username);
      $('#profileMobile').append(mobile);
      $('#mobileNumber').attr('value', mobile);

      $('#deleteAccount').click(function() {
        $('#profileMsg').show();
        $('#profileMsg').html('Please type your password to continue: <br>\
        <form id="reauthenticate">\
          <input type="password" id="passwordInput" placeholder="password" required>\
          <button type="submit">Delete</button>\
        </form>');
        $('#reauthenticate').submit(function(e) {
          e.preventDefault();
          firebase.auth().currentUser.reauthenticateWithCredential(credential).then(function() {
            var confirmText = 'Delete '+username+' from chatterbox';
            var confirm = prompt('Are you sure? This will delete all your data, except for the posts you have written! Type "'+confirmText+'" below to continue');
            if (confirm == confirmText) {
              db.ref('chat').on('value', function(snapshot) {
                snapshot.forEach(function(data) {
                  db.ref('chat/'+data.key+'/'+uid).remove();
                  //data.child(uid).remove();
                });
                db.ref('inbox').child(uid).remove();
                db.ref('users').child(uid).remove();
                /*firebase.auth().currentUser.delete().catch(function(err) {
                  $('#profileMsg').show();
                  alert('\
                  Your account was NOT deleted succesfully. Some of your data still remains, \
                  but you will not be able to login to your account anymore, and nobody can \
                  see any of your chat messages. Please try again immediately, otherwise you may \
                  not be able to create another comet account with your email id!');
                  console.log('\
                  Your account was NOT deleted succesfully. Some of your data still remains, \
                  but you will not be able to login to your account anymore, and nobody can \
                  see any of your chat messages. Please try again immediately, otherwise you may \
                  not be able to create another comet account with your email id!');
                  $('#profileMsg').html('\
                  Your account was NOT deleted succesfully. Some of your data still remains, \
                  but you will not be able to login to your account anymore, and nobody can \
                  see any of your chat messages. Please try again immediately, otherwise you may \
                  not be able to create another comet account with your email id!');
                });*/
              });
            } else {console.log('gifiyfyugiugugugu');}
          }).catch(function(err) {
            console.log(err);
          });
        });
      });
      $('#mobileNumber').keyup(function(e) {
        if (e.keyCode == 13) {
          db.ref('users/'+uid+'/mobile').set($(this).val());
          $('#profileMsg').show();
          $('#profileMsg').html('Your mobile number has been changed!');
        }
      });
    });
  }
}
