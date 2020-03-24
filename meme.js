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

document.getElementById('loader').style.display = 'block';

auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log('logged in.');
        createLogoutBtn();
        createProfileBtn();
        createUploadBtn();
        displayMemes();
        disableLikedPostsBtn();
        disableDisLikedPostsBtn();

        //rise upload Modal
        var upload = document.getElementById('upload');
        upload.addEventListener('click', () => {
          $('#uploadModal').modal('toggle');
        })

        //user profile
        var profileBtn = document.getElementById('profileBtn');
        profileBtn.addEventListener('click', () => {
            window.location.href = 'user.html';
        })

        //Add logout event
        logout();

        //Upload event
        var uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.addEventListener('click', () => {
          uploadMeme();
        });

        document.getElementById('postComment').addEventListener('click', () => {
            postComment();
        })

        updateTotalLikesGot();
    } else {
        console.log('logged out');
        displayMemes();
        createLoginBtn();
        //rise login modal
        var login = document.getElementById('login');
        login.addEventListener('click', () => {
            $("#myModal").modal('toggle');
        })

        document.getElementById('postComment').addEventListener('click', () => {
          $("#myModal").modal('toggle');
          $('#memeModal').modal('hide');  
        })
    }
})

function createProfileBtn() {
    var span = document.createElement('span');
    span.className = 'material-icons';
    span.id = 'profileBtn';
    var t = document.createTextNode('account_circle');
    span.appendChild(t);
    document.getElementById('header').appendChild(span);
}

function createLogoutBtn() {
    var span = document.createElement('span');
    span.className = 'material-icons'
    span.id = 'logoutBtn';
    var t = document.createTextNode('power_settings_new');
    span.appendChild(t);
    document.getElementById('header').appendChild(span);
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
    var span = document.createElement('span');
    span.className = 'material-icons';
    span.id = 'upload';
    var t = document.createTextNode('backup');
    span.appendChild(t);
    document.getElementById('header').appendChild(span);
}

function logout() {
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
      auth.signOut();
      logoutBtn.parentNode.removeChild(logoutBtn);
      var upload = document.getElementById('upload');
      upload.parentNode.removeChild(upload);
      var profileBtn = document.getElementById('profileBtn');
      profileBtn.parentNode.removeChild(profileBtn);
      window.location.href = 'index.html';
  });
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
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var day = days[d.getDay()];
        var time = d.getHours() + 'hrs ' + d.getMinutes() + 'mins ' + d.getSeconds() + 'secs';
      databaseRef.child('memes/' + url).update({
        url: url + '.png',
        likes: 0,
        dislikes: 0,
        uploadingUserId: userId,
        uploadingUsername: username,
        timestamp: timestamp,
        date: date,
        day: day,
        time: time,
      });
      
      databaseRef.child('users/' + auth.currentUser.uid + '/uploadedMemes' + '/' + url).update({
        url : url,
        timestamp: timestamp
      })
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.log(error);
    })
  })
}

function disableLikedPostsBtn() {
    var numOfMemes;
    databaseRef.child('memes/').once('value', snap => {
        numOfMemes = snap.numChildren();
    })
    databaseRef.child('users/' + auth.currentUser.uid + '/likedPosts').on('child_added', snap => {
        var i = snap.key.split('meme');
        document.getElementsByClassName('likeBtn')[numOfMemes - i[1]].disabled = 'true';
        document.getElementsByClassName('dislikeBtn')[numOfMemes - i[1]].disabled = 'true';
        document.getElementsByClassName('likeBtn')[numOfMemes - i[1]].style.color = 'white';
        document.getElementsByClassName('likeBtn')[numOfMemes - i[1]].style.backgroundColor = 'black';
    })
}

function disableDisLikedPostsBtn() {
    var numOfMemes;
    databaseRef.child('memes/').once('value', snap => {
        numOfMemes = snap.numChildren();
    })
    databaseRef.child('users/' + auth.currentUser.uid + '/dislikedPosts').on('child_added', snap => {
        var i = snap.key.split('meme');
        document.getElementsByClassName('likeBtn')[numOfMemes - i[1]].disabled = 'true';
        document.getElementsByClassName('dislikeBtn')[numOfMemes - i[1]].disabled = 'true';
        document.getElementsByClassName('dislikeBtn')[numOfMemes - i[1]].style.color = 'white';
        document.getElementsByClassName('dislikeBtn')[numOfMemes - i[1]].style.backgroundColor = 'black';
    })
}

