import { useState, useEffect } from 'react';

export function useMessageHandler (presetPeriod = 1500) {

  const [messageData, setMessageData] = useState({
    text: '',
    type: undefined,
    isShowing: false,
    lastShown: 0
  });
  const [shallHideMessage, setShallHideMessage] = useState(false);
  const [lastUsedPeriod, setLastUsedPeriod] = useState(0);

  const showMessage = (message, period, type) => {
    setMessageData({
      message: message,
      type: type,
      isShowing: true,
      lastShown: Date.now()
    });
    setLastUsedPeriod(period ? period : presetPeriod);
    setTimeout(() => {hideMessage()}, period ? period : presetPeriod);
  }

  const hideMessage = () => {
    if (Date.now() - messageData.lastShown > lastUsedPeriod) {
      setShallHideMessage(true);
    } 
  }

  useEffect(() => {
    if (shallHideMessage) {
      setMessageData({ ...messageData, isShowing: false });
      setShallHideMessage(false);
    } 
  }, [shallHideMessage])


  return [messageData, showMessage];
}