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
        createProfileBtn();
        createUploadBtn();
        createBookmarkBtn();
        createLogoutBtn();
        displayMemes();
        disableLikedMemesBtn();
        disableDislikedMemesBtn();
        colorBookmarkedMemesBtn();

        //user profile
        var profileBtn = document.getElementById('profileBtn');
        profileBtn.addEventListener('click', () => {
            window.location.href = 'user.html';
        })

        //rise upload Modal
        var upload = document.getElementById('upload');
        upload.addEventListener('click', () => {
          $('#uploadModal').modal('toggle');
        })

        //bookmarked page
        var bookmarkBtn = document.getElementById('bookmarkBtn');
        bookmarkBtn.addEventListener('click', () => {
            window.location.href = 'bookmark.html';
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

        document.getElementById('forgotPswLink').addEventListener('click', () => {
            console.log('hi')
            $('#forgotPswModal').modal('toggle');
            $('#myModal').modal('hide');
            document.getElementById('sendResetEmailBtn').addEventListener('click', () => {
                console.log('clicked');
                sendVerificationEmail();
            })
        })
    }
})

function createLoginBtn() {
    var btn = document.createElement('button');
    btn.id = 'login';
    btn.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect';
    btn.modal = 'toggle';
    var t = document.createTextNode('Login');
    btn.appendChild(t);
    document.getElementById('header').appendChild(btn);
}

function createProfileBtn() {
    var span = document.createElement('span');
    span.className = 'material-icons';
    span.id = 'profileBtn';
    var t = document.createTextNode('account_circle');
    span.appendChild(t);
    document.getElementById('header').appendChild(span);
}

function createUploadBtn() {
    var span = document.createElement('span');
    span.className = 'material-icons';
    span.id = 'upload';
    var t = document.createTextNode('backup');
    span.appendChild(t);
    document.getElementById('header').appendChild(span);
}

