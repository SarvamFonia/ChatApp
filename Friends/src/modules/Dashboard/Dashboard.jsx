import React, { useEffect, useRef, useState } from 'react'
import Avatar from '../../assets/avatar.png'
import HomeIcon from '../../assets/house.svg'
import MessageIcon from '../../assets/message.svg'
import UsersIcon from '../../assets/users.svg'
import BackIcon from '../../assets/back.svg'
import Input from '../../components/Input/Input'
import SendBtn from '../../assets/sendBtn.svg'
import { io } from 'socket.io-client'

function Dashboard() {


  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:details')));
  const [conversations, setrConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [consumers, setConsumers] = useState([])
  const windowRef = [useRef(null), useRef(null), useRef(null)]
  const [currentWindow, setCurrentWindow] = useState(0)

  const [socket, setSocket] = useState(null)

  console.log(windowRef)

  console.log(messages)

  useEffect(() => {
    windowRef[currentWindow].current.classList.add('active')
    return () => {
      hideAllWindows()
    }
  }, [currentWindow])

  useEffect(() => {
    const newSocket = io('http://localhost:8800');
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, []);

  useEffect(() => {
    socket?.emit('addUser', user?.id);
    socket?.on('getUsers', users => {
      console.log('activeUsers => ', users);
    });

    socket?.on('getMessage', data => {
      // console.log()
      // setMessages({messages: [...messages?.messageArray, data], receiver: messages?.receiver, conversationID: messages?.conversationID})
      setMessages(prev => ({
        ...prev,
        messageArray: [...prev.messageArray, { user: data.user, message: data.message }]
      }))
    })

    return () => {
      if (socket) {
        socket.off('getUsers')
      }
    }
  }, [socket]);


  const hideAllWindows = () => {
    windowRef.map((r) => {
      r.current.classList.remove('active')
    })
  }

  const sendMessage = async () => {
    debugger;

    const data = {
      conversationId: messages?.conversationID,
      senderId: user?.id,
      message: currentMessage,
      receiverId: messages?.receiver?.id
    }

    socket?.emit('sendMessage', data);

    const res = await fetch(`http://localhost:8000/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    const responseData = await res.json()
    console.log('resData', responseData)
    setCurrentMessage('')
  }

  const fetchMessage = async (conversationID, receiver) => {
    debugger
    // console.log(`http://localhost:8000/api/message/${conversationID}?senderId=${user?.id}&&receiverId=${receiver?.id}`)
    const res = await fetch(`http://localhost:8000/api/message/${conversationID}?senderId=${user?.id}&&receiverId=${receiver?.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const responseData = await res.json();
    setCurrentWindow(1)
    // hideAllWindows()
    // windowRef[1].current.classList.add('active')
    // console.log("Message",responseData)
    setMessages({ messageArray: responseData, receiver, conversationID })
  }
  // console.log('message: ',messages)

  useEffect(() => {

    const fetchConversation = async () => {
      const res = await fetch(`http://localhost:8000/api/conversations/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData = await res.json()
      // console.log(responseData)
      setrConversations(responseData)
    };
    fetchConversation()
  }, [])

  useEffect(() => {
    const fetchConsumers = async () => {
      const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const responseData = await res.json()
      setConsumers(responseData)
    }
    fetchConsumers()
  }, [])

  // console.log(consumers)



  return (
    <>
      {currentWindow !== 1 ?
        <div className=' flex w-[100%] justify-between items-center text-center bg-zinc-900 rounded-t-lg  fixed bottom-0 text-white px-5 py-5'>
          <div className='py-1 px-3 bg-sky-500 rounded-full text-sm flex' onClick={() => { setCurrentWindow(0) }}><img src={HomeIcon} className='mr-1 text-white' width='12px' height='10px' /> Home</div>
          <div className='w-[45px]'><img src={MessageIcon} width='20px' /> </div>
          <div className='w-[45px] cursor-pointer' onClick={() => { setCurrentWindow(2) }}><img src={UsersIcon} width='20px' /> </div>
        </div> : <></>
      }
      <div className='w-screen  flex flex-col md:flex-row '>

        {/* ======================================= Section 1 ======================================================= */}

        <div className='CustomCss w-[100%] md:w-[25%] border-black h-screen bg-black text-white pb-[70px]' ref={windowRef[0]}>
          <div className='flex justify-between items-center bg-zinc-900 p-5'>
            <div className='w-[100%] flex justify-start text-2xl font-semibold'>
              Let's Connect
            </div>
            <div className='border-l-4 w-[5px] h-[20px] cursor-pointer' style={{ 'border-style': 'dotted', }}></div>
          </div>


          <div className='p-5'>
            <div className=''>Messages</div>
            <div>
              {
                conversations.length > 0 ?
                  conversations.map(({ conversationId, user }) => {
                    // console.log(conversations)
                    return (
                      <div className='flex  items-center  cursor-pointer py-5 border-b-2 border-gray-700' onClick={() => { fetchMessage(conversationId, user) }}>
                        <div className='border-2 border-gray-500  rounded-full overflow-hidden'>
                          <img src={Avatar} alt="" width={45} height={45} />
                        </div>

                        <div className='ml-4'>
                          <h3 className='text-md font-medium'>{user.fullName}</h3>
                          <p className='text-sm font-light'>{user.email}</p>
                        </div>

                      </div>
                    )
                  }) : <div className='text-3xl text-blue'>No previous conversation </div>
              }
            </div>
          </div>
        </div>

        {/* ======================================= Section 2 ======================================================= */}
        <div className='CustomCss w-[100%] md:w-[50%] bg-black border-black h-screen flex flex-col items-center' ref={windowRef[1]}>
          <div className='w-[100%] bg-zinc-900   flex items-center px-5 py-3 text-white fixed top-0'>
            <div className='cursor-pointer' onClick={() => { setCurrentWindow(0) }}> <img src={BackIcon} width='15px' className='mr-5' /> </div>
            <img src={Avatar} alt="" width={45} height={45} />
            <h3 className='text-lg ml-5'>{messages?.receiver?.fullName}</h3>
          </div>

          <div className='h-[95vh] pt-[40px] w-full overflow-scroll'>
            <div className='mt-[50px] px-10 py-14'>


              {
                messages?.messageArray?.length > 0 ?
                  messages.messageArray.map(({ message, user: { id } = {} }) => {
                    if (id === user?.id) {
                      return <div className='ml-auto text-end mb-3'>
                        <div className='inline-block max-w-[200px]  w-auto bg-primary m-auto rounded-b-xl rounded-tl-xl  px-3 py-[7px] '>
                          {message}
                        </div>
                      </div>
                    } else {
                      return <div className='inline-block max-w-[200px] w-auto bg-secondary rounded-b-xl rounded-tr-xl px-3 py-[7px] mb-3'>
                        {message}
                      </div>
                    }
                  }) : <></>
              }
            </div>
          </div>

          <div className=' w-full flex px-5 py-5 fixed bottom-0 bg-black'>
            <input placeholder='Message' className='bg-gray-600 text-white w-full rounded-full p-1 px-3' value={currentMessage} onChange={(e) => { setCurrentMessage(e.target.value) }} />
            <button type='text' className='bg-white p-3 cursor-pointer ml-4 rounded-full flex justify-center items-center' onClick={() => { sendMessage() }}><img src={SendBtn} width='20px' /> </button>
          </div>
        </div>

        {/* ======================================= Section 3 ======================================================= */}

        <div className='CustomCss w-[100%] md:w-[25%] border-black h-screen  bg-black text-white pb-[90px] overflow-scroll pt-[70px]' ref={windowRef[2]}>
          <div className='flex justify-between items-center bg-zinc-900 p-5 w-full fixed top-0'>
            <div className='w-[100%] flex justify-start text-2xl font-semibold text-white'>
              Profile
            </div>
            <div className='border-l-4 w-[5px] h-[20px] cursor-pointer' style={{ 'border-style': 'dotted', }}></div>
          </div>

          <div className='w-screen flex flex-col mt-10 mb-5 border-b-2 border-gray-500 pb-10'>
            <span className='border-2 border-gray-500 p-2 rounded-full overflow-hidden m-auto'>
              <img src={Avatar} alt="" width={75} height={75} />
            </span>

            <div className='w-full text-center'>
              <h3 className='text-2xl'>{user?.fullName}</h3>
              <p className='text-lg font-light'>{user?.email}</p>
            </div>
          </div>

          <div className='px-5 pt-5'>Find new friends</div>
          <div className='px-5'>
            {
              consumers.length > 0 ?
                consumers.map(({ user }) => {
                  // console.log(conversations)
                  return (
                    <div className='flex items-center cursor-pointer py-5 border-b-2 border-gray-700' onClick={() => { fetchMessage('new', user) }}>
                      <div className='border-2 border-gray-500  rounded-full overflow-hidden'>
                        <img src={Avatar} alt="" width={45} height={45} />
                      </div>

                      <div className='ml-4'>
                        <h3 className='text-md font-medium'>{user.fullName}</h3>
                        <p className='text-sm font-light'>{user.email}</p>
                      </div>

                    </div>
                  )
                }) : <div className='text-3xl text-blue'>No previous conversation </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard 