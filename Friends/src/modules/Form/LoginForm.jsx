import React, { useState } from 'react'
import Input from '../../components/Input/Input'
import { useNavigate } from 'react-router-dom'

function LoginForm({ isSignIn = true }) {
  
  const navigate = useNavigate()

  const [data, setData] = useState({
    ...(!isSignIn && {
      fullName: ''
    }),
    email: '',
    password: ''
  })

  const handelLogin = async(e) => {
    e.preventDefault()
    const res = await fetch(`https://chatapp-mp75.onrender.com/api/${isSignIn ? 'login' : 'register'}`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if(res.status === 400){
      alert('Invalid Credential')
    }else{
      const responseData = await res.json()

      if(responseData.token){
        localStorage.setItem('user:token',responseData.token);
        localStorage.setItem('user:details',JSON.stringify(responseData.user) );
        navigate('/')
      }
    }
    
    // console.log("data => ",responseData)
    
  }
  return (
    <div className='h-screen flex justify-center items-center'>
      <div className='bg-white w-[600px] h-[800px] shadow-lg flex flex-col justify-center items-center' >
        <div className='text-4xl font-extrabold'>Welcome</div>
        <div className='text-xl font-light mb-10'>{isSignIn ? 'Sign-in now to get explored' : 'Sign-up now to get started'}</div>
        <form className='w-[50%]' onSubmit={handelLogin}>
          {!isSignIn && <Input label='Full Name' name='name' placeholder='Enter your name' className='mb-4'
            value={data.fullName} isRequired={true} onChange={(e) => { setData({ ...data, fullName: e.target.value }) }} />}

          <Input label='Email' name='email' placeholder='Enter your email' className='mb-4' type='email'
            value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} isRequired={true} />

          <Input label='Password' name='password' placeholder='Enter your password' type='password' className='mb-4'
            value={data.password} onChange={(e) => { setData({ ...data, password: e.target.value }) }} isRequired={true} />
          <button className='bg-primary p-2 text-white w-[100%] rounded-md mb-6'>{isSignIn ? 'Sign-in' : 'Sign-up'}</button>
        
        
        </form>
        <div>{isSignIn ? "Did'nt have an account" : 'Already have an account?'}
          <span className='text-primary cursor-pointer underline' onClick={() => { navigate(`/users/${isSignIn ? "sign_up" : "sign_in"}`); }}>
            {isSignIn ? 'Sign-up' : 'Sign-in'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoginForm