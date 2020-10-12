const express=require('express')
const path =require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage}=require('./utils/messages')
const {addUser}=require('./utils/users')
const app=express()
const server=http.createServer(app)
const io=socketio(server)

const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



io.on('connection',(socket)=>{
    console.log('NEW Web Socket Connection')
    
socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room})

    if(error){
         return callback(error)
    }
    
    socket.join(user.room)

    socket.emit('message',generateMessage('admin','Welcome'))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',user.username+" has joined"))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
    callback()
})

})

server.listen(3000,()=>{
    console.log('server is up on port 3000')
})