function createBookmarkBtn() {
    var span = document.createElement('span');
    span.className = 'material-icons';
    span.id = 'bookmarkBtn';
    var t = document.createTextNode('bookmark');
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

function logout() {
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
      auth.signOut();
      logoutBtn.parentNode.removeChild(logoutBtn);
      var upload = document.getElementById('upload');
      upload.parentNode.removeChild(upload);
      var profileBtn = document.getElementById('profileBtn');
      profileBtn.parentNode.removeChild(profileBtn);
      var bookmarkBtn = document.getElementById('bookmarkBtn');
      bookmarkBtn.parentNode.removeChild(bookmarkBtn);
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

function disableLikedMemesBtn() {
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

function disableDislikedMemesBtn() {
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

function colorBookmarkedMemesBtn() {
    var numOfMemes;
    databaseRef.child('memes/').once('value', snap => {
        numOfMemes = snap.numChildren();
    });
    databaseRef.child('users/' + auth.currentUser.uid + '/bookmarkedMemes').on('child_added', snap => {
        var i = snap.key.split('meme');
        var bookmarkBtn = document.getElementsByClassName('bookmarkBtn')[numOfMemes - i[1]];
        bookmarkBtn.style.backgroundColor = 'black';
        bookmarkBtn.style.color = 'white';
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
        //get number of comments
        var comments;
        databaseRef.child('memes/' + snap.key + '/comments').on('value', snap => {
            comments = snap.numChildren();
        })
    
        //creation of box starts
        var boxDiv = document.createElement('div');
        boxDiv.className = 'box';

        var authorDiv = document.createElement('div');
        authorDiv.className = 'memeAuthor';
        var authorIcon = document.createElement('i');
        authorIcon.className = 'material-icons';
        var t = document.createTextNode('face');
        authorIcon.appendChild(t);
        var authorName = document.createElement('span');
        authorName.className = 'authorName';
        t = document.createTextNode(uploadedBy);
        authorName.appendChild(t);

        var img = document.createElement('img');
        img.className = 'img';

        var memeDetailsDiv = document.createElement('div');
        memeDetailsDiv.className = 'memeDetails';
        t = document.createTextNode(date);
        memeDetailsDiv.appendChild(t);

        var likeBtn = document.createElement('button');
        likeBtn.className = 'likeBtn';
        var likeTxt = document.createElement('span');
        likeTxt.className = 'likeTxt';
        t = document.createTextNode(likes);
        likeTxt.appendChild(t);
        var likeIcon = document.createElement('i');
        likeIcon.className = 'material-icons like-icon';
        t = document.createTextNode('thumb_up');
        likeIcon.appendChild(t);

        var commentBtn = document.createElement('button');
        commentBtn.className = 'commentBtn';
        var commentTxt = document.createElement('span');
        commentTxt.className  = 'commentTxt';
        t = document.createTextNode(comments);
        commentTxt.appendChild(t);
        var commentIcon = document.createElement('i');
        commentIcon.className = 'material-icons';
        t = document.createTextNode('comment');
        commentIcon.appendChild(t);

        var dislikeBtn = document.createElement('button');
        dislikeBtn.className = 'dislikeBtn';
        var dislikeTxt = document.createElement('span');
        dislikeTxt.className = 'dislikeTxt';
        t = document.createTextNode(dislikes);
        dislikeTxt.appendChild(t);
        var dislikeIcon = document.createElement('i');
        dislikeIcon.className = 'material-icons dislike-icon';
        t = document.createTextNode('thumb_down');
        dislikeIcon.appendChild(t);

        var bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmarkBtn';
        var bookmarkIcon = document.createElement('i');
        bookmarkIcon.className = 'material-icons bookmark-icon';
        t = document.createTextNode('bookmark');
        bookmarkIcon.appendChild(t);

        boxDiv.appendChild(authorDiv);
        boxDiv.appendChild(img);
        boxDiv.appendChild(memeDetailsDiv);
        boxDiv.appendChild(likeBtn);
        boxDiv.appendChild(commentBtn);
        boxDiv.appendChild(dislikeBtn);
        boxDiv.appendChild(bookmarkBtn);
        authorDiv.appendChild(authorIcon);
        authorDiv.appendChild(authorName);
        likeBtn.appendChild(likeTxt);
        likeBtn.appendChild(likeIcon);
        commentBtn.appendChild(commentTxt);
        commentBtn.appendChild(commentIcon);
        dislikeBtn.appendChild(dislikeTxt);
        dislikeBtn.appendChild(dislikeIcon);
        bookmarkBtn.appendChild(bookmarkIcon);
        document.getElementById('container').appendChild(boxDiv);
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
        bookmarkEvent(i, numOfMemes);
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
        var likeIcon = document.createElement('i');
        likeIcon.className = 'material-icons';
        t = document.createTextNode('thumb_up');
        likeIcon.appendChild(t);
        likeBtn.appendChild(span);
        likeBtn.appendChild(likeIcon);
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
        var dislikeIcon = document.createElement('i');
        dislikeIcon.className = 'material-icons';
        t = document.createTextNode('thumb_down');
        dislikeIcon.appendChild(t);
        dislikeBtn.appendChild(span);
        dislikeBtn.appendChild(dislikeIcon);
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
    $('.memeAuthor')[i].addEventListener('click', () => {
        databaseRef.child('users/' + auth.currentUser.uid + '/stalking').update({
            username: uploadedBy,
            userId: uploadingUserId
        });
        window.location.href = 'stalk.html';
    })
}

function bookmarkEvent(i, numOfMemes) {
    var name = 'meme' + (numOfMemes-i);
    var bookmarkBtn = document.getElementsByClassName('bookmarkBtn')[i];

    bookmarkBtn.addEventListener('click', () => {
        if(bookmarkBtn.style.backgroundColor == 'black'){
            databaseRef.child('users/' + auth.currentUser.uid + '/bookmarkedMemes/' + name).remove();
            bookmarkBtn.style.backgroundColor = '#dddddd';
            bookmarkBtn.style.color = 'black';
        } else {
            var d = new Date();
            var timestamp = d.getTime();
            databaseRef.child('users/' + auth.currentUser.uid + '/bookmarkedMemes/' + name).update({
                timestamp: timestamp
            })
            bookmarkBtn.style.backgroundColor = 'black';
            bookmarkBtn.style.color = 'white';
        }
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
            span.style.fontWeight = '800';
            t = document.createTextNode(snap.val().commentBy);
            span.appendChild(t);
            t = document.createTextNode(snap.val().comment);
            li.appendChild(t);
            div.appendChild(li);
            div.appendChild(span);
            br = document.createElement('hr');
            br.className = 'breaker';
            document.getElementById('comments').appendChild(div);
            document.getElementById('comments').appendChild(br);
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
document.getElementById('loginBtn').addEventListener('click', () => {
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

document.getElementById('googleSignInBtn').addEventListener('click', () => {
    var base_provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(base_provider)
    .then((result) => {
        window.location.href = 'index.html';
        var name = auth.currentUser.displayName;
        var email = auth.currentUser.email;
        var condition = auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime;//first time user
        if(condition) {
            databaseRef.child('users/' + auth.currentUser.uid).update({
                username: name,
                email: email,
                totalLikesGot: 0
            });
        }
    })
    .catch(error => {
        alert(error.message);
    })
})

function sendVerificationEmail() {
    var email = document.getElementById('resetPswEmail').value;
    if(email !== '') {
        auth.sendPasswordResetEmail(email)
        .then(() => {
            document.getElementById('resetPswEmail').value = '';
            alert('verification email is sent.Please check and verify.');
        })
        .catch(error => {
            alert(error.message);
        })
    } else {
        alert('enter email');
    }
}
