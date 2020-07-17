// 移除廣告 版面放大

//頁面加載完會直接跑

//可以直接 console 在 chrome
console.log("this console will show at chrome console");

$("article section h3:contains('漫步雲端，網路相遇')").parent().remove();

var sidebar = document.createElement('div');
sidebar.id = "mySidebar";

document.body.appendChild(sidebar);

$("#mySidebar").append(
	'<div id="totowncontainer">' +
		'<div id="totownchatbox">' +
			'<div id="status-box">Server: <span id="status">-</span> / <span id="online">0</span> online.<img  id="imgdown" src="https://newstudents.nctu.edu.tw/freshman/down-chevron.png" ></img></div>' +
			'<div id="send-box">' +
				'<input type="text" name="msg" id="msg" placeholder="說點什麼？">' +
				'<button type="button" id="btsend" class="btn btn-outline-dark">送出</button>'+
			'</div>' +
		'</div>' +
	'</div>'+
	'<div id="loginblock" class="loginblock dpn"><br> '+
		'<h1 style="text-align:center">ToTown</h1><br> '+
		'<ul class="nav nav-tabs">'+
			'<li class="nav-item"><a class="nav-link active" href="#logindiv" data-toggle="tab">登入</a></li>'+
			'<li class="nav-item"><a class="nav-link" href="#signindiv" data-toggle="tab">註冊</a></li>'+
		'</ul>'+
		'<div class="tab-content"><br>'+
			'<div  id="logindiv" class="tab-pane active"> '+
				'<span>使用者帳號</span><br><input type="text" style="width:380px;" id="loginaccount"><br><br> '+
				'<span>密碼</span><br><input type="text" type="text" style="width:380px;" id="loginpassword"><br><br> '+
				'<div id="btlogin" class="talc"><button class="btn btn-primary">登入</button></div> '+
			'</div>'+
			'<div  id="signindiv" class="tab-pane"> '+
				'<span>使用者帳號</span><br><input type="text" style="width:380px;" id="signinaccount"><br><br> '+
				'<span>密碼</span><br><input type="text" type="text" style="width:380px;" id="signinpassword"><br><br> '+
				'<span>暱稱</span><br><input type="text" style="width:380px;" id="playername"><br><br> '+
				'<span>電子信箱</span><br><input type="text" style="width:380px;" id="email"><br><br> '+
				'<div id="btsignin" class="talc"><button class="btn btn-primary">註冊</button></div> '+
			'</div>'+
		'</div>'+
	'</div> '
);








var status = document.getElementById("status");
var online = document.getElementById("online");
var sendForm = document.getElementById("send-form");
var totownchatbox = document.getElementById("totownchatbox");
var statusbox = document.getElementById("status-box");
var totowncontainer = document.getElementById("totowncontainer");
var sendbox = document.getElementById("send-box");
var btsend = document.getElementById("btsend");
var btlogin  = document.getElementById("btlogin");
var loginblock  = document.getElementById("loginblock");
var btsignin = document.getElementById("btsignin");



btsend.onclick = function(){
	dosend();
	console.log("send");
}

btlogin.onclick = function(){
	dologin();
	console.log('dologin');
}

btsignin.onclick = function(){
	dosignin();
	console.log('dosignin');
}

//官方救了我
var socket = io("http://localhost:3000");
var url = location;

socket.on('online', function (data) {
	console.log("socket on connect");
	$("#status").text("Connected.");
	console.log(data);
	$("#online").text(data);

});

socket.emit('nowurl', { url: url.href, account:account });

socket.on("disconnect", function () {
	$("#status").text("Disconnected.");
});

// socket.on("online", function (amount) {
// 	$("#online").text(amount);
// });

socket.on("msg", function (d) {
	$("#totownchatbox").append('<div><span>' + d.name + '</span> : <span >' + d.msg + '</span></div>');

});



statusbox.onclick = function(){
	myFunction();
	console.log("csssmall");
}

function myFunction() {

	if (sendbox.style.display === "none") {
		totowncontainer.setAttribute('style','height:300px;'+'width:300px');
		sendbox.style.display = "block";
	  
	} else {
		totowncontainer.setAttribute('style','height:25px;'+'width:220px');
		sendbox.style.display = "none";
	}
}

var islogin=false;
var account='';
var playername='';

function dosend() {
	if(islogin==false){
		chrome.runtime.sendMessage({checklogin:true, account: account, playername: playername}, function(response) {  
			if(response.islogin == true){
				console.log(response);
				islogin = true;
				account = response.account;
				playername = response.playername;
				msg=document.getElementById("msg");
				formData = {name: playername,msg: msg.value};
				socket.emit("send", formData);
			}else{
				console.log(response);
				//登入
				totowncontainer.className += " dpn";
				loginblock.className = "loginblock"
			}
		});
	}else{
		//留言
		msg=document.getElementById("msg");
		formData = {name: playername, msg: msg.value, url:url.href};
		socket.emit("send", formData);
	}
}


function dologin(){
	var loginaccount = document.getElementById("loginaccount");
	var loginpassword = document.getElementById("loginpassword");
	socket.emit('dologin', { account: loginaccount.value, password: loginpassword.value });
	// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {  
	// 	console.log(message);  
	// 	console.log(sender);  
	// 	sendResponse({ content: "來自內容腳本的回覆" });  
	// });
	// chrome.runtime.sendMessage({dologin:true, account: loginaccount }, function(response) {  
	// 	if(response.islogin == true){
	// 		islogin = true;
	// 		account = response.account;
	// 		playername = response.playername; 
	// 	}else{
	// 		socket.emit('dologin', { account: loginaccount.value, password: loginpassword.value });
	// 	}
	// });  
	
}

socket.on('donelogin', function(res){
	if(typeof res=='object'){
		islogin=true;
		account=res.useraccount;
		playername=res.username;
		totowncontainer.className = "";
		loginblock.className += " dpn";
		chrome.runtime.sendMessage({donelogin:true, account: res.useraccount, playername: res.username}, function(response) {
			if(response.islogin==true){
				console.log('donelogin');
			}
		});
	}else{
		alert('帳號密碼錯誤');
	}
});

function dosignin(){
	var signinaccount = document.getElementById("signinaccount");
	var signinpassword = document.getElementById("signinpassword");
	var playername = document.getElementById("playername");
	var email = document.getElementById("email");
	socket.emit('dosignin', { account: signinaccount.value, password: signinpassword.value, playername: playername.value, email: email.value });
}

socket.on('donesignin', function(res){
	if(typeof res=='object'){
		islogin=true;
		account=res.account;
		playername=res.playername;
		totowncontainer.className = "";
		var loginblock = document.getElementById("loginblock");
		loginblock.className += " dpn";
		chrome.runtime.sendMessage({donesignin:true, account: res.account, playername: res.playername}, function(response) {
			if(response.islogin==true){
				console.log('donesignin');
			}
		});
	}
});

socket.on('signinerr', function(res){
	if(typeof res=='object'){
		var errmsg = '';
		if(document.getElementById("signinaccount").value == res.useraccount){errmsg+='帳號已註冊'}
		if(document.getElementById("playername").value == res.username){if(errmsg!=''){errmsg+='，'}errmsg+='暱稱已註冊'}
		if(document.getElementById("email").value == res.useremail){if(errmsg!=''){errmsg+='，'}errmsg+='信箱已註冊'}
		alert(errmsg);
	}
});


console.log("try end");



// vm = new Vue({
// 	el: '#mySidebar',
// 	data: {
// 		islogin: false,
// 		account: ''
// 	}
// });

