const {addMessage}=require('../controllers/message')


const handleSockets = (io)=>{
    io.on('connection', (socket) => {
        console.log('New user connected');
        

        socket.on('joinID',({id})=>{
            socket.join(id);
        })

        socket.on('contactAdded',({contactId,data})=>{
            
            io.to(contactId).emit('addContact',data);
        })

        socket.on("joinRoom",({roomID})=>{
          socket.join(roomID);
        })

        socket.on("message",async ({message})=>{
          io.to(message.roomID).emit("newMessage",message);  
          await addMessage({message});
        })

        


        socket.on('disconnect', () => {
          console.log('User disconnected');
        });
      });
}

module.exports = handleSockets;