function displayMemes() {
    var i = 0;
    databaseRef.child('memes').on('child_added', snap => {
        var uploadedBy = snap.val().uploadingUsername;
        var uploadingUserId = snap.val().uploadingUserId;
        var date = snap.val().date;
        var numOfMemes;
        databaseRef.child('memes/').once('value', snap => {
            numOfMemes = snap.numChildren();
        })
        //get Elements
        var url = snap.val().url;
        var likes = snap.val().likes;
        var dislikes = snap.val().dislikes;
    
        //creation of box starts
        var div1 = document.createElement('div');
        div1.className = 'box';
        var img = document.createElement('img');
        img.className = 'img'

        var div2 = document.createElement('div');
        div2.className = 'memeDetails';
        var t = document.createTextNode('uploaded by ' + uploadedBy + ' on ' + date);
        div2.appendChild(t);

        var div3 = document.createElement('button');
        div3.className = 'likeBtn';
        var span1 = document.createElement('span');
        span1.className = 'likeTxt';
        t = document.createTextNode(likes);
        span1.appendChild(t);
        var icon1 = document.createElement('i');
        icon1.className = 'material-icons like-icon';
        t = document.createTextNode('thumb_up');
        icon1.appendChild(t);

        var commentBtn = document.createElement('button');
        commentBtn.className = 'commentBtn';
        var icon2 = document.createElement('i');
        icon2.className = 'material-icons';
        t = document.createTextNode('comment');
        icon2.appendChild(t);

        var div5 = document.createElement('button');
        div5.className = 'dislikeBtn';
        var span2 = document.createElement('span');
        span2.className = 'dislikeTxt';
        t = document.createTextNode(dislikes);
        span2.appendChild(t);
        var icon3 = document.createElement('i');
        icon3.className = 'material-icons dislike-icon';
        t = document.createTextNode('thumb_down');
        icon3.appendChild(t);

        div1.appendChild(img);
        div1.appendChild(div2);
        div1.appendChild(div3);
        div1.appendChild(commentBtn);
        div1.appendChild(div5);
        div3.appendChild(span1);
        div3.appendChild(icon1);
        commentBtn.appendChild(icon2);
        div5.appendChild(span2);
        div5.appendChild(icon3);
        document.getElementById('container').appendChild(div1);
        //creation of box ends

        //download memes
        storageRef.child('memes/' + url).getDownloadURL()
            .then(function (url) {
                img.src = url;
                document.getElementById('loader').style.display = 'none';
            })
            .catch(error => {
                console.log(error);
            });
        if(auth.currentUser == null){
            document.getElementsByClassName('likeBtn')[i].disabled = 'true';
            document.getElementsByClassName('dislikeBtn')[i].disabled = 'true';
        }
        //like and dislike events
        likeEvent(snap.val().likes, i, numOfMemes);
        dislikeEvent(snap.val().dislikes, i, numOfMemes);
        stalkEvent(i, uploadedBy, uploadingUserId);
        showComments(i, numOfMemes);
        i++;
    })
}

function likeEvent(likes, i, numOfMemes) {
    var likeBtn = $('.likeBtn')[i];
    var dislikeBtn = $('.dislikeBtn')[i];
    var initialLikes = likes;
    var finalLikes = initialLikes + 1;
    likeBtn.addEventListener('click', () => {
        databaseRef.child('memes/meme' + (numOfMemes - i)).update({
            likes: finalLikes, 
        });
        likeBtn.innerHTML = "";
        var span = document.createElement('span');
        span.className = 'likeTxt';
        var t = document.createTextNode(finalLikes);
        span.appendChild(t);
        var icon1 = document.createElement('i');
        icon1.className = 'material-icons';
        t = document.createTextNode('thumb_up');
        icon1.appendChild(t);
        likeBtn.appendChild(span);
        likeBtn.appendChild(icon1);
        //Disable like and dislike button for that post
        likeBtn.disabled = 'true';
        dislikeBtn.disabled = 'true';
        //change color on liking
        likeBtn.style.color = 'white';
        //upload name of the post and time of liking
        var d = new Date();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var day = days[d.getDay()];
        var time = d.getHours() + 'hrs ' + d.getMinutes() + 'mins ' + d.getSeconds() + 'secs';
        databaseRef.child('users/' + auth.currentUser.uid + '/likedPosts/meme' + (numOfMemes - i)).update({
            date: date,
            time: time,
            day: day
        })
    });
}

