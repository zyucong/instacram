// importing named exports we use brackets
import { createPostTile, checkStore, createElement, createModal, createUserPost } from './helpers.js';

// const api  = new API();
const API_URL = 'http://localhost:5000';

// we can use this single api request multiple times
// const feed = api.getFeed();

const main = document.getElementById('large-feed');
// const user_file = '../data/users.json';
// let token = checkStore('user-token');
let scrollFrom = 0;
let newestPost = 0;
let interval_id;

// First of all check if user token is stored in local storage
if (!checkStore('user-token')) {
    // if no, you haven't logged in, remove the event listener for infinite scroll of course
    document.removeEventListener('scroll', infinite_scroll);
    loggedOut();
} else {
    // if yes, depends on where you are, display different content
    if (!window.location.href.includes('#')){
        // main page, to display the feed
        loggedIn();
    } else {
        // user profile pages, to display their profiles
        user_profile();
    }
}

document.getElementById('logout').addEventListener('click', () => {
    // what to do when user click log out button, clear local storage,
    // remove scroll event listener, as well as reset the url
    document.removeEventListener('scroll', infinite_scroll);
    localStorage.removeItem('user-token');
    localStorage.removeItem('username');
    window.location.href = window.location.href.split('#')[0];
    loggedOut();
});
// function to be executed when user is not logged in
function loggedOut() {
    // hide the navigation bar
    document.getElementById('nav').style.display = 'none';
    // reset the infinite scroll counter
    scrollFrom = 0;
    // clear push notification
    clearInterval(interval_id);
    // clear all posts under feed
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
    // append the log in/register form
    let container = createElement('div', null, {
        'id': 'sign-form',
        'class': 'container'
    });
    let switch_btn = createElement('div', null, {
        'class': 'button-group'
    });
    let login_btn = createElement('button', 'Sign in', {
        'class': 'col-sm-5 btn btn-lg btn-light active',
        'type': 'button',
        'tabindex': '-1'
    });
    let register_btn = createElement('button', 'Register', {
        'class': 'col-sm-5 btn btn-lg btn-light',
        'type': 'button',
        'tabindex': '-1'
    });
    switch_btn.appendChild(login_btn);
    switch_btn.appendChild(register_btn);
    container.appendChild(switch_btn);
    let sign_in = createElement('form', null, {
        'class': 'form-signin'
    });
    sign_in.appendChild(createElement('h2', 'Please sign in', {
        'class': 'form-signin-heading'
    }));
    sign_in.appendChild(createElement('input', null, {
        'type': 'text',
        'id': 'username',
        'class': 'form-control',
        'placeholder': 'Username'

    }));
    sign_in.appendChild(createElement('input', null, {
        'type': 'password',
        'id': 'password',
        'class': 'form-control',
        'placeholder': 'Password'

    }));
    let login_submit = createElement('button', 'Sign in', {
        'class': 'btn btn-lg btn-primary btn-block',
        'id': 'signin-btn',
        'type': 'button',
        'tabindex': '-1'
    });
    sign_in.appendChild(login_submit);
    container.appendChild(sign_in);
    let register = createElement('form', null, {
        'class' : 'form-signin',
    });
    register.style.display = 'none';
    register.appendChild(createElement('h2', 'Please register', {
        'class': 'form-signin-heading'
    }));
    register.appendChild(createElement('input', null, {
        'type': 'text',
        'id': 'reg-username',
        'class': 'form-control',
        'placeholder': 'Username',
    }));
    register.appendChild(createElement('input', null, {
        'type': 'text',
        'id': 'email',
        'class': 'form-control',
        'placeholder': 'Email Address',
    }));
    register.appendChild(createElement('input', null, {
        'type': 'text',
        'id': 'name',
        'class': 'form-control',
        'placeholder': 'Name',
    }));
    register.appendChild(createElement('input', null, {
        'type': 'password',
        'id': 'reg-password',
        'class': 'form-control',
        'placeholder': 'Password'
    }));
    register.appendChild(createElement('input', null, {
        'type': 'password',
        'id': 'repeated-password',
        'class': 'form-control',
        'placeholder': 'Repeated Password'
    }));
    let reg_submit = createElement('button', 'Register', {
        'class': 'btn btn-lg btn-primary btn-block',
        'id': 'reg-btn',
        'type': 'button',
        'tabindex': '-1'
    });
    register.appendChild(reg_submit);
    container.appendChild(register);
    // add error/success message as feedback
    container.appendChild(createElement('div', null, {'class': 'alert alert-danger form-alert', 'id': 'error', 'style': 'display: none;'}));
    container.appendChild(createElement('div', null, {'class': 'alert alert-success form-alert', 'id': 'success', 'style': 'display: none;'}));
    main.appendChild(container);
    // add event listener to buttons to switch login and register form
    login_btn.addEventListener('click', () => {
        register_btn.classList.remove('active');
        login_btn.classList.add('active');
        sign_in.style.display = 'block';
        register.style.display = 'none';
    });
    register_btn.addEventListener('click', () => {
        login_btn.classList.remove('active');
        register_btn.classList.add('active');
        register.style.display = 'block';
        sign_in.style.display = 'none';
    });
    // event listener for login button
    login_submit.addEventListener('click', () => {
        fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': document.getElementById('username').value,
                'password': document.getElementById('password').value
            })
        }).then(res => res.json())
            .then(data => {
                // to determine if login is success
                if (data.token) {
                    // if login success, hide the login form, set local storage to store token and username
                    container.style.display = 'none';
                    localStorage.setItem('user-token', data.token);
                    let username = document.getElementById('username').value;
                    localStorage.setItem('username', username);
                    // call the function to display feed
                    loggedIn();
                } else if (data.message) {
                    // if login fail, display error message according to the response
                    document.getElementById('success').style.display = 'none';
                    let error = document.getElementById('error');
                    error.textContent = data.message;
                    error.style.display = 'block';
                }
            })
    });
    // event listener for register button
    reg_submit.addEventListener('click', () => {
        let error = document.getElementById('error');
        // if the twice input password doesn't match, abort
        if (document.getElementById('reg-password').value !== document.getElementById('repeated-password').value) {
            document.getElementById('success').style.display = 'none';
            error.textContent = 'Password Not Matched';
            error.style.display = 'block';
            return;
        }
        // request the signup api
        fetch(API_URL + '/auth/signup', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById('reg-username').value,
                password: document.getElementById('reg-password').value,
                email: document.getElementById('email').value,
                name: document.getElementById('name').value
            })
        }).then(res => res.json())
            .then(data => {
                // to determine if registration is success
                if (data.token) {
                    // if sign up success, switch to login form
                    login_btn.click();
                    // display success message
                    error.style.display = 'none';
                    let success = document.getElementById('success');
                    success.textContent = 'Registration Success!';
                    success.style.display = 'block';
                    // error.textContent = 'Registration Successful! Please Sign In';
                } else if (data.message) {
                    // if sign up fail, display error message
                    let error = document.getElementById('error');
                    document.getElementById('success').style.display = 'none';
                    error.textContent = data.message;
                    error.style.display = 'block';
                }
            })
    })
}

