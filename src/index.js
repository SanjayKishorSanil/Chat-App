const express=require('express')
const path =require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage, generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const app=express()
const server=http.createServer(app)
const io=socketio(server)
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

const history = []
const client = []



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
        users:getUsersInRoom(user.room),
        history:history
    })
    callback()
})

    socket.on('sendMessage',(message,callback)=>{
        const filter=new Filter()
        const user=getUser(socket.id)
       
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
       // history.push(message)
        const messageHistory= generateMessage(user.username,message)
        history.push(messageHistory)
        console.log('histroy',history)
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(location,callback)=>{
    const user=getUser(socket.id)
     io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, "https://google.com/maps?q="+location.latitude+","+location.longitude))
     callback()
    })

    socket.on('disconnect',()=>{

        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',user.username+" has left"))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

})



server.listen(3000,()=>{
    console.log('server is up on port 3000')
})