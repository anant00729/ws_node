const _d = document

const btn = _d.querySelector('button')
const in_txt = _d.getElementById('txt') 
const log = _d.getElementById('log') 



const name = prompt('Enter your name?')

// for websockets
const _s = new WebSocket('ws://localhost:3000/')
_s.onopen = () => {
    console.log('socket connected successfully');

    const _d = JSON.stringify({
        type : "name",
        data : name
    })

    console.log('_D', _d)
    _s.send(_d)

    // sends message after connection is established after one second
    // setTimeout(()=> {
    //     _s.send("hey there")
    // }, 1000)
    
} 
_s.onmessage = (event) => {
    const _d = JSON.parse(event.data)

    log.innerHTML +=  _d.name + ": " + _d.data + '</br>'
}

// for button click
btn.onclick = () => {
    const _text = in_txt.value
    _s.send(JSON.stringify({
        type : "message",
        data : _text
    }))
    log.innerHTML += "You: " + _text + '</br>'
}