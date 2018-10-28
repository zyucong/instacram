/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

// create and return a loading animation
export function createLoading(id) {
    const container = document.createElement('div');
    container.innerHTML = `<svg id=${id} width="6%" style="margin-left: 47%; display: none" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling"><circle cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" stroke="#3e6d8d" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" transform="rotate(71.7955 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>`;
    return container;
}
// create and return a modal, with header, body and footer
export function createModal(id) {
    const modal = createElement('div', null, {
        'class': 'modal fade',
        'id': id,
        'tabindex': '-1',
        'role': 'dialog',
        'aria-hidden': 'true'
    });
    const dialog = createElement('div', null, {
        'class': 'modal-dialog',
        'role': 'document'
    });
    const content = createElement('div', null, {'class': 'modal-content'});
    const header = createElement('div', null, {'class': 'modal-header'});
    const title = createElement('h5', null, {'class': 'modal-title', 'id': `${id}-title`});
    const closebtn = createElement('button', null, {
        'type': 'button',
        'class': 'close',
        'data-dismiss': 'modal',
        'aria-label': 'Close'
    });
    const close = createElement('span', null, {'aria-hidden': 'true'});
    close.innerHTML = '&times;';
    closebtn.appendChild(close);
    header.appendChild(title);
    header.appendChild(closebtn);
    content.appendChild(header);
    const body = createElement('div', null, {'class': 'modal-body', 'id': `${id}-body`});
    body.appendChild(createLoading(`${id}-loading`).firstChild);
    const footer = createElement('div', null, {'class': 'modal-footer', 'id': `${id}-footer`});
    content.appendChild(body);
    content.appendChild(footer);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    return modal;
}

/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
// information including:
// when it was posted
// post.meta.published
// the image itself and description text
// how many likes it has
// post.meta.likes (array)
// how many comments the post has
// post.meta.comments (array)
export function createPostTile(post) {
    // construct the post using bootstrap card, display as feed
    const card = createElement('div', null, { class: 'card post' });
    const header = createElement('div', null, {class: 'card-header'});
    const fragment = createElement('h4', null, {});
    fragment.appendChild(createElement('a', post.meta.author, {'href': `#user=${post.meta.author}`}));
    header.appendChild(fragment);
    card.appendChild(header);
    card.appendChild(createElement('img', null,
        { src: 'data:image/png;base64,'+post.src, alt: post.meta.description_text, class: 'card-img-top' }));
    const body = createElement('div', null, {'class': 'card-body'});
    let likes = post.meta.likes.length;
    let comments = post.comments.length;
    // convert from timestamp
    let timestamp = new Date(parseFloat(post.meta.published) * 1000);
    // write a month array and display month nicely
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    let time = `${timestamp.getDate()} ${monthNames[timestamp.getMonth()]} at ${timestamp.getHours()}:${timestamp.getMinutes()}`;
    let like_text = createElement('p', likes + ' like(s)', {
        'class': 'card-text post-like',
        'current-like': post.meta.likes.length,
        'post-id': post.id,
        'data-toggle': 'modal',
        'data-target': '#like-list'
    });
    body.appendChild(like_text);
    let content = createElement('p', null, {'class': 'card-text'});
    content.appendChild(createElement('b', `${post.meta.author}: `));
    content.appendChild(createElement('span', post.meta.description_text));
    body.appendChild(content);
    body.appendChild(createElement('p', comments + ' comment(s)', {'class': 'card-text post-comment', 'current-comment': comments, 'post-id': post.id, 'data-toggle': 'modal', 'data-target': '#comment-list'}));
    body.appendChild(createElement('p', time, {'class': 'card-text published-time'}));
    card.appendChild(body);
    const footer = createElement('div', null, {class: 'card-footer'});
    const btn_row = createElement('div', null, {class: 'row'});
    const like_btn = createElement('button', null, {class: 'btn btn-outline-secondary col like-btn', 'post-id': post.id});
    like_btn.innerHTML = '<i class="material-icons icons">thumb_up</i> Like';
    btn_row.appendChild(like_btn);
    const comment_btn = createElement('button', null, {class: 'btn btn-outline-secondary col comment-btn', 'post-id': post.id, 'data-toggle': 'collapse', 'data-target': `#collapse-${post.id}`});
    comment_btn.innerHTML = '<i class="material-icons icons">chat</i> Comment';
    btn_row.appendChild(comment_btn);
    footer.appendChild(btn_row);
    const collapse = createElement('div', null, {class: 'collapse', id: `collapse-${post.id}`});
    collapse.appendChild(createElement('div', 'Comment Successful!', {id: `prompt-${post.id}`, class: 'alert alert-success', role: 'alert', style: 'display: none;'}));
    collapse.appendChild(createElement('input', null, {class: 'form-control comment-field', placeholder: 'Write a comment...', 'post-id': post.id}));
    collapse.appendChild(createElement('p', 'Press Enter to post.', {class: 'comment-hint'}));
    footer.appendChild(collapse);
    card.appendChild(footer);
    return card;
}
/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post
 * @returns {HTMLElement}
 */
export function createUserPost(post) {
    // construct the post using bootstrap card, display it in user profile
    // omit the like/comment button and like/comment list due to limited time
    // also add delete/update button, but will only displayed when logged in user view his own profile
    const card = createElement('div', null, {id: `post-${post.id}`, class: 'card post' });
    const header = createElement('div', null, {class: 'card-header'});
    const fragment = createElement('h4', post.meta.author, {});
    header.appendChild(fragment);
    card.appendChild(header);
    const container = createElement('div', null, {'class': 'post-container'});
    container.appendChild(createElement('img', null,
        { src: 'data:image/png;base64,'+post.src, alt: post.meta.description_text, class: 'card-img-top post-img', id: `image-${post.id}` }));
    const del_btn = createElement('button', 'null', {'class': 'btn btn-danger del-btn', 'style': 'display: none;', 'del-id': post.id});
    del_btn.innerHTML = '<i class="material-icons">clear</i>';
    container.appendChild(del_btn);
    card.appendChild(container);
    const body = createElement('div', null, {'class': 'card-body post-body'});
    let content = createElement('p', null, {'class': 'card-text'});
    content.appendChild(createElement('b', `${post.meta.author}: `));
    content.appendChild(createElement('span', post.meta.description_text, {id: `caption-${post.id}`}));
    body.appendChild(content);
    let timestamp = new Date(parseFloat(post.meta.published) * 1000);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    let time = `${timestamp.getDate()} ${monthNames[timestamp.getMonth()]} at ${timestamp.getHours()}:${timestamp.getMinutes()}`;
    body.appendChild(createElement('p', time, {'class': 'card-text published-time'}));
    body.appendChild(createElement('button', 'Update this post', {'class': 'btn btn-primary', 'data-toggle': 'modal', 'update-id': post.id, 'data-target': '#nested', 'style': 'display: none;'}));
    card.appendChild(body);
    return card;
}

/* 
    Reminder about localStorage
    window.localStorage.setItem('AUTH_KEY', someKey);
    window.localStorage.getItem('AUTH_KEY');
    localStorage.clear()
*/
export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key);
    else
        return null

}