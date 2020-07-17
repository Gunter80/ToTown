const{Pool,Client } = require ('pg')
const connectionString = 'postgresql://postgres:gunter@localhost:5432/totown'

const client = new  Client({
    connectionString:connectionString
})

var resend 

function query(ques) {
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
    })
}
async function main() {
    var result = await query('SELECT * from public."userList"')
    // result === "Success"
    console.log(result)
}
main()

module.exports = {
    query
  };