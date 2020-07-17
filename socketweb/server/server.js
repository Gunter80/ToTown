var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

//要先去要account
//記得  gunter  換ghostid
//socket用url部份當房名，應換成roomsid[url]
//online count 換成roomsnum[url]


app.listen(3000,function(){console.log("Server Started. http://localhost:3000");});

function handler(req, res) {
    fs.readFile(__dirname + '/../client/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}
// 加入線上人數計數
let onlineCount = 0;
var tempurl = '';
var roomsurl = [];   //roomsurl[key]   key=roomid  from database
var roomsid = [];    //roomsid[key]   key=roomsurl
var roomsnum = [];   //roomsnum[key]   key=roomsurl
var account = 'ghost';
io.on('connection', function (socket) {
    // 有連線發生時增加人數
    onlineCount++;

    socket.emit('online', onlineCount);
    socket.on('nowurl', async function (data) {
        // console.log(data);
        tempurl = data.url;
//要先去要account
        if(data.account!=''){
            account = data.account;
        }


//記得  gunter  換ghostid
        var result = await query("SELECT * from public.rooms where roomurl='"+tempurl+"'");
        //資料庫有房間
        if(typeof result=='object'){

            // //後台紀錄rooms
            socket.join(result.roomid);
            roomsurl[result.roomid]=tempurl;
            roomsid[tempurl] = result.roomid;

            //增加統計房間人數
            var updrooms = await query("UPDATE public.rooms SET roomppnum = "+io.sockets.adapter.rooms[result.roomid].length+" WHERE roomurl = '"+tempurl+"'");
            // console.log(io.sockets.adapter.rooms[result.roomid].length);
            
            //新增瀏覽紀錄
            var insviewhis = await query("INSERT INTO public.viewhis(roomid, roomurl, account)VALUES ( '"+result.roomid+"','"+result.roomurl+ "','gunter');");
         //資料庫沒房間
        }else{

            // console.log('else');


            //資料庫建房間
            var insrooms = await query("INSERT INTO public.rooms( roomurl, roomppnum)VALUES ('"+tempurl+ "',1);");
            //取roomid
            var slrooms2 = await query("SELECT * from public.rooms where roomurl='"+tempurl+"'");

            if(typeof slrooms2=='object'){
                //新增瀏覽紀錄
                var insviewhis = await query("INSERT INTO public.viewhis(roomid, roomurl, account)VALUES ( '"+slrooms2.roomid+"','"+slrooms2.roomurl+ "','gunter');");
                
                //後台紀錄rooms
                socket.join(slrooms2.roomid);

                roomsurl[slrooms2.roomid]=tempurl;
                roomsid[tempurl] = slrooms2.roomid;
            }
        }
        if(roomsnum[tempurl] == undefined){
            roomsnum[tempurl]=1;
        }else{
            roomsnum[tempurl] = io.sockets.adapter.rooms[result.roomid].length;
        }



        io.to(tempurl).emit('my message', '創建房間');

    });
    

    socket.on('removetab', async function (data) {
        // console.log(data);
        tempurl = data.url;

        if(data.account!=''){
            account = data.account;
        }


//記得   gunter   換ghostid  
        var result = await query("SELECT * from public.\"rooms\" where roomurl='"+tempurl+"'");
        //資料庫有房間
        if(typeof result=='object'){

            //刪除後台紀錄
            socket.leave(result.roomid);

            //減少統計房間人數
            var updrooms = await query("UPDATE public.rooms SET roomppnum = "+(io.sockets.adapter.rooms[result.roomid].length)+",roomxtime = CURRENT_TIMESTAMP WHERE roomurl = '"+tempurl+"'");

            //新增瀏覽紀錄
            var updviewhis = await query("UPDATE public.viewhis SET roomxtime = CURRENT_TIMESTAMP WHERE roomurl = '"+tempurl+"' and account = 'gunter'");
            // console.log("UPDATE public.viewhis SET roomxtime = CURRENT_TIMESTAMP WHERE roomurl = '"+tempurl+"' and account = 'gunter'");
            
         //資料庫沒房間(不應該)
        }else{

            //資料庫建房間
            var insrooms = await query("INSERT INTO public.rooms( roomurl, roomppnum)VALUES ('"+tempurl+ "',1);");
            //取roomid
            var slrooms2 = await query("SELECT * from public.rooms where roomurl='"+tempurl+"'");

            if(typeof slrooms2=='object'){
                socket.leave(slrooms2.roomid);
                //新增瀏覽紀錄
                var insviewhis = await query("INSERT INTO public.viewhis(roomid, roomurl, account)VALUES ( '"+slrooms2.roomid+"','"+slrooms2.roomurl+ "','gunter');");

                roomsurl[slrooms2.roomid]=tempurl;
                //刪除後台紀錄
                socket.leave(slrooms2.roomid);
                //減少統計房間人數
                var updrooms = await query("UPDATE public.rooms SET roomppnum = "+(io.sockets.adapter.rooms[result.roomid].length)+",roomxtime = CURRENT_TIMESTAMP WHERE roomurl = '"+tempurl+"'");
                //結束瀏覽紀錄
                var updviewhis = await query("UPDATE public.viewhis SET roomxtime = CURRENT_TIMESTAMP WHERE roomurl = '"+tempurl+"' and account = 'gunter'");
            }
        }
        roomsnum[tempurl] = io.sockets.adapter.rooms[result.roomid].length;
        if(roomsnum[tempurl]==0){
            delete roomsurl[roomsid[tempurl]];
            delete roomsid[tempurl];
            delete roomsnum[tempurl];
        }


        io.to(tempurl).emit('my message', '創建房間');
    });



    socket.on("send", (msg) => {
        // 如果 msg 內容鍵值小於 2 等於是訊息傳送不完全
        // 因此我們直接 return ，終止函式執行。
        if (Object.keys(msg).length < 2) return;

        console.log("廣播訊息到聊天室");
        // console.log(msg);
        // 廣播訊息到聊天室
        // io.emit("msg", msg);
        
        io.to(roomsid[msg.url]).emit("msg", msg);
        // console.log(io.sockets.adapter.rooms);
        
    });

    socket.on('disconnect', () => {
        // 有人離線了，扣人
        onlineCount = (onlineCount < 0) ? 0 : onlineCount -= 1;
        io.emit("online", onlineCount);
    });

    socket.on('dologin', async (inputdata) => {
        // 進行登入
        var result = await query("SELECT * from public.\"userList\" where useraccount='"+inputdata.account+"' and userpassword='"+inputdata.password+"'");
        // console.log(typeof result)
    
        if(typeof result=='object'){
            // console.log(result);
            socket.emit('donelogin', result);
        }
    });

    socket.on('dosignin', async (inputdata) => {
        // 進行註冊
        var result = await query("SELECT * from public.\"userList\" where useraccount='"+inputdata.account+"' or useremail='"+inputdata.email+"' or username='"+inputdata.playername+"'");
        // console.log(typeof result)
    
        if(typeof result=='object'){
            // console.log(result);
            socket.emit('signinerr', result);
        }else{
            // console.log("INSERT INTO public.\"userList\"(\"useraccount\", username, userpassword, useremail)VALUES ( '"+inputdata.account+"','"+inputdata.playername+ "','"+inputdata.password+"','"+inputdata.email+"');");
            var result = await query("INSERT INTO public.\"userList\"(useraccount, username, userpassword, useremail)VALUES ( '"+inputdata.account+"','"+inputdata.playername+ "','"+inputdata.password+"','"+inputdata.email+"');");
            objres = {account: inputdata.account, playername: inputdata.playername};
            socket.emit('donesignin', objres);
        }
    });
});



var resend 

function query(ques) {
    try{
    const{Pool,Client } = require ('pg')
    const connectionString = 'postgresql://postgres:gunter@localhost:5432/totown'
    const client = new  Client({
        connectionString:connectionString
    })
    return new Promise((resolve, reject) => {
        client.connect()
        client.query(ques,(err,res)=>{
            var [temp] = res.rows
            if (temp != undefined) {
                resend = temp
                resolve(temp)
            } else {
                reject(err)
            }
            client.end()
        })
    }).catch(new Function());
    }catch(err){
        console.log(err);
    }
}

async function dologin(inputdata) {
    console.log(inputdata);
    var result = await query("SELECT * from public.\"userList\" where useraccount='"+inputdata.account+"' and userpassword='"+inputdata.password+"'")

    // result === "Success"
    console.log(typeof result)

    if(typeof result=='object'){
        console.log(result);
    }
}
// dologin()


module.exports = {
    query
  };