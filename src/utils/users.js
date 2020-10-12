const users=[]
//addUser
const addUser=({ id,username,room})=>{
    //Clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    // Validate the data

    if(!username || !room){
        return {
            error:'username & room are required'
        }
    }

    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username=== username
    })

    //validate username
    if(existingUser){
        return {
            error:'Username is in use'
        }
    }
    //store user

    const user={id,username,room}
    users.push(user)
    return{user}
}





module.exports={
    addUser
}


