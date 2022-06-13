const form = document.querySelector('form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('input');
    const data = {login: inputs[0].value, password: inputs[1].value};
    const res = await fetch('/api/newUser', {
        method: 'POST',
        body: JSON.stringify(data),
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
        place.insertAdjacentHTML("afterend", `<div class='message error' id='error'>${error}</div>`);
        setTimeout(() => {
            document.querySelector('.error').outerHTML = '';
        },5000);
        // обработка ошибок логина, сделайте красиво))
        // в error лежит текст ошибки, который приходит с сервера (apiController.js 19 строка)
        return;
    }

});