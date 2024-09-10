const express = require('express');
const app = express();
const socketIo = require('socket.io');
const handleSockets =require('./_socket/handleSocket');
const userRouter = require('./routes/user');
const messageRouter = require('./routes/message');
const songRouter = require('./routes/songs');
const {connectToDb}= require('./services/connectDb')
const port = process.env.PORT
const path = require('path');


//connect to db
connectToDb(process.env.MONGO_URI)

app.get('/', (req, res) => {
  res.json({ message: 'I am alive' });
});
app.use(express.json({ limit: '50mb' }));

app.use('/user', userRouter);
app.use('/message', messageRouter);
app.use('/song', songRouter);


const server = app.listen(port, () => {
    console.log(`Server running on port ${port} 🚀`);
})

const io = socketIo(server,{
    cors: {
      origin: '*',
    }
});

handleSockets(io);

