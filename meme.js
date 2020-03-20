// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCMECXTcIB89Jz4OPJyT8pWHbaHwgezHUQ",
    authDomain: "meme-a8183.firebaseapp.com",
    databaseURL: "https://meme-a8183.firebaseio.com",
    projectId: "meme-a8183",
    storageBucket: "meme-a8183.appspot.com",
    messagingSenderId: "505723637281",
    appId: "1:505723637281:web:dca3babc6b8a80485d1d60",
    measurementId: "G-EHK7BB5H50"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var storageRef = firebase.storage().ref();
var databaseRef = firebase.database().ref();
var auth = firebase.auth();

auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log('logged in.');
        createLogoutBtn();
        createUploadBtn();
        displayMemes();
        disableLikedPostsBtn();
        disableDisLikedPostsBtn();

        //rise upload Modal
        var upload = document.getElementById('upload');
        upload.addEventListener('click', () => {
          $('#uploadModal').modal('toggle');
        })

        //Add logout event
        logout();

        //Upload event
        var uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.addEventListener('click', () => {
          uploadMeme();
        });
    } else {
        console.log('logged out');
        createLoginBtn();
        displayMemes();

        //rise login modal
        var login = document.getElementById('login');
        login.addEventListener('click', () => {
            $("#myModal").modal('toggle');
        })

        disableBtns(); //cannot like or dislike while logged out
    }
})

function createLogoutBtn() {
    var btn = document.createElement('button');
    btn.id = 'logoutBtn';
    btn.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect';
    var t = document.createTextNode('Logout');
    btn.appendChild(t);
    document.getElementById('header').appendChild(btn);
}

function createLoginBtn() {
    var btn = document.createElement('button');
    btn.id = 'login';
    btn.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect';
    btn.modal = 'toggle';
    var t = document.createTextNode('Login');
    btn.appendChild(t);
    document.getElementById('header').appendChild(btn);
}

function createUploadBtn() {
  var btn = document.createElement('button');
  btn.id = 'upload';
  btn.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect';
  var t = document.createTextNode('Upload');
  btn.appendChild(t);
  document.getElementById('header').appendChild(btn);
}

function logout() {
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
      auth.signOut();
      logoutBtn.parentNode.removeChild(logoutBtn);
      var upload = document.getElementById('upload');
      upload.parentNode.removeChild(upload);
  });
}

function disableBtns() {
    databaseRef.child('memes').once('child_added', snap => {
        for (var i = 0; i < snap.numChildren(); i++) {
            var likeBtns = document.getElementsByClassName('likeBtn');
            var dislikeBtns = document.getElementsByClassName('dislikeBtn');
            likeBtns[i].disabled = 'true';
            dislikeBtns[i].disabled = 'true';
        }
    })
}

function uploadMeme() {
  databaseRef.child('memes').once('value', snap => {
    var numOfMemes = snap.numChildren();
    var meme = document.getElementById('memeFile').files[0];
    var url = 'meme' + (numOfMemes+1);
    var userId = auth.currentUser.uid;
    var username = '';
    var d = new Date();
    var timestamp = -d.getTime();
    databaseRef.child('users/' + auth.currentUser.uid).once('value', snap => {
        username = snap.val().username;
    })

    storageRef.child('memes/' + url + '.png').put(meme)
    .then(() => {
        var d = new Date();
        var year = d.getFullYear();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = months[d.getMonth()];
        var date = d.getDate();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var day = days[d.getDay()];
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
      databaseRef.child('memes/' + url).update({
        url: url + '.png',
        likes: 0,
        dislikes: 0,
        uploadingUserId: userId,
        uploadingUsername: username,
        timestamp: timestamp,
        year: year,
        month: month,
        date: date,
        day: day,
        hour: hour,
        minute: minute,
        second: second
      });
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.log(error);
    })
  })
}

function disableLikedPostsBtn() {
    databaseRef.child('users/' + auth.currentUser.uid + '/likedPosts').on('child_added', snap => {
        var i = snap.key.charAt(snap.key.length - 1);
        document.getElementsByClassName('likeBtn')[i-1].disabled = 'true';
        document.getElementsByClassName('dislikeBtn')[i-1].disabled = 'true';
    })
}

function disableDisLikedPostsBtn() {
    databaseRef.child('users/' + auth.currentUser.uid + '/dislikedPosts').on('child_added', snap => {
        var i = snap.key.charAt(snap.key.length - 1);
        document.getElementsByClassName('dislikeBtn')[i-1].disabled = 'true';
        document.getElementsByClassName('likeBtn')[i-1].disabled = 'true';
    })
}

