const{Pool,Client } = require ('pg')
const connectionString = 'postgresql://postgres:gunter@localhost:5432/totown'

const client = new  Client({
    connectionString:connectionString
})

var resend 

client.connect()

client.query('SELECT * from public."userList"',(err,res)=>{
    // console.log(err,res)
    var [temp] = res.rows
    // console.log(resend)
    save(temp)
    client.end()
})

function save(result){
    resend = result
    console.log(resend);
}

setTimeout(function(){
    console.log(resend)
    },5000);


