// const _ws = require('ws').Server
//var webSocketServer = require('websocket').server;
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



 

app.post('/GetAllShow/', (req,res)=> {
    res.json(_d_json)
})


app.post('/GetShowDate/', (req,res)=> {
  res.json(_json_dates)
})

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
var _wss = new _ws({
    // WebSocket server is tied to a HTTP server. WebSocket
    // request is just an enhanced HTTP request. For more info 
    // http://tools.ietf.org/html/rfc6455#page-6
    server
  });


//_wss = new _ws({server})

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


_wss.on('connection', (ws, req) => {

    //ws.send('ajshdkashd')

    // ws.on('message', (d)=> {
        
    // })

    const player = new Player(uuidv1(), ws)


    console.log('player.name', player.name)

    Players.push(player)

    ws.send(JSON.stringify({action: 'connect', data: player.id}))

    // connection.sendUTF(JSON.stringify({action: 'connect', data: player.id}));
    ws.on('message', (data)=> {
    var message = JSON.parse(data);

    switch(message.action){
        //
        // When the user sends the "join" action, he provides a name.
        // Let's record it and as the player has a name, let's 
        // broadcast the list of all the players to everyone
        //
          case 'join':
            player.name = message.data;
            BroadcastPlayersList();
            break;

        //
        // When a player resigns, we need to break the relationship
        // between the 2 players and notify the other player 
        // that the first one resigned
        //
          case 'resign':
          console.log('resigned');
            Players[player.oppo]
              .con
              .send(JSON.stringify({'action':'resigned'}));

            setTimeout(function(){
              Players[player.oppo].opponentIndex = player.oppo = null;
            }, 0);
            break;

        //
        // A player initiates a new game.
        // Let's create a relationship between the 2 players and
        // notify the other player that a new game starts
        // 
          case 'new_game':
            player.setOppo(message.data);
            Players[player.oppo]
              .con
              .send(JSON.stringify({'action':'new_game', 'data': player.name}));
            break;

        //
        // A player sends a move.  Let's forward the move to the other player
        //
          case 'play':
            Players[player.oppo]
              .con
              .send(JSON.stringify({'action':'play', 'data': message.data}));
            break;
      }
    })


})


let Players = []



class Player{
    constructor(id,con){
        this.id = id
        this.con = con
        this.name = ""
        this.oppo = null
        this.index = Players.length
    }

    getId() {
        return {name : this.name , id : this.id}
    }

    setOppo(id){
        let self = this
        let i = 0;
        for(p of Players){
            if(p.id == id){
                self.oppo = i
                Players[i].oppo = self.index
                return false
            }
            ++i
        }
    }


}

// function Player(id,con){
//     this.id = id
//     this.con = con
//     this.name = ""
//     this.oppo = null
//     this.index = Players.length
// }


// Player.prototype = {
//     getId : () => {
//         return {name : this.name , id : this.id}
//     },
//     setOppo : (id) => {
//         let self = this
//         let i = 0;
//         for(p of Players){
//             if(p.id == id){
//                 self.oppo = i
//                 Players[i].oppo = self.index
//                 return false
//             }
//             ++i
//         }
//     }
// }


function BroadcastPlayersList(){
    let p_l = []
    for(p of Players){
        if(p.name !== ''){
            p_l.push({ name : p.name , id : p.id})
        }
    }

    let msg = JSON.stringify({
        'action' : 'players_list',
        'data' : p_l
    })

    for(p of Players){
        p.con.send(msg)
    }
}






