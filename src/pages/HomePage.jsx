import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import InputMask from 'react-input-mask';

import { useMessageHandler } from 'hooks/UseMessageHandler';

export default function HomePage () {

  const [testData, setTestData] = useState('');
  const [numberInputValue, setNumberInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messageData, showMessage] = useMessageHandler(1500);
  const [shallMoveInputLabelsData, setShallMoveInputLabelsData] = useState({
    email: false,
    number: false
  });

  
  const updateNumberInput = (event) => {
    setNumberInputValue(event.target.value)
  }

  const updateInputLabel = (event) => {
    if((!event.target.value) && (event.type === 'blur')) {
      setShallMoveInputLabelsData({ ...shallMoveInputLabelsData, [event.target.name]: false })
    } else {
      setShallMoveInputLabelsData({ ...shallMoveInputLabelsData, [event.target.name]: true })
    }
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    const body = { email: event.target.elements.email.value, number: event.target.elements.number.value.replace(/-/g, '') }

    if (!body.email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) ||
    (!(parseInt(body.number) + '' === body.number))) {
      showMessage('Please enter correct data');
    } else {
      setIsLoading(true);
      setTimeout(() => {setTestData('')}, 500)

      await axios.post(process.env.REACT_APP_SERVER_URL + '/test/get', body)
      .then(res => {
        setTestData(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        const code = (err.message.slice(err.message.length - 3, err.message.length))
        if (code === '404') {
          showMessage('Not found');
          setIsLoading(false);
        }
      }); 
    }    
  };

  return(
    <Box className='w-screen h-screen grid
    bg-gray-900'>
      <form className='w-full max-w-[480px] -mt-6 px-4 py-4 
      grid place-self-center'
      onSubmit={handleSubmit} 
      onChange={updateInputLabel}
      onFocus={updateInputLabel}
      onBlur={updateInputLabel}>

        <Box>
          <p className={`h-6 absolute pointer-events-none transition-all duration-300
          ${shallMoveInputLabelsData.email ? 'mt-4 font-semibold' : 'mt-14 ml-4 opacity-50'}`}>Email</p>

          <input className='w-full h-12 px-4 mt-12'
            name='email'
            type='text'/>

          <p className={`h-6 absolute pointer-events-none transition-all duration-300
          ${shallMoveInputLabelsData.number ? 'mt-4 font-semibold' : 'mt-14 ml-4 opacity-50'}`}>Number</p>

          <InputMask className='w-full h-12 px-4 mt-12'
            name='number'
            type='text'
            mask='99-99-99' 
            
            value={numberInputValue}
            onChange={updateNumberInput}/>
        </Box>
        
        <button className='w-full h-12 mt-12 grid text-neutral-200
        bg-sky-300/10 hover:bg-sky-300/20 border-0'>
          <p className='place-self-center font-semibold'>Submit</p>
        </button >

        <p className={`mt-4 place-self-center transition-all duration-300 text-rose-500
        ${messageData.isShowing ? 'opacity-100': 'opacity-0'}`}>
          {messageData.message ?  messageData.message : '_'}
        </p>    

        <Box className={`min-h-32 mt-4 relative grid place-content-center
        text-neutral-200`}>
          <pre className={`absolute p-4 w-full
          transition-all duration-500
          bg-black/30 rounded-lg
          ${(isLoading || !testData) ? 'opacity-0' : 'opacity-100'}`}>
            {JSON.stringify(testData, null, 2)}
          </pre> 

          <CircularProgress className={`transition-all duration-500
          ${isLoading ? 'opacity-100' : 'opacity-0'}`}/>
        </Box>
            
      </form>     
    </Box>    
  )
}