function dislikeEvent(dislikes, i, numOfMemes) {
    var dislikeBtn = $('.dislikeBtn')[i];
    var likeBtn = $('.likeBtn')[i];
    var initialDislikes = dislikes;
    var finalDislikes = initialDislikes + 1;
    dislikeBtn.addEventListener('click', () => {
        databaseRef.child('memes/meme' + (numOfMemes - i)).update({
            dislikes: finalDislikes
        });
        dislikeBtn.innerHTML = "";
        var span = document.createElement('span');
        span.className = 'dislikeTxt';
        var t = document.createTextNode(finalDislikes);
        span.appendChild(t);
        var icon1 = document.createElement('i');
        icon1.className = 'material-icons';
        t = document.createTextNode('thumb_down');
        icon1.appendChild(t);
        dislikeBtn.appendChild(span);
        dislikeBtn.appendChild(icon1);
        //disable like and dislike button for that post
        dislikeBtn.disabled = 'true';
        likeBtn.disabled = 'true';
        //change color on disliking
        dislikeBtn.style.color = 'white';
        //upload name of the post and time of disliking
        var d = new Date();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var date = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var day = days[d.getDay()];
        var time = d.getHours() + 'hrs ' + d.getMinutes() + 'mins ' + d.getSeconds() + 'secs';
        databaseRef.child('users/' + auth.currentUser.uid + '/dislikedPosts/meme' + (numOfMemes - i)).update({
            date: date,
            time: time,
            day: day
        })
    });
}

function stalkEvent(i, uploadedBy, uploadingUserId) {
    $('.memeDetails')[i].addEventListener('click', () => {
        databaseRef.child('users/' + auth.currentUser.uid + '/stalking').update({
            username: uploadedBy,
            userId: uploadingUserId
        });
        window.location.href = 'stalk.html';
    })
}

function showComments(i, numOfMemes) {
    $('.commentBtn')[i].addEventListener('click', () => {
        $('#memeModal').modal('toggle');
        document.getElementById('comments').innerHTML = '';//make meme modal body emptpy first
        databaseRef.child('memes/meme' + (numOfMemes - i) + '/comments').on('child_added', snap => {
            var div = document.createElement('div');
            div.className = 'commentBox';
            var li = document.createElement('li');
            li.className = 'commentList';
            var span = document.createElement('span');
            t = document.createTextNode(snap.val().commentBy);
            span.appendChild(t);
            t = document.createTextNode(snap.val().comment);
            li.appendChild(t);
            div.appendChild(li);
            div.appendChild(span);
            br = document.createElement('div');
            br.className = 'breaker';
            document.getElementById('comments').appendChild(br);
            document.getElementById('comments').appendChild(div);
        })
        databaseRef.child('users/' + auth.currentUser.uid).update({
            seeingCommentsOfMeme: 'meme'+(numOfMemes-i)
        })
    })
}

function postComment() {
    var username;
    databaseRef.child('users/' + auth.currentUser.uid).once('value', snap => {
        username = snap.val().username;
        var comment = document.getElementById('commentMssg').value;
        databaseRef.child('users/' + auth.currentUser.uid + '/seeingCommentsOfMeme').once('value', snap => {
            var meme = snap.val();
            var d = new Date();
            var timestamp = -d.getTime();
            if(comment !== ''){
                databaseRef.child('memes/' + meme + '/comments/' + timestamp).update({
                    comment: comment,
                    commentBy: username
                })
                document.getElementById('commentMssg').value = '';
            }
        })
    })
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

function updateTotalLikesGot() {
    var sum = 0;
    databaseRef.child('users/' + auth.currentUser.uid + '/uploadedMemes').on('child_added', snap => {
        databaseRef.child('memes/' + snap.key).once('value', snap => {
            sum += snap.val().likes;
            var uploadingUserId = snap.val().uploadingUserId;
            databaseRef.child('users/' + uploadingUserId).update({
                totalLikesGot: -sum
            })
        })
    })
}
