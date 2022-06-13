const form = document.querySelector('form');
form.addEventListener('submit', sendData);

async function sendData(event) {
    event.preventDefault();
    let formData = new FormData(form);
    var object = {};
    formData.forEach((value, key) => {
        object[key] = value;
    });

    console.log(object);
    // вот тут нужно добавить функцию валидации данных, все данные с формы лежат в object
    let isValidated = validateData(object)
    if(!isValidated.ok) {
        let place = document.querySelector(`.${isValidated.place}`);
        place.insertAdjacentHTML("beforeend", `<div class='message error' id='error' style='color: red;'>${isValidated.error}</div>`);
        setTimeout(() => {
            document.querySelector('.error').outerHTML = '';
          },5000);
        return;
    }
    // вот тут нужно добавить функцию валидации данных, все данные с формы лежат в object
    const res = await fetch('/registration', {
        method: 'POST',
        body: JSON.stringify(object),
        headers: {
            'Content-Type':'application/json'
        }
    });
    
    if(!res.ok) return console.error(res);
    
    if(res.redirected) {
        document.location = res.url;
    }
    else {
        const error = await res.text();

        let place = document.querySelector(`.heading_login`);
        place.insertAdjacentHTML("afterend", `<div class='message error' id='error'>This ${error} already exists</div>`);
        setTimeout(() => {
            document.querySelector('.error').outerHTML = '';
        },5000);
    }
}

function validateData(data) {
    let err = ''
    let regexEmail = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])")
    if(!regexEmail.test(data.email)) {
        console.log('Incorrect format for email')
        err += 'Incorrect format for email'
        return {ok: false, error: err, place: 'email_container'}
    }
    let regexLogin = new RegExp('^[a-zA-Z0-9_-]*$')
    if(!regexLogin.test(data.login)) {
        console.log('Incorrect format for login')
        err += 'Incorrect format for login'
        return {ok: false, error: err, place: 'login_container'}
    }
    let regexName = new RegExp('^[a-zA-Z0-9_-]*$')
    if(!regexName.test(data.username)) {
        console.log('Incorrect format for username')
        err += 'Incorrect format for username'
        return {ok: false, error: err, place: 'username_container'}
    }
    return {ok: true, error: '', place: ''}
}