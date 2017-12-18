if (localStorage.getItem('currentUser').length > 5) {
  $('#insideGroup, header, footer').hide();
  showGroups();
  var messageVal;
  $('#chatMessage').on('keyup', function(e) {if (e.keyCode == 13) {initializeMessage();}});
}
else {
  $('#chat-holder').html('You need to sign in to be able to chat!');
}

function groupExists(groupName) {
  var groupDoesExist;
  var looped;
  var ref = db.ref('users');
  ref.on('value', function(snapshot) {
    var uids = Object.keys(snapshot.val());
    for (var i = 0; i < uids.length; i++) {
      var groupNamesRef = db.ref('users/'+uids[i]+'/groups');
      groupNamesRef.on('value', function(data) {
        data.forEach(function(child) {
          if (child.val() == groupName) {
            groupDoesExist = true;
            $("#msg").html('Group with the name "'+groupName+'" already exists. Please enter a different name!');
          } else {
            $("#msg").html('"'+groupName+'" is available!');
          }
        });
      });
      looped = true;
    }
  });
  if (groupDoesExist == true) {
    return true;
  } else if (looped == true) {
    looped = null;
    return false;
  }
}

function memberExists(memberName) {
  var memberExists;
  var myUsername = db.ref('users/'+localStorage.getItem('currentUser')+'/username');
  myUsername.on('value', function(data) {myUsername = data.val();});
  var ref = db.ref('users').orderByChild('username').equalTo(memberName);
  ref.on('child_added', function(snapshot) {
    var usersdata = snapshot.val();
    if (usersdata.username != myUsername) {
      $('#groupMember').attr('class', 'invalid');
      $('#groupMemberLabel').attr('data-error', 'You can\'t create a group with only yourself');
    } else if (usersdata.username == memberName) {
      $('#groupMember').attr('class', 'valid');
      $('#groupMemberLabel').attr('data-success', usersdata.username+" exists.");
      memberExists = true;
    } else {
      $('#groupMember').attr('class', 'invalid');
      $('#groupMemberLabel').attr('data-error', 'No such user exists.');
    }
  });
}

function newGroup() {
  $('#newGroup').modal('open');
  $("#groupMember").keyup(function() {
    memberExists($('#groupMember').val());
  });
  $('#newGroup').submit(function(e) {
    e.preventDefault();
    var groupName = $("#groupName").val();
    var groupMember = $("#groupMember").val();

    if (5 == 5) {
      var uid = localStorage.getItem('currentUser');
      db.ref("users/"+uid+"/groups").push(groupName);
      addMember(groupMember, groupName);
      closeNewGroupForm();
    }
  });
}

function closeNewGroupForm() {
  $('#newGroup').modal('close');
}

function cancelAddMember() {
  $("#addMember").empty();
  $("#addMember").hide();
}

function addMemberForm() {
  $("#addMember").empty();
  $("#addMember").show();
  $("#addMember").append('\
    <input type="text" id="newMember" placeholder="Enter username of new member..." required>\
    <button type="submit" id="addMemberBtn">Add member</button>\
    <button onclick="cancelAddMember()">Cancel</button>\
  ');
  $("#addMember").submit(function() {
    var member = $('#newMember').val();
    var group = $('#groupHeading').text();
    addMember(member, group);
    alert('New member "'+member+'" has been added succesfully!');
    $('#addMember').empty();
    $('#addMember').hide();
  });
}

function addMember(username, groupName) {
  var usersRef = db.ref("users").orderByChild("username").equalTo(username);
  usersRef.once("child_added", function(snapshot) {
    var usersUid = snapshot.key;
    db.ref("users/"+usersUid+"/groups").push(groupName);
  });
}

function showGroups() {
  if (localStorage.getItem('currentUser').length > 5) {
    var uid = localStorage.getItem('currentUser');
    var groups = db.ref("users/"+uid+"/groups");
    groups.on("value", function(data) {
      var groupNames = data.val();
      var keys = Object.keys(groupNames);
      $('#groupOption').empty();
      for (var i = 0; i < keys.length; i++) {
        var groupName = groupNames[keys[i]];
        $('#groupOption').append('<p onclick="openGroup(\''+groupName+'\')">'+groupName+'</p>');
      }
    });
  }
}

var group;
var prevMessages;

