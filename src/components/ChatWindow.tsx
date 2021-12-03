import React, { useEffect, useRef, useState } from 'react'
import classNames, { Argument } from 'classnames'

import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import { deviceClasses } from '../common/util'
import { useChatProps, useChatPropsUpdate } from './ChatContext'
import { update } from 'lodash'

const ChatWindow: React.FC = () => {
  const { online, settings } = useChatProps()
  const { ...allProps } = useChatProps()
  const [forceUpdater, setForceUpdater] = useState(false) // this is only used to force update the component
  useEffect(() => {
    window.addEventListener('orientationchange', () => setForceUpdater(!forceUpdater))
  }, [])
  const layout = `layout-${settings.layout || 'docked'}`
  const { scrollToBottom } = useChatProps()
  return (
    <div className={classNames('chat-window', { online }, layout, deviceClasses())}>
      <ChatMessages {...allProps} />
      {settings.layout !== 'embedded' ? <ChatInput {...allProps} scrollToBottom={scrollToBottom} /> : null}
    </div>
  )
}

export default ChatWindow
