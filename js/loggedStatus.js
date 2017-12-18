hideloader();
if (localStorage.getItem('currentUser').length > 5) {
  // User is signed in.
  var uid = localStorage.getItem('currentUser');
  var username;
  var profilePic;
  var usersRef = db.ref('users/'+uid);
  usersRef.on('value', function(snapshot) {
    username = snapshot.val().username;
    profilePic = snapshot.val().profilePic;
    $('#loggedStatus').html('\
      <ul>\
        <li>'+username+'<img src="'+profilePic+'" id="profilePic" alt="profile pic"></img>\
          <ul class="logout">\
            <li><a href="profile.html">Profile</a></li><br>\
            <li><a href="#" onclick="signOutUser()">Sign out</a></li>\
          </ul>\
        </li>\
      </ul>\
    ');
    $('#signinreq').show();
  });
} else {
  // No user is signed in.
  if ($('#loggedStatus').html() == '') {
    $('#loggedStatus').html('\
      <ul class="logout">\
        <li>\
          <a href="signin.html">Sign in</a>\
        </li>\
      </ul>\
    ');
  }
  $("#signinreqmessage").html('You need to <a href="signin.html">sign in</a> to be able to see this page!');
  $("#signinreq").hide();
}