// function to be executed when user is logged in and display the feed
function loggedIn() {
    // display the navigation bar (user buttons)
    document.getElementById('nav').style.display = 'block';
    // remove all previous added contents
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }
    // create 2 modals to display the users who have liked a post and commented a post respectively
    main.appendChild(createModal('like-list'));
    main.appendChild(createModal('comment-list'));
    // document.getElementById('scroll-loading').style.display = 'block';
    // get the first feed that the user would see
    get_feed(scrollFrom).then(() => {
        // add scroll event listener to implement infite scroll
        // document.getElementById('scroll-loading').style.display = 'none';
        document.addEventListener('scroll', infinite_scroll);
    });
    // call this function every 5s to check new post from following user
    interval_id = setInterval(notification, 5000);
}

// used to request the feed to check new post
async function notification () {
    let token = checkStore('user-token');
    if (!token) {
        return;
    }
    fetch(API_URL + '/user/feed', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        }
    }).then(res => res.json()).then(data => {
        // display notification everytime the latest post id from api is different to the latest one on web page
        if (data.posts.length !== 0 && data.posts[0].id > newestPost){
            newestPost = data.posts[0].id;
            let notification = document.getElementById('notification');
            notification.style.display = 'block';
            notification.textContent = `${data.posts[0].meta.author} just uploaded a new post. Check it out!`;
        }
    })
}

