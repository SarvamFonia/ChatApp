import React, { useEffect, useRef, useState } from 'react'
import Avatar from '../../assets/avatar.png'
import BackIcon from '../../assets/back.svg'
import SendBtn from '../../assets/sendBtn.svg'
import { io } from 'socket.io-client'
import Loading from '../Loading/Loading'
import { House, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom'

function Dashboard() {


  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:details')));
  const [conversations, setrConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [consumers, setConsumers] = useState([])
  const [currentWindow, setCurrentWindow] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
  const [socket, setSocket] = useState(null)
  const firstload = useRef(false)

  const navigate = useNavigate()

  const SERVER_URL = 'https://chatapp-mp75.onrender.com'

  const [width, setWidth] = useState(window.innerWidth);

  console.log(consumers)

  useEffect(() => {

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() => {
    if (width >= 992) {
      setCurrentWindow(-1)
    }
    return () => {

    }
  }, [currentWindow, width])

  useEffect(() => {

    const newSocket = io(SERVER_URL);
    setSocket(newSocket)
    firstload.current = true

    return () => {
      if (newSocket) {
        newSocket.disconnect()
      }
    }
  }, []);

  useEffect(() => {
    socket?.emit('addUser', user?.id);
    socket?.on('getUsers', users => {
      //  console.log(users,'active users')
      const ids = users.map(item => item.userId);
      setActiveUsers(ids)
    });

    socket?.on('getMessage', data => {
      // debugger;
      console.log('got new message')
      setMessages(prev => ({
        ...prev,
        messageArray: [...(prev.messageArray || []), { user: data.user, message: data.message }]
      }))
    })

    return () => {
      if (socket) {
        socket.off('getUsers')
      }
    }
  }, [socket]);

  const sendMessage = async () => {

    const data = {
      conversationId: messages?.conversationID,
      senderId: user?.id,
      message: currentMessage,
      receiverId: messages?.receiver?.id
    }

    socket?.emit('sendMessage', data);

    const res = await fetch(`${SERVER_URL}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    const responseData = await res.json()

    setMessages(prev => ({
      ...prev,
      conversationID: responseData?.newMessage?.conversationId
    }))
    setCurrentMessage('')
    if (data?.conversationId === 'new') fetchConversation()
    
  }

  const fetchMessage = async (conversationID, receiver) => {
    setLoading(prev => !prev)
    const res = await fetch(`${SERVER_URL}/api/message/${conversationID}?senderId=${user?.id}&&receiverId=${receiver?.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const responseData = await res.json();
    setLoading(prev => !prev)
    setCurrentWindow(1)

    setMessages({ messageArray: responseData, receiver, conversationID })
  }

  const handleKeyDown = (e) => { 
    if (e.key === "Enter" ) {
      sendMessage();
    }
  };

  const fetchConversation = async () => {
    setLoading(prev => !prev)
    const res = await fetch(`${SERVER_URL}/api/conversations/${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseData = await res.json()

    setLoading(prev => !prev)
    setrConversations(responseData)
  };

  useEffect(() => {
    fetchConversation()
  }, [])

  useEffect(() => {
    const fetchConsumers = async () => {
      setLoading(prev => !prev)
      const res = await fetch(`${SERVER_URL}/api/users/${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const responseData = await res.json()
      setLoading(prev => !prev)
      setConsumers(responseData)
    }
    fetchConsumers()
  }, [])




  return (
    <>

      {
        loading ? <Loading /> : <></>
      }

      {currentWindow !== 1 && currentWindow != -1 ?
        <div className=' flex w-[100%] h-[72px] justify-between items-center text-center bg-[#620576] rounded-t-lg  fixed bottom-0 text-white px-5 py-5'>
          <div className='w-[45px] cursor-pointer' onClick={() => { setCurrentWindow(0) }}>
            {/* <img src={HomeIcon} width='20px' className='ml-3'  height='10px' />  */}
            <House />
          </div>
          {/* <div className='w-[45px]'><img src={MessageIcon} width='20px' /> </div> */}
          <div className='w-[45px] cursor-pointer' onClick={() => { setCurrentWindow(2) }}>
            {/* <img src={UsersIcon} width='20px' /> </div> */}
            <Users />
          </div>
        </div> : <></>
      }
      <div className='w-screen  flex flex-col md:flex-row '>

        {/* ======================================= Section 1 ======================================================= */}
        {
          currentWindow == 0 || currentWindow == -1 ? <div className='CustomCss w-[100%] md:w-[25%] border-black h-screen bg-white text-black pb-[70px]' >
            <div className='flex justify-between items-center bg-[#620576] text-white p-5'>
              <div className='w-[100%] flex justify-start text-2xl font-semibold'>
                Let's Connect
              </div>
              <div></div>
              {/* <div className='border-l-4 w-[5px] h-[20px] cursor-pointer' style={{ 'borderStyle': 'dotted', }}></div> */}
            </div>

            <div className='p-5'>
              <div className=''>Messages</div>
              <div>
                {
                  conversations.length > 0 ?
                    conversations.map(({ conversationId, user }) => {

                      return (
                        <div className='flex  items-center  cursor-pointer py-5 border-b-2 border-[#d2d2d2]' onClick={() => { fetchMessage(conversationId, user) }}>
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
          </div> : <></>}


        {/* ======================================= Section 2 ======================================================= */}

        {currentWindow == 1 || currentWindow == -1 ? <div className='CustomCss w-[100%] md:w-[50%] bg-black border-black h-screen flex flex-col items-center' >
          <div className='w-[100%] h-[72px] bg-[#620576]  flex items-center px-5 py-3 text-white fixed top-0'>
            {
              width < 768 ?
                <div className='cursor-pointer' onClick={() => { setCurrentWindow(0) }}>
                  <img src={BackIcon} width='15px' className='mr-5' />
                </div>
                : null
            }


            <img src={Avatar} alt="" width={45} height={45} />
            <h3 className='text-lg ml-5'>{messages?.receiver?.fullName}</h3>
          </div>

          <div className='h-[90vh] pt-[40px] w-full overflow-scroll hideScroll bg-[#f5f5f5]'>
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
                      return <div className='ml-auto text-start mb-3'>
                        <div className='inline-block max-w-[200px] w-auto bg-secondary rounded-b-xl rounded-tr-xl px-3 py-[7px] mb-3'>
                          {message}
                        </div>
                      </div>
                    }
                  }) : <></>
              }
            </div>
          </div>

          <div className=' w-full flex px-5 py-5 static bottom-0 bg-[#f5f5f5]'>
            <input placeholder='Message' className='bg-white text-black w-full rounded-full p-1 px-3' onKeyDown={handleKeyDown} value={currentMessage} onChange={(e) => { setCurrentMessage(e.target.value) }} />
            <button type='text' className='bg-white p-3 cursor-pointer ml-4 rounded-full flex justify-center items-center' onClick={() => { sendMessage() }}><img src={SendBtn} width='20px' /> </button>
          </div>
        </div> : <></>}



        {/* ======================================= Section 3 ======================================================= */}

        {currentWindow == 2 || currentWindow == -1 ?
          <div className='CustomCss w-[100%] md:w-[25%] border-black h-screen  bg-white text-black pb-[90px] overflow-scroll pt-[70px] hideScroll' >
            <div className='flex justify-between items-center bg-[#620576] p-5 w-full fixed top-0'>
              <div className='w-[100%] flex justify-start text-2xl font-semibold text-white'>
                Profile
              </div>
              <div className='border-l-4 w-[5px] h-[20px] cursor-pointer' style={{ 'borderStyle': 'dotted', }}></div>
            </div>

            <div className='w-full flex flex-col mt-10 mb-5 border-b-2 border-[#d2d2d2] pb-2'>
              <span className='border-2 border-[#d2d2d2] p-2 rounded-full overflow-hidden m-auto'>
                <img src={Avatar} alt="" width={75} height={75} />
              </span>

              <div className='w-full text-center'>
                <h3 className='text-2xl'>{user?.fullName}</h3>
                <p className='text-lg font-light'>{user?.email}</p>
              </div>

              <div className='flex justify-end text-[#c848e2] cursor-pointer pt-[10px] mr-4'>
                <span onClick={() => {
                  localStorage.removeItem('user:token')
                  localStorage.removeItem('user:details')
                  navigate('users/sign_in')
                }}>Logout</span>
              </div>
            </div>

            <div className='px-5 pt-5'>Find new friends</div>
            <div className='px-5'>
              {
                consumers.length > 0 ?
                  consumers.map(({ user }) => {

                    return (
                      <div className='flex items-center justify-between cursor-pointer py-5 border-b-2 border-[#d2d2d2]' onClick={() => { fetchMessage('new', user) }}>

                        <div className='flex flex-row'>
                          <div className='border-2 border-gray-500  rounded-full overflow-hidden'>
                            <img src={Avatar} alt="" width={45} height={45} />
                          </div>

                          <div className='ml-4'>
                            <h3 className='text-md font-medium'>{user.fullName}</h3>
                            <p className='text-sm font-light'>{user.email}</p>
                          </div>
                        </div>
                        <div className='flex'>
                          <div className={`flex rounded-[100%] h-3 w-3 ${activeUsers.includes(user.id) ? 'bg-green-500' : 'bg-red-600'} `}></div>
                        </div>

                      </div>
                    )
                  }) : <div className='text-3xl text-blue'>No previous conversation </div>
              }
            </div>
          </div> : <></>}


      </div>
    </>
  )
}

export default Dashboard 