declare var $: any;
window.$ = document.querySelector.bind(document)
window.$.create = document.createElement.bind(document)


function renderAlert() {
    $('body').insertAdjacentHTML('beforebegin', `<div class="alert">
      <div class="close">x</div>
      <div id="message">
      </div>
    </div>`)
    getMessageForAlert().then((message: string) => {
        renderMessage(message)
        setEventListenrs()
    })
}


function checkThreeSession() {
    let sessionNumber = Number(sessionStorage.getItem('session'))
    if (sessionNumber >= 3) {
        return true
    } else {
        setSession(++sessionNumber)
    }
}

function checkHideAlert() {
    if (localStorage.hasOwnProperty('hideAlert') || checkThreeSession()) {
        setHideAlert()
    } else {
        renderAlert()
    }
}

checkHideAlert()

function setSession(value) {
    sessionStorage.setItem("session", value);
}


function getMessageForAlert() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage('getMessageForAlert', (message) => {
            if (message) {
                resolve(message);
            } else {
                reject('Something wrong');
            }
        })
    })
}

function setHideAlert() {
    $(".alert")?.setAttribute('style', 'display:none');
}

function renderMessage(message: string) {
    $("#message").textContent = message
}

function setEventListenrs() {
    $('.close').addEventListener('click', () => {
        localStorage.setItem('hideAlert', 'true')
        setHideAlert()
    })
}