// infinite scroll feature would also call this function to get feed
async function get_feed(from) {
    let token = checkStore('user-token');
    let username = localStorage.getItem('username');
    let user_id;
    // to store all the posts retrieve from one request, ignore previous added post to avoid duplicated handling
    let posts = [];
    fetch(API_URL + `/user/feed?p=${from}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        }
    }).then(res => res.json()).then(data => {
        if (data.posts.length !== 0 && newestPost < data.posts[0].id) {
            newestPost = data.posts[0].id;
        }
        // update the start point of scroll for next scroll
        scrollFrom += data.posts.length;
        // by default, the sequence of feed in response is most recent first
        data.posts.reduce((parent, post) => {
            posts.push(post.id);
            parent.appendChild(createPostTile(post));
            return parent;
        }, document.getElementById('large-feed'));
        // to retrieve log in user id, compare if user has liked a particular post
        return fetch(API_URL + `/user?username=${username}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            }
        });
    })
        .then(res => res.json()).then(data => {
        user_id = data.id;
        // retrieve the user id who has like each post
        let likes = posts.map(post => fetch(API_URL + `/post?id=${post}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
            }
        }).then(res => res.json()));
        return Promise.all(likes);
    })
        .then(data => {
            data.forEach(post => {
                // change the layout for all the like button, so like button in a already liked post would appear clicked
                let like_btns = document.getElementsByClassName('like-btn');
                if (post.meta.likes.includes(user_id)) {
                    for (let btn of like_btns) {
                        if (btn.getAttribute('post-id') === post.id.toString()) {
                            btn.classList.remove('btn-outline-secondary');
                            btn.classList.add('btn-secondary');
                        }
                    }
                }
            })
        })
        .then(() => {
            // add event listeners to display like list and comment list
            const likes = document.getElementsByClassName('post-like');
            for (let like of likes) {
                // set the layout of modal
                let post_id = like.getAttribute('post-id');
                if (!posts.includes(parseInt(post_id))) {
                    continue;
                }
                like.addEventListener('click', () => {
                    let like_body = document.getElementById('like-list-body');
                    while (like_body.lastChild) {
                        if (like_body.lastChild.nodeName === 'svg'){
                            break;
                        }
                        like_body.removeChild(like_body.lastChild);
                    }
                    // display a loading animation for this lengthy process (2 requests in a row)
                    document.getElementById('like-list-loading').style.display = 'block';
                    document.getElementById('like-list-title').innerText = 'Who has liked this post';
                    let id = like.getAttribute('post-id');
                    // request for user id who has liked each post
                    fetch(API_URL + `/post?id=${id}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + token,
                        }
                    }).then(res => res.json()).then(data => {
                        // request for username according to the id requested above
                        let users = data.meta.likes.map(user => fetch(API_URL + `/user?id=${user}`, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token,
                            }
                        }).then(res => res.json()));
                        Promise.all(users).then(data => {
                            // call reverse(), so that the latest like would appear at the top
                            data.reverse().forEach(user => {
                                like_body.appendChild(createElement('p', user.username, {}));
                            });
                            // stop the loading animation
                            document.getElementById('like-list-loading').style.display = 'none';
                        })
                    })
                })
            }
            const comments = document.getElementsByClassName('post-comment');
            for (let comment of comments) {
                // set the layout of modal to display comment list
                let post_id = comment.getAttribute('post-id');
                if (!posts.includes(parseInt(post_id))) {
                    continue;
                }
                comment.addEventListener('click', () => {
                    let comment_body = document.getElementById('comment-list-body');
                    while (comment_body.lastChild) {
                        if (comment_body.lastChild.nodeName === 'svg'){
                            break;
                        }
                        comment_body.removeChild(comment_body.lastChild);
                    }
                    // display a loading animation as well
                    document.getElementById('comment-list-loading').style.display = 'block';
                    document.getElementById('comment-list-title').innerText = 'Who has commented on this post';
                    let id = comment.getAttribute('post-id');
                    fetch(API_URL + `/post?id=${id}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + token,
                        }
                    }).then(res => res.json()).then(data => {
                        data.comments.reverse().forEach(comment => {
                            const block = document.createElement('div');
                            const detail = createElement('p', null, {'class': 'comment-detail'});
                            const author = createElement('b', `${comment.author}: ` ,{});
                            const content = createElement('span', comment.comment, {});
                            detail.appendChild(author);
                            detail.appendChild(content);
                            block.appendChild(detail);
                            // convert and display the time properly
                            const time = new Date(parseFloat(comment.published) * 1000);
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                            ];
                            const comment_time = createElement('p', `${time.getDate()} ${monthNames[time.getMonth()]} at ${time.getHours()}:${time.getMinutes()}`, {'class':'comment-time'});
                            block.appendChild(comment_time);
                            comment_body.appendChild(block);
                        });
                        document.getElementById('comment-list-loading').style.display = 'none';
                    })
                })
            }
            // add event listeners for like buttons and comment buttons
            const like_btns = document.getElementsByClassName('like-btn');
            for (let btn of like_btns){
                let post_id = btn.getAttribute('post-id');
                if (!posts.includes(parseInt(post_id))) {
                    continue;
                }
                btn.addEventListener('click', () => {
                    // depends how to like button looks like, fire like or unlike request
                    // note that the class list would be updated according to the like status even if you refresh it
                    if (btn.classList.contains('btn-outline-secondary')) {
                        btn.classList.remove('btn-outline-secondary');
                        btn.classList.add('btn-secondary');
                        fetch(API_URL + `/post/like?id=${btn.getAttribute('post-id')}`, {
                            method: 'put',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token
                            }
                        }).then(() => {
                            // update the like count as soon as the response is received
                            let like = btn.parentNode.parentNode.previousSibling.firstChild;
                            let current_like = parseInt(like.getAttribute('current-like'));
                            like.setAttribute('current-like', `${current_like + 1}`);
                            like.textContent = `${current_like + 1} like(s)`;
                        })
                    } else {
                        btn.classList.remove('btn-secondary');
                        btn.classList.add('btn-outline-secondary');
                        fetch(API_URL + `/post/unlike?id=${btn.getAttribute('post-id')}`, {
                            method: 'put',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token
                            }
                        }).then(() => {
                            // update the like count as soon as the response is received
                            let like = btn.parentNode.parentNode.previousSibling.firstChild;
                            let current_like = parseInt(like.getAttribute('current-like'));
                            like.setAttribute('current-like', `${current_like - 1}`);
                            like.textContent = `${current_like - 1} like(s)`;
                        })
                    }
                });
            }
            const comment_fields = document.getElementsByClassName('comment-field');
            for (let comment_field of comment_fields){
                let post_id = comment_field.getAttribute('post-id');
                if (!posts.includes(parseInt(post_id))) {
                    continue;
                }
                // use enter button to submit comment
                comment_field.addEventListener('keydown', (e) => {
                    if (e.keyCode === 13) {
                        let comment_tsm = comment_field.value;
                        comment_field.value = '';
                        document.getElementById(`prompt-${post_id}`).style.display = 'block';
                        comment_field.style.display = 'none';
                        let comment = comment_field.parentNode.parentNode.previousSibling.childNodes[2];
                        let current_comment = parseInt(comment.getAttribute('current-comment'));
                        comment.setAttribute('current-comment', `${current_comment + 1}`);
                        // update the comment count for your comment
                        comment.textContent = `${current_comment + 1} comment(s)`;
                        fetch(API_URL + `/post/comment?id=${post_id}`, {
                            method: 'put',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token
                            },
                            body: JSON.stringify({
                                'author': username,
                                'published': Date.now() / 1000,
                                'comment': comment_tsm
                            })
                        }).then(() => {
                            // display success message for a while
                            setTimeout(() => {
                                document.getElementById(`prompt-${post_id}`).style.display = 'none';
                                comment_field.style.display = 'block';
                            }, 3000);
                        });
                    }
                })
            }
        })
}

// implement infinite scroll feature
function infinite_scroll() {
    // ignore situations that user doesn't log in or in user profile page
    if (!checkStore('user-token')) {
        return;
    }
    if (window.location.href.includes('#')){
        return;
    }
    const body = document.body;
    // detect the height to determine whether to call get feed to load more posts
    if(body.clientHeight + Math.floor(document.documentElement.scrollTop) === body.scrollHeight) {
        get_feed(scrollFrom);
    }
}

// display user profile information
function user_profile() {
    let token = checkStore('user-token');
    // not logged in user not allowed
    if (!token) {
        return;
    }
    let url = window.location.href;
    if (url.includes('#')) {
        // clear push notification
        clearInterval(interval_id);
        // clear previous content in this page
        const feed = document.getElementById('large-feed');
        while (feed.firstChild) {
            feed.removeChild(feed.firstChild);
        }
        const profile = document.getElementById('user-profile');
        while (profile.firstChild) {
            profile.removeChild(profile.firstChild);
        }
        // retrieve the username that would be visited from the url
        const user = url.split('#')[1].split('=')[1];
        // reset the counter to request the post
        scrollFrom = 0;
        let posts = [];
        fetch(API_URL + `/user?username=${user}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            }
        }).then(res => res.json()).then(data => {
            let container = createElement('div', null, {'class': 'container'});
            // record all the posts made by the exact user
            posts = data.posts;
            // use innerHTML in such a large scale mainly because the nested level is quite deep
            // very inefficient to use createElement(), the reason of a deep nested level is
            // to achieve the layout of center in the middle but the head line up in the left
            container.innerHTML =
                    `<div class="row justify-content-center">
                        <div class="col-3 description"><b>Username: </b>${data.username}</div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-3 description"><b>Number of posts: </b>${data.posts.length}</div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-3 description"><b>Name: </b>${data.name}</div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-3 description"><b>Email: </b>${data.email}</div>
                    </div>
                    <div class="row justify-content-center">
                        <div class="col-3 description"><a id="following" data-toggle="modal" data-target="#profile-modal"><b>Following: </b>${data.following.length}</a></div>
                    </div>
                    <div class="row justify-content-center">
                        <div id="followed" followed="${data.followed_num}" class="col-3 description"><b>Followed: </b>${data.followed_num}</div>
                    </div>`;
            document.getElementById('user-profile').appendChild(container);
            // display a list of following user when following is clicked
            document.getElementById('following').addEventListener('click', () => {
                document.getElementById('profile-modal-title').textContent = 'Following List';
                const modal_body = document.getElementById('profile-modal-body');
                while (modal_body.lastChild) {
                    if (modal_body.lastChild.nodeName === 'svg') {
                        break;
                    }
                    modal_body.removeChild(modal_body.lastChild)
                }
                document.getElementById('profile-modal-loading').style.display = 'block';
                let following_names = data.following.reverse().map(id => fetch(API_URL + `/user?id=${id}`, {
                    methods: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Token ' + token
                    }
                }).then(res => res.json()));
                Promise.all(following_names).then(users => {
                    document.getElementById('profile-modal-loading').style.display = 'none';
                    users.forEach(user => {
                        modal_body.appendChild(createElement('p', user.username, {}));
                    })
                })
            });
            return myFollowing(data.id, data.username);
        }).then(([isFollowing, username]) => {
            // display follow or unfollow button according to the follow status
            const me = checkStore('username');
            // would not display follow/unfollow button when viewing the profile of logged in user
            // you can't follow yourself
            if (username !== me ){
                let row = createElement('div', null, {'class': 'row justify-content-center follow-row'});
                let btn;
                if (isFollowing){
                    btn = createElement('button', 'Unfollow', {
                        'type': 'button',
                        'class': 'btn btn-danger col-2',
                    });
                } else {
                    btn = createElement('button', 'Follow', {
                        'type': 'button',
                        'class': 'btn btn-primary col-2'
                    });
                }
                // send follow or unfollow request according to the class list of the button
                btn.addEventListener('click', () => {
                    if(btn.classList.contains('btn-danger')){
                        btn.classList.remove('btn-danger');
                        btn.classList.add('btn-primary');
                        btn.textContent = 'Follow';
                        fetch(API_URL + `/user/unfollow?username=${username}`, {
                            method: 'PUT',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token
                            }
                        }).then(() => {
                            // update the following number accordingly
                            let followed = document.getElementById('followed').getAttribute('followed');
                            followed = parseInt(followed);
                            document.getElementById('followed').setAttribute('followed', followed - 1);
                            document.getElementById('followed').innerHTML = `<b>Followed: </b>${followed - 1}`;
                        })
                    } else {
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-danger');
                        btn.textContent = 'Unfollow';
                        fetch(API_URL + `/user/follow?username=${username}`, {
                            method: 'PUT',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token
                            }
                        }).then(() => {
                            // update the following number accordingly
                            let followed = document.getElementById('followed').getAttribute('followed');
                            followed = parseInt(followed);
                            document.getElementById('followed').setAttribute('followed', followed + 1);
                            document.getElementById('followed').innerHTML = `<b>Followed: </b>${followed + 1}`;
                        });
                    }
                });
                row.appendChild(btn);
                document.getElementById('user-profile').appendChild(row);
            }
            // send request to all posts made by this user
            let display_posts = posts.reverse().map(post => fetch(API_URL + `/post?id=${post}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token,
                }
            }).then(res => res.json()));
            return Promise.all(display_posts);
        }).then((data) => {
            const username = checkStore('username');
            let currentuser;
            data.forEach(post => {
                // the layout is slightly different with the posts in feed
                currentuser = post.meta.author;
                document.getElementById('user-profile').appendChild(createUserPost(post));
            });
            // only display the delete/update button in the profile of logged user
            // you shouldn't have permission to delete and update other's post, or being shown such an option
            if( username === currentuser) {
                let containers = document.getElementsByClassName('post-container');
                for (let container of containers) {
                    let del_btn = container.lastChild;
                    // display this button when hover
                    container.addEventListener('mouseover', () => {
                        del_btn.style.display = 'block';
                    });
                    container.addEventListener('mouseout', () => {
                        del_btn.style.display = 'none';
                    });
                    del_btn.addEventListener('click', () => {
                        let post_id = del_btn.getAttribute('del-id');
                        // hide the post being deleted
                        document.getElementById(`post-${post_id}`).style.display = 'none';
                        fetch(API_URL + `/post?id=${post_id}`, {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization': 'Token ' + token,
                            }
                        })
                    });
                }
                for (let body of document.getElementsByClassName('post-body')) {
                    let update_btn = body.lastChild;
                    let post_id = update_btn.getAttribute('update-id');
                    update_btn.style.display = 'block';
                    update_btn.addEventListener('click', () => {
                        document.getElementById('nested-title').textContent = '';
                        let modal_body = document.getElementById('nested-body');
                        let modal_footer = document.getElementById('nested-footer');
                        while (modal_body.lastChild) {
                            if (modal_body.lastChild.nodeName === 'svg') {
                                break;
                            }
                            modal_body.removeChild(modal_body.lastChild)
                        }
                        while (modal_footer.firstChild) {
                            modal_footer.removeChild(modal_footer.firstChild);
                        }
                        // just like the modal used to upload new post, but the logic is slightly different
                        modal_body.appendChild(createElement('input', null, {'type': 'file', 'id': 'update-img'}));
                        modal_body.appendChild(createElement('input', null, {'class': 'form-control', 'placeholder': 'New caption...', 'id': 'update-caption'}));
                        modal_footer.appendChild(createElement('button', 'Submit', {'id': 'update-post', 'class': 'btn btn-primary', 'data-dismiss': 'modal'}));
                        document.getElementById('update-post').addEventListener('click', () => {
                            let file = document.getElementById('update-img').files[0];
                            let src;
                            const caption = document.getElementById('update-caption').value;
                            let payload = {};
                            if (!file && !caption) {
                                return;
                            }
                            if (file && file.type !== 'image/png') {
                                return;
                            }
                            // provide either caption or image file is enough
                            if (caption) {
                                payload.description_text = caption;
                            }
                            // if image file is not provided, payload only contains caption
                            if (!file) {
                                fetch(API_URL + `/post?id=${post_id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Token ' + token,
                                    },
                                    body: JSON.stringify(payload)
                                }).then(() => {
                                    // update the caption on web page accordingly
                                    document.getElementById(`caption-${post_id}`).textContent = caption;
                                });
                            }
                            // if image file is provided, payload for sure contains image src, can as well contains caption
                            // able to send request to update as long as either of above is not null
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    let dataURL = e.target.result;
                                    src = dataURL.split(',')[1];
                                    payload.src = src;
                                    fetch(API_URL + `/post?id=${post_id}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json',
                                            'Authorization': 'Token ' + token,
                                        },
                                        body: JSON.stringify(payload)
                                    }).then(() => {
                                        // update the image file accordingly
                                        let image = document.getElementById(`image-${post_id}`);
                                        let origin_src = image.getAttribute('src');
                                        image.setAttribute('src', origin_src.split(',')[0] + ',' + src);
                                        // if caption is updated as well, update as well
                                        if (caption) {
                                            document.getElementById(`caption-${post_id}`).textContent = caption;
                                        }
                                    });
                                };
                                reader.readAsDataURL(file);
                            }
                        });
                    })
                }
            }
        });

    }
}

// obtain the following list of logged in user so that to decide if to display follow or unfollow button
async function myFollowing(id, target) {
    let username = checkStore('username');
    let token = checkStore('user-token');
    let data = await fetch(API_URL + `/user?username=${username}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        }
    }).then(res => res.json());
    let followingList = data.following;
    return [followingList.includes(id), target];
}

