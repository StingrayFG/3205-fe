import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import InputMask from 'react-input-mask';

import { useMessageHandler } from 'hooks/UseMessageHandler';

export default function HomePage () {

  const [testData, setTestData] = useState(''); 
  const [numberInputValue, setNumberInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Используется для анимации спиннера и панели с результатом

  const [messageData, showMessage] = useMessageHandler(1500); // Используется для отображения сообщения
  const [shallMoveInputLabelsData, setShallMoveInputLabelsData] = useState({ // Используется для анимации надписей над / в input
    email: false,
    number: false
  });

  
  const updateNumberInput = (event) => { 
    setNumberInputValue(event.target.value)
  }

  const updateInputLabel = (event) => { // Используется для анимации надписей над / в input
    if((!event.target.value) && (event.type === 'blur')) {
      setShallMoveInputLabelsData({ ...shallMoveInputLabelsData, [event.target.name]: false })
    } else {
      setShallMoveInputLabelsData({ ...shallMoveInputLabelsData, [event.target.name]: true })
    }
  };
  
  const handleSubmit = async (event) => { 
    event.preventDefault();

    const body = { email: event.target.elements.email.value, number: event.target.elements.number.value.replace(/-/g, '') }

    // Проверка почты и номера 
    if (!body.email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) ||
    (!(parseInt(body.number) + '' === body.number))) {
      showMessage('Please enter correct data');
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setTimeout(() => {setTestData('')}, 500) // Ожидание завершение анимации

      await axios.post(process.env.REACT_APP_SERVER_URL + '/test/get', body)
      .then(res => {
        setTestData(res.data);   
      })
      .catch(err => {
        /* Завершаем анимации если код 404. 
        Если же код отличный от 404 (498 в данном случае), анимация не завершается, так как 
        498 возвращается если сервер отменил запрос, в связи с приходом повторного */
        const code = (err.message.slice(err.message.length - 3, err.message.length))
        if (code === '404') { 
          showMessage('Not found');
          setIsLoading(false);
        } else if (code != '498') {
          showMessage('Something went wrong');
          setIsLoading(false);
        }
        setTestData('');
      }); 
    }    
  };

  useEffect(() => { /* Необходимо для избежания отображения ответа на предыдущий запрос 
  при попытке нового запроса с некорректными данными ()*/
    if (!isLoading) {
      setTestData('');
    } else if (testData && isLoading) {
      setIsLoading(false);
    }
  }, [testData])


  return(
    <Box className='w-screen h-screen flex flex-col place-content-center
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
      </form>    
      

      <Box className='w-full max-w-[480px] px-4 mx-auto'>
        <p className={`place-self-center transition-all duration-300 
        text-rose-500 text-center
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
      </Box>
 
    </Box>    
  )
}