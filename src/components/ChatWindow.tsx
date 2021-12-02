import React, { useEffect, useRef, useState } from 'react'
import classNames, { Argument } from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'
import { useChatProps } from './ChatContext'

const ChatWindow: React.FC<ChatWindowProps> = () => {
  const { online, settings } = useChatProps()
  const { ...allProps } = useChatProps()
  const [forceUpdater, setForceUpdater] = useState(false) // this is only used to force update the component
  useEffect(() => {
    window.addEventListener('orientationchange', () => setForceUpdater(!forceUpdater))
  }, [])
  let chatMessages = useRef<any>()

  const layout = `layout-${settings.layout || 'docked'}`

  return (
    <div className={classNames('chat-window', { online }, layout, deviceClasses())}>
      <ChatMessages {...useChatProps()} ref={chatMessages} />
      {settings.layout !== 'embedded' ? <ChatInput {...useChatProps()} chatMessages={chatMessages.current} /> : null}
    </div>
  )
}

export default ChatWindow