function openGroup(groupName) {
  group = groupName;
  var uid = localStorage.getItem('currentUser');
  $("#newGroupBtn").hide();
  $("#groupOption").hide();
  $("#insideGroup, header, footer").show();
  $("#groupHeading").text(group);
  db.ref("chat/"+group).on("value", function(data) {
    if (data.hasChildren() == true) {
      db.ref('users').on('value', function(snapshot) {
        var messages = data.val();
        var keys = Object.keys(messages);
        $("#messages").empty();
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          var profilePicUrl = snapshot.child(messages[k].uid+'/profilePic').val();
          var occurance = messages[k].message.indexOf('class="permittedAndFormattable"');
          if (occurance > -1) {
            if (messages[k].uid == uid) {
              $('#messages').append('\
                <div class="row green right-align">\
                  '+messages[k].message+'\
                  <img class="chatProfilePic circle" src="'+profilePicUrl+'" alt="image">\
                </div>\
              ');
            } else if (messages[k].uid != uid) {
              $('#messages').append('\
                <div class="row red">\
                  <img class="chatProfilePic circle" src="'+profilePicUrl+'" alt="image">\
                  '+messages[k].message+'\
                </div>\
              ');
            }
          } else if (messages[k].uid == uid) {
            $('#messages').append('\
              <div class="row green truncate right-align">\
                <xmp class="col s10">'+messages[k].message+'</xmp>\
                <img class="chatProfilePic circle right" src="'+profilePicUrl+'" alt="image">\
              </div>\
            ');
          } else if (messages[k].uid != uid) {
            $('#messages').append('\
              <div class="row red truncate">\
                <img class="chatProfilePic circle left" src="'+profilePicUrl+'" alt="image">\
                <xmp class="col s10">'+messages[k].message+'</xmp>\
              </div>\
            ');
          }
          window.scrollTo(0, document.body.scrollHeight);
        }
      });
    }
  });
}

function goBackToGroups() {
  $("#insideGroup, header, footer").hide();
  $("#newGroupBtn").show();
  $("#groupOption").show();
  $("#messages").empty();
}

function openGroupSettings() {
  $("#groupSettings").toggle();
}

function initializeMessage() {
  messageVal = $("#chatMessage").val();
  $("#chatMessage").val("");
  sendMessage(messageVal);
}

function sendMessage(message) {
  var uid = localStorage.getItem('currentUser');
  var dt = new Date();
  var group = $("#groupHeading").text();
  var time = dt.getUTCHours()+":"+dt.getUTCMinutes()+":"+dt.getUTCSeconds();
  var date = dt.getUTCDate()+"."+(dt.getUTCMonth() + 1)+"."+dt.getUTCFullYear();
  if ((message.indexOf('xmp') > -1) && (message.indexOf('>') > -1)) {
    alert("Your message contains text that is not permitted. Please see and remove stuff like xmp tags or something like that.");
  } else {
    var usersChatRef = db.ref("chat/"+group).push();
    usersChatRef.child("message").set(message);
    usersChatRef.child("time").set(time);
    usersChatRef.child("date").set(date);
    usersChatRef.child("uid").set(uid);
  }
}

function addImageToChat() {
  var uid = firebase.auth().currentUser.uid;
  $("#addImage").empty();
  $("#addImage").show();
  $("#addImage").append('\
    <input type="file" id="image" accept="image/*, video/*">\
    <button onclick="closeAddImage()">cancel</button>');
  $("#image").on("change", function(e) {
    var image = e.target.files[0];
    var parts = image.name.split('.');
    var extn = parts[parts.length - 1];
    function isImage() {
      switch (extn.toLowerCase()) {
        case 'jpg':
        case 'gif':
        case 'bmp':
        case 'png':
          //etc
          return true;
      }
      return false;
    }
    storage.ref("comet-chat/"+uid+"/"+image.name).put(image).then(function() {
      var imageRef = storage.ref("comet-chat/"+uid+"/"+image.name);
      imageRef.getDownloadURL().then(function(url) {
        var message;
        if (isImage() == true) {
          message = '<img src="'+url+'" class="permittedAndFormattable" style="width: 70%" alt="'+image.name+'">';
        } else {
          message = '<video src="'+url+'>" class="permittedAndFormattable" controls>\
                       Your browser does not support the video tag.\
                     </video>'
        }
        sendMessage(message);
        closeAddImage();
      });
    })
  });
}

function closeAddImage() {
  $("#addImage").empty();
  $("#addImage").hide();
}
