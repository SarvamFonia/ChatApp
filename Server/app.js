// ====================================== imports ====================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path')

// ===================================== App use =======================================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// const corsOptions = {
//     origin: process.env.CLIENT_ULR, // Ensure there is no trailing slash here
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   };
app.use(cors());

const socketServer = require('http').createServer(app)
  const io = require('socket.io')(socketServer, {
    cors: {
        origin: '*', // Ensure there is no trailing slash
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }
});


// ======================================== SOCKET IO =================================
let users = [];
io.on('connection', socket => {
    console.log(`Socket connected at ${socket.id}`)
    console.log(users)
    socket.on('addUser', userId => {
        const isUserExists = users.find(user => user.userId === userId);
        if (!isUserExists) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users)
        }
    });

    socket.on('sendMessage', async({ senderId, receiverId, message, conversationId }) => {
        console.log(senderId,receiverId)
        const receiver = await users.find(user => user.userId === receiverId);
        const sender = await users.find(user => user.userId === senderId);
        console.log(sender,receiver)
        const user = await Users.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: {id: user._id, fullName: user.fullName, email: user.email}
            })
        }else{
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: {id: user._id, fullName: user.fullName, email: user.email}
            })
        }
    })

    socket.on('disconnect', (reason) => {
        // console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // io.emit('getUsers',socket.userId)
});


// ========================================= Models ===================================
const Conversation = require('./models/Conversation')
const Messages = require('./models/Messages')
const Users = require('./models/Users')

// ========================================= Db ========================================
const connectDB = require('./db/connection');



// ============================================ ENV =====================================
const port = process.env.PORT || 8000;



// Routes

app.get('/', (req, res) => {
    res.send('welcome')
});

// const __dirname1 = path.reolve();
// if(process.env.NODE_ENV){
//     app.use(express.static(path.join(__dirname1,'/build')))
// }else{
//     app.get('/', (req, res) => {
//         res.send('welcome')
//     })
// }

// =========================================== SignUp ========================================
app.post('/api/register', async (req, res, next) => {
    // console.log('inside post')
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            res.status(400).send('Please fill all required fields.');

        } else {
            const isAlreadyExists = await Users.findOne({ email: email });

            if (isAlreadyExists) {
                res.status(400).send('User Already Exists.')
            } else {
                const newUser = new Users({ fullName, email });
                bcryptjs.hash(password, 10, (err, hashedPassword) => {
                    newUser.set('password', hashedPassword);
                    newUser.save()
                    next();
                })
                return res.status(200).json({
                    message:'User Registered Successfully',
                    success:true
                })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
})


// ======================================= Login ==============================================
app.post('/api/login', async (req, res, next) => {
    // console.log('inside post')
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).send('Please fill all required fields.');

        } else {
            const user = await Users.findOne({ email: email });

            if (!user) {
                res.status(400).send('User Email or Password is Incorrect.')
            } else {
                const validateUser = await bcryptjs.compare(password, user.password);
                if (!validateUser) {
                    res.status(400).send('User Email or Password is Incorrect.')
                } else {
                    const payload = {
                        userId: user._id,
                        email: user.email
                    }
                    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';

                    jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
                        await Users.updateOne({ _id: user._id }, {
                            $set: { token }
                        })
                        user.save();
                        return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token: token })
                        // next();
                    })

                }
            }
        }
    } catch (err) {
        console.log(err)
    }
})


//  ========================== Create Conversation ===================================

app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversation({ members: [senderId, receiverId] })
        await newConversation.save();
        res.status(200).send('Conversation created successfully')
    } catch (err) {
        console.log(err)
    }
})


// ======================================= GET CONVERSATION =============================================
app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await Users.findById(receiverId);
            return { user: { id: user._id, email: user.email, fullName: user.fullName }, conversationId: conversation._id }
        }))
        res.status(200).json(await conversationUserData);
    } catch (err) {
        console.log(err)
    }
})


// =========================================== Create Message ==========================================
app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId } = req.body;
        
        if (!senderId || !message) return res.status(400).send('Please fill all required fields')
        if (conversationId === 'new' && receiverId) {
            const newConversation = new Conversation({ members: [senderId, receiverId] })
            await newConversation.save();
            const newMessage = new Messages({ conversationId: newConversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send({ message: 'Message sent successfully',newMessage });
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields')
        }
        const newMessage = new Messages({ conversationId, senderId, message })
        newMessage.save()
        res.status(200).send({ message: "Message sent successfully", newMessage })
    } catch (error) {
        console.log(err)
    }
})


// ========================================== GET MESSAGE ============================================

app.get('/api/message/:conversationId', async (req, res) => {
    try {

        const checkMessage = async (conversationId) => {
            const messages = await Messages.find({ conversationId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message }
            }));
            res.status(200).json(await messageUserData)
        }

        const conversationId = req.params.conversationId;
        if (conversationId === "new") {
            // console.log('senderId: => ',req.query.senderId)
            // console.log('receiverId: => ',req.query.receiverId)
            const checkConversation = await Conversation.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
            // console.log(checkConversation)
            if (checkConversation.length > 0) {
                checkMessage(checkConversation[0]._id)
            } else {
                return res.status(200).json([]);
            }
            // return res.status(200).json({ conversationId: checkConversation[0]._id })

        } else {
            checkMessage(conversationId);
        }
    } catch (error) {
        console.log(error)
    }
})


// =============================================== GET ALL USERS ===========================================
app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // console.log(userId)
        const users = await Users.find({ _id: { $ne: userId } });
        const userData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.fullName, id: user._id } }
        }));
        res.status(200).json(await userData)
    } catch (error) {
        console.log(error)
    }
})

socketServer.listen(port, () => {
    console.log('listining on port ' + port);
})