import React from 'react'

function Input({
    label = '',
    name = '',
    type = 'text',
    className = '',
    isRequired = false,
    placeholder = '',
    defaultClass = 'flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600 ',
    value='',
    onChange=()=>{},
}) {
    return (
        <div className='text-left w-[100%]'>
            <label htmlFor={name} className="block text-sm/6 font-medium text-gray-900">{label}</label>
            <div className="mt-2">
                <div className={defaultClass+className}>
                    <input type={type} name={name} 
                        id={name} className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6" 
                        placeholder={placeholder} required = {isRequired} 
                        value={value} onChange={onChange}/>
                </div>
            </div>
        </div>
    )
}

export default Input