function displayMemes() {
    var i = 0;
    var k = 1;
    databaseRef.child('memes').orderByChild('timestamp').on('child_added', snap => {
        //get Elements
        var url = snap.val().url;
        var likes = snap.val().likes;
        var dislikes = snap.val().dislikes;
    
        //creation of box starts
        var div1 = document.createElement('div');
        div1.className = 'box';
        var img = document.createElement('img');

        var div2 = document.createElement('button');
        div2.className = 'likeBtn';
        var span1 = document.createElement('span');
        span1.className = 'likeTxt';
        var t = document.createTextNode(likes);
        span1.appendChild(t);
        var icon1 = document.createElement('i');
        icon1.className = 'material-icons like-icon';
        t = document.createTextNode('thumb_up');
        icon1.appendChild(t);

        var div3 = document.createElement('button');
        div3.className = 'dislikeBtn';
        var span2 = document.createElement('span');
        span2.className = 'dislikeTxt';
        t = document.createTextNode(dislikes);
        span2.appendChild(t);
        var icon2 = document.createElement('i');
        icon2.className = 'material-icons dislike-icon';
        t = document.createTextNode('thumb_down');
        icon2.appendChild(t);

        div1.appendChild(img);
        div1.appendChild(div2);
        div1.appendChild(div3);
        div2.appendChild(span1);
        div2.appendChild(icon1);
        div3.appendChild(span2);
        div3.appendChild(icon2);
        document.getElementById('container').appendChild(div1);
        //creation of box ends

        //download memes
        storageRef.child('memes/' + url).getDownloadURL()
            .then(function (url) {
                img.src = url;
            })
            .catch(error => {
                console.log(error);
            });

        //like and dislike events
        likeEvent(snap.val().likes, i, k);
        dislikeEvent(snap.val().dislikes, i, k);
        i++;
        k++;
    })
}

function likeEvent(likes, i, k) {
    var likeBtn = $('.likeBtn')[i];
    var dislikeBtn = $('.dislikeBtn')[i];
    var initialLikes = likes;
    var finalLikes = initialLikes + 1;
    likeBtn.addEventListener('click', () => {
        databaseRef.child('memes/meme' + k).update({
            likes: finalLikes
        });
        likeBtn.innerHTML = "";
        var t = document.createTextNode(finalLikes);
        likeBtn.appendChild(t);
        var icon1 = document.createElement('i');
        icon1.className = 'material-icons';
        t = document.createTextNode('thumb_up');
        icon1.appendChild(t);
        likeBtn.appendChild(icon1);
        //Disable like and dislike button for that post
        likeBtn.disabled = 'true';
        dislikeBtn.disabled = 'true';
        //upload name of the post and time of liking
        var d = new Date();
        var year = d.getFullYear();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = months[d.getMonth()];
        var date = d.getDate();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var day = days[d.getDay()];
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        databaseRef.child('users/' + auth.currentUser.uid + '/likedPosts/meme' + k).update({
            year: year,
            month: month,
            date: date,
            day: day,
            hour: hour,
            minute: minute,
            second: second
        })
    });
}

function dislikeEvent(dislikes, i, k) {
    var dislikeBtn = $('.dislikeBtn')[i];
    var likeBtn = $('.likeBtn')[i];
    var initialDislikes = dislikes;
    var finalDislikes = initialDislikes + 1;
    dislikeBtn.addEventListener('click', () => {
        databaseRef.child('memes/meme' + k).update({
            dislikes: finalDislikes
        });
        dislikeBtn.innerHTML = "";
        var t = document.createTextNode(finalDislikes);
        dislikeBtn.appendChild(t);
        var icon1 = document.createElement('i');
        icon1.className = 'material-icons';
        t = document.createTextNode('thumb_down');
        icon1.appendChild(t);
        dislikeBtn.appendChild(icon1);
        //disable like and dislike button for that post
        dislikeBtn.disabled = 'true';
        likeBtn.disabled = 'true';
        //upload name of the post and time of disliking
        var d = new Date();
        var year = d.getFullYear();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var month = months[d.getMonth()];
        var date = d.getDate();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var day = days[d.getDay()];
        var hour = d.getHours();
        var minute = d.getMinutes();
        var second = d.getSeconds();
        databaseRef.child('users/' + auth.currentUser.uid + '/dislikedPosts/meme' + k).update({
            year: year,
            month: month,
            date: date,
            day: day,
            hour: hour,
            minute: minute,
            second: second
        })
    });
}

//Add login event
const loginBtn = document.getElementById('loginBtn');
loginBtn.addEventListener('click', () => {
    var email = document.getElementById('email').value;
    var psw = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, psw)
    .then(res => {
            window.location.href = 'index.html';
        })
    .catch(error => {
        alert(error);
    })
})
