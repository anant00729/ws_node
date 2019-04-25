const uuidv1 = require('uuid/v1');
const _ws = require('ws').Server
const http = require('http')
const exp = require('express')
const path = require('path')

const _d_json = require('./dummy.json')
const _json_dates = require('./dummy2.json')

const app = exp()


//console.log('http :', http);

app.use(exp.static('public'))

let _total = 0


app.get('/home', (req,res)=>{
  res.sendFile(path.join(__dirname + '/public/index.html'));
})

const server = http.createServer(app)
const PORT = process.env.PORT || 3000


server.listen(PORT,()=> {
    console.log(`the server is running on ${PORT} and date is ${new Date()}`)
})


/**
* WebSocket server
*/
var ser = new _ws({
    // WebSocket server is tied to a HTTP server. WebSocket
    // request is just an enhanced HTTP request. For more info 
    // http://tools.ietf.org/html/rfc6455#page-6
    server
  });


//ser = new _ws({server})

// const _ws = require('ws').Server

 //const s = new _ws({port : 5001})


//const s = new _ws({port : 5001, })

// s.on('connection', (ws,req) => {
//     console.log(`connected ${req}`);
//     ws.on('message', (message)=>{
//         try {
//             ws.send(message);
//           } catch (e) {
//             /* handle error */
//           }
//         console.log('Reeived message', message)
//     })
// })


ser.on('connection', (ws, req) => {

    
  console.log('ser :', ser.clients.size);

  // Tab 1
  // Tab 2
  ws.on('message', (msg)=> {

      // 
      const _d = JSON.parse(msg)


      if(_d.type == 'name'){
          ws.personName = _d.data
          return
      }

      console.log('msg :', msg);
      //send message to all
      for(c of ser.clients){
        c.send(JSON.stringify({
          name : ws.personName,
          data : _d.data
        }))
          // if(ws !== c){
              
          // }
      }
  })


  ws.on('close', ()=> {
      --_total
      console.log('I lost a connection ' + _total);
  })

  ++_total
  console.log('One more client connected '  + _total );



})