// initialize the notification alert
document.getElementById('notification').style.display = 'none';
document.getElementById('notification').addEventListener('click', () => {
    window.location.reload();
});

// some modals and event listeners that would be loaded no matter in what states
// modal used to upload new content, targeted by post button
document.getElementById('main').appendChild(createModal('new-post'));
document.getElementById('new-post-title').textContent = 'Gallery';
const new_post_body = document.getElementById('new-post-body');
new_post_body.appendChild(createElement('input', null, {'type': 'file', 'id': 'upload'}));
new_post_body.appendChild(createElement('input', null, {'class': 'form-control', 'id': 'caption', 'placeholder': 'Write a caption...'}));
const new_post_footer = document.getElementById('new-post-footer');
new_post_footer.appendChild(createElement('button', 'Submit', {'class': 'btn btn-primary', 'id': 'submitPost', 'data-dismiss': 'modal'}));
// event listener to submit a new post
document.getElementById('submitPost').addEventListener('click', () => {
    let token = checkStore('user-token');
    let file = document.getElementById('upload').files[0];
    let caption = document.getElementById('caption').value;
    // eliminate all illegal posts, both image and caption can't be undefined
    if (!file || !caption || file.type !== 'image/png'){
        let post_btn = document.getElementById('post-content');
        let alert = document.getElementById('upload-fail');
        alert.textContent = 'File cannot be empty; File must be PNG format; Caption cannot be null';
        post_btn.style.display = 'none';
        alert.style.display = 'inline';
        setTimeout(() => {
            post_btn.style.display = 'inline';
            alert.style.display = 'none';
        }, 3000);
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        // do something with the data result
        const dataURL = e.target.result;
        const src = dataURL.split(',')[1];
        fetch(API_URL + '/post', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
            },
            body: JSON.stringify({
                'description_text': caption,
                'src': src
            })
        }).then(res => {
            if (res.status === 200) {
                let post_btn = document.getElementById('post-content');
                let alert = document.getElementById('upload-success');
                post_btn.style.display = 'none';
                alert.style.display = 'inline';
                setTimeout(() => {
                    post_btn.style.display = 'inline';
                    alert.style.display = 'none';
                }, 3000);
            } else {
                let post_btn = document.getElementById('post-content');
                let alert = document.getElementById('upload-fail');
                alert.textContent = 'Upload Fail!';
                post_btn.style.display = 'none';
                alert.style.display = 'inline';
                setTimeout(() => {
                    post_btn.style.display = 'inline';
                    alert.style.display = 'none';
                }, 3000);
            }
        })
    };
    // this returns a base64 image
    reader.readAsDataURL(file);
});

// modals to display logged in user profile only, the nested modal is to update user information
document.getElementById('main').appendChild(createModal('profile-modal'));
document.getElementById('main').appendChild(createModal('nested'));
// profile button on the top right corner
document.getElementById('profile').addEventListener('click', () => {
    if (!checkStore('user-token')) {
        return;
    }
    let token = checkStore('user-token');
    let modal_body = document.getElementById('profile-modal-body');
    document.getElementById('profile-modal-title').textContent = '';
    while (modal_body.lastChild) {
        if (modal_body.lastChild.nodeName === 'svg') {
            break;
        }
        modal_body.removeChild(modal_body.lastChild)
    }
    document.getElementById('profile-modal-loading').style.display = 'block';
    fetch(API_URL + '/user', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token
        }
    }).then(res => res.json()).then(data => {
        // to display username, name, email information, and the update button of name, email and password is available
        document.getElementById('profile-modal-loading').style.display = 'none';
        document.getElementById('profile-modal-title').textContent = data.username;
        let user = createElement('p', null, {});
        user.appendChild(createElement('b', 'Username: ', {}));
        user.appendChild(createElement('span', `${data.username} `, {}));
        modal_body.appendChild(user);
        let name = createElement('p', null, {});
        name.appendChild(createElement('b', 'Name: ', {}));
        name.appendChild(createElement('span', `${data.name} `, {'id': 'your-name'}));
        let edit_name = createElement('a', null, {'data-toggle': 'modal', 'href': '#nested', 'id': 'update-name'});
        edit_name.appendChild(createElement('i', 'edit', {'class': 'material-icons icons'}));
        name.appendChild(edit_name);
        name.appendChild(createElement('span', 'update name success!', {'class': 'alert alert-success', 'style': 'display: none;', 'id': 'update-name-success'}));
        name.appendChild(createElement('span', 'update name fail!', {'class': 'alert alert-danger', 'style': 'display: none;', 'id': 'update-name-fail'}));
        modal_body.appendChild(name);
        let email = createElement('p', null, {});
        email.appendChild(createElement('b', 'Email: ', {}));
        email.appendChild(createElement('span', `${data.email} `, {'id': 'your-email'}));
        let edit_email = createElement('a', null, {'data-toggle': 'modal', 'href': '#nested', 'id': 'update-email'});
        edit_email.appendChild(createElement('i', 'edit', {'class': 'material-icons icons'}));
        email.appendChild(edit_email);
        email.appendChild(createElement('span', 'update email success!', {'class': 'alert alert-success', 'style': 'display: none;', 'id': 'update-email-success'}));
        email.appendChild(createElement('span', 'update email fail!', {'class': 'alert alert-danger', 'style': 'display: none;', 'id': 'update-email-fail'}));
        modal_body.appendChild(email);
        let password = createElement('p', null, {});
        password.appendChild(createElement('button', 'Change Password', {'id': 'update-password', 'class': 'btn btn-primary', 'data-toggle': 'modal', 'href': '#nested'}));
        password.appendChild(createElement('span', 'update password success!', {'class': 'alert alert-success', 'style': 'display: none;', 'id': 'update-password-success'}));
        password.appendChild(createElement('span', 'update password fail!', {'class': 'alert alert-danger', 'style': 'display: none;', 'id': 'update-password-fail'}));
        modal_body.appendChild(password);
        // add a link to redirect to the detailed profile page, for logged in user
        const your_profile = createElement('p', null, {});
        const your_profile_link = createElement('a', 'Your Detailed Profile', {'class': 'profile-link', 'data-dismiss': 'modal'});
        your_profile_link.addEventListener('click', () => {
            window.location.href = window.location.href.split('#')[0] + `#user=${data.username}`;
        });
        your_profile.appendChild(your_profile_link);
        modal_body.appendChild(your_profile);
        // click on these 3 buttons would result on the appearance of nested modal to update user profile
        document.getElementById('update-name').addEventListener('click', () => {
            document.getElementById('nested-title').textContent = 'Update Name';
            let nested_body = document.getElementById('nested-body');
            let nested_footer = document.getElementById('nested-footer');
            while (nested_body.lastChild) {
                if (nested_body.lastChild.nodeName === 'svg') {
                    break;
                }
                nested_body.removeChild(nested_body.lastChild)
            }
            while (nested_footer.firstChild) {
                nested_footer.removeChild(nested_footer.firstChild);
            }
            let original_name = createElement('p', null, {});
            original_name.appendChild(createElement('b', 'Origin name: ', {}));
            original_name.appendChild(createElement('span', data.name, {}));
            nested_body.appendChild(original_name);
            let new_name = createElement('p', null, {});
            new_name.appendChild(createElement('input', null, {'class': 'form-control', 'placeholder': 'Your New Name...', 'id': 'newName'}));
            nested_body.appendChild(new_name);
            nested_footer.appendChild(createElement('button', 'Submit', {'class': 'btn btn-primary', 'id': 'submitNewName', 'data-dismiss': 'modal'}));
            document.getElementById('submitNewName').addEventListener('click', () => {
                if (document.getElementById('newName').value === '') {
                    document.getElementById('update-name-fail').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('update-name-fail').style.display = 'none';
                    }, 3000)
                } else {
                    document.getElementById('update-name-success').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('update-name-success').style.display = 'none';
                    }, 3000);
                    fetch(API_URL + '/user', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + token
                        },
                        body: JSON.stringify({
                            'name': document.getElementById('newName').value
                        })
                    }).then(() => {
                        document.getElementById('your-name').textContent = document.getElementById('newName').value;
                    })
                }
            });
        });
        document.getElementById('update-email').addEventListener('click', () => {
            document.getElementById('nested-title').textContent = 'Update Email';
            let nested_body = document.getElementById('nested-body');
            let nested_footer = document.getElementById('nested-footer');
            while (nested_body.lastChild) {
                if (nested_body.lastChild.nodeName === 'svg') {
                    break;
                }
                nested_body.removeChild(nested_body.lastChild)
            }
            while (nested_footer.firstChild) {
                nested_footer.removeChild(nested_footer.firstChild);
            }
            let original_email = createElement('p', null, {});
            original_email.appendChild(createElement('b', 'Origin email: ', {}));
            original_email.appendChild(createElement('span', data.email, {}));
            nested_body.appendChild(original_email);
            let new_email = createElement('p', null, {});
            new_email.appendChild(createElement('input', null, { 'class': 'form-control', 'placeholder': 'Your New Email...', 'id': 'newEmail'}));
            nested_body.appendChild(new_email);
            nested_footer.appendChild(createElement('button', 'Submit', {'class': 'btn btn-primary', 'id': 'submitNewEmail', 'data-dismiss': 'modal'}));
            document.getElementById('submitNewEmail').addEventListener('click', () => {
                if (document.getElementById('newEmail').value === '') {
                    document.getElementById('update-email-fail').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('update-email-fail').style.display = 'none';
                    }, 3000)
                } else {
                    document.getElementById('update-email-success').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('update-email-success').style.display = 'none';
                    }, 3000);
                    fetch(API_URL + '/user', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + token
                        },
                        body: JSON.stringify({
                            'email': document.getElementById('newEmail').value
                        })
                    }).then(() => {
                        document.getElementById('your-email').textContent = document.getElementById('newEmail').value;
                    })
                }
            });
        });
        document.getElementById('update-password').addEventListener('click', () => {
            document.getElementById('nested-title').textContent = 'Update Password';
            let nested_body = document.getElementById('nested-body');
            let nested_footer = document.getElementById('nested-footer');
            while (nested_body.lastChild) {
                if (nested_body.lastChild.nodeName === 'svg') {
                    break;
                }
                nested_body.removeChild(nested_body.lastChild)
            }
            while (nested_footer.firstChild) {
                nested_footer.removeChild(nested_footer.firstChild);
            }
            const new_password = createElement('p', null, {});
            new_password.appendChild(createElement('input', null, {'type': 'password', 'class': 'form-control', 'id': 'new-password', 'placeholder': 'Your new password'}));
            nested_body.appendChild(new_password);
            const new_password_repeated = createElement('p', null, {});
            new_password_repeated.appendChild(createElement('input', null, {'type': 'password', 'class': 'form-control', 'id': 'new-password-repeated', 'placeholder': 'Repeat your new password'}));
            nested_body.appendChild(new_password_repeated);
            nested_footer.appendChild(createElement('button', 'Submit', {'class': 'btn btn-primary', 'id': 'submitNewPassword', 'data-dismiss': 'modal'}));
            document.getElementById('submitNewPassword').addEventListener('click', () => {
                // abort if the twice input password is different or password is undefined
                if (document.getElementById('new-password').value !== document.getElementById('new-password-repeated').value || document.getElementById('new-password').value === '') {
                    document.getElementById('update-password-fail').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('update-password-fail').style.display = 'none';
                    }, 3000)
                } else {
                    document.getElementById('update-password-success').style.display = 'inline';
                    setTimeout(() => {
                        document.getElementById('update-password-success').style.display = 'none';
                    }, 3000);
                    fetch(API_URL + '/user', {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Token ' + token
                        },
                        body: JSON.stringify({
                            'password': document.getElementById('new-password').value
                        })
                    })
                }
            });
        });
    })
});

// Instacram logo, to return to index, useful after adopted routing
document.getElementById('index').addEventListener('click', () => {
    window.location.href = window.location.href.split('#')[0];
});
// a simple search field to search user, to display their profile, follow/unfollow etc.
document.getElementById('search-field').addEventListener('keydown', (e) => {
    // detect enter button to trigger search
    if(e.keyCode === 13) {
        const token = checkStore('user-token');
        const username = document.getElementById('search-field').value;
        document.getElementById('search-field').value = '';
        fetch(API_URL + `/user?username=${username}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token
            }
        }).then(res => res.json()).then(data => {
            if (data.message) {
                // if user not exists, display an error message and abort
                let error = document.getElementById('upload-fail');
                error.textContent = data.message;
                error.style.display = 'block';
                setTimeout(() => {
                    error.style.display = 'none';
                }, 2000)
            } else {
                // if such user exists, redirect to the router for that user
                window.location.href = window.location.href.split('#')[0] + `#user=${username}`;
            }
        })
    }
});

// implement fragment url routing to display different user profiles
window.onhashchange = () => {
    user_profile();
};

// service worker used for offline access
// unstable, decided not to include it due to crunching time
// window.addEventListener('load', () => {
//     navigator.serviceWorker.register('../worker.js')
// });
