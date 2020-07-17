var f = require('./sqlfunction');
var pg = require('pg');
 
var conString = "tcp://postgres:gunter@localhost/totown";
 
var client = new pg.Client(conString);
var ansrows = new Array();
 
var value = ['10','fillp','abc'];
insertSQLString = 'insert into teacher values($1,$2,$3)';
selectSQLString = 'select * from public."userList"';
updateSQLString = "update teacher set NAME='ipone' where ID='4'";
deleteSQLString = "delete from teacher where ID='10'";
var row ;
client.connect(function(error, results) {
    if(error){
        console.log('ClientConnectionReady Error: ' + error.message);
        client.end();
        return;
    }
    console.log('Connecting to postgres...');
    console.log('Connected to postgres automatically.');
    console.log('connection success...\n');
 
    ansrows = _select(client,selectSQLString);
    console.log(ansrows);
    
    // f._insert(client,insertSQLString,value);
    // f._select(client,selectSQLString);
    // f._delete(client,deleteSQLString);
});

function _select(client,selectSQLString)
{
    console.log("select beginning");
    client.query(selectSQLString,  function selectCb(error, results, fields)
    {
        console.log("in select callback function");
        if (error)
        {
            console.log('GetData Error: ' + error.message),
            client.end();
            return;
        }
        if(results.rowCount > 0)
        {
            var firstResult,
            resultSet = '';
            for(var i = 0, len = results.rowCount; i < len; i++)
            {
                firstResult = results.rows[i]; 
                resultSet += 'id:' + firstResult['id'] + ' ' + 'name:' + firstResult['name'] + ' ' + 
                             'pwd:' + firstResult['pwd'] + '\n'; 
            }
        }
        // console.log(results.rows);
        return(results.rows);
        /* 添加功能：使查询结果集返回到客户端并保证此函数的通用性. */
    });
    console.log("select end\n");
}