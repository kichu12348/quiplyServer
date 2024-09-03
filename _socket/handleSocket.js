const {addMessage}=require('../controllers/message')


let currentPlayerColor = 'w';





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
        
        socket.on("typing",({roomID,user})=>{
          io.to(roomID).emit("typing",{id:user});
        })

        socket.on("groupChatCreated",({contacts,data})=>{
          contacts.forEach((contact)=>{
            io.to(contact).emit("groupCreated",data);
          })
        })
        
        socket.on("updateContact",({updateContact,contacts})=>{
          contacts.forEach((contact)=>{
            io.to(contact).emit("updateContacT",updateContact);
          })
        })


        socket.emit('playerColor', currentPlayerColor);
        currentPlayerColor = currentPlayerColor === 'w' ? 'b' : 'w';
      
        socket.on('move', (move) => {
          socket.broadcast.emit('move', move);
        });
      
        socket.on('joinGame', () => {
          io.emit('playerColor', currentPlayerColor);
          currentPlayerColor = currentPlayerColor === 'w' ? 'b' : 'w';
        });


        socket.on('disconnect', () => {
          return;
        });
      });
}

module.exports = handleSockets;