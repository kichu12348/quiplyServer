const {addMessage}=require('../controllers/message')


const handleSockets = (io)=>{
    io.on('connection', (socket) => {
       
        

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
          return;
        });
      });
}

module.exports = handleSockets;