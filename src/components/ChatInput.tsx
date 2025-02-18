import React, { useEffect, useState } from 'react'
import debounce from 'lodash/debounce'

import { ImageUpload, AudioUpload, FileUpload, LocationShare, Arrow, More, Close } from './icons'
import { isiOS } from '../common/util'
import ChatInputModalWrapper from './ChatInputModalWrapper'
import { chatMessagesEvents } from './ChatMessages'
import { chatLabel } from '../common/labels'
import { useChatProps, useChatPropsUpdate } from './ChatContext'

const ChatInput: React.FC = () => {
  const [hasMessage, setHasMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [inputFocus, setInputFocus] = useState(false)
  const [menuOpen, setMenuOpen] = useState<any>(null)
  const [_blurrer, set_Blurrer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const updater = useChatPropsUpdate()

  const inputDiv = React.createRef<HTMLDivElement>()
  const input = React.createRef<HTMLInputElement>()

  const { scrollToBottom, handler, settings, online, localePrefs, inputMethodOverride } = useChatProps()
  const showLocationInput = () => {
    updater({
      inputMethodOverride: {
        type: 'location',
        payload: { zoom: 12, height: 'compact' },
      },
    })

    setMenuOpen(false)
  }

  useEffect(() => {
    if (
      menuOpen === false &&
      inputMethodOverride &&
      inputMethodOverride.type === 'location' &&
      inputMethodOverride.payload.zoom === 12 &&
      inputMethodOverride.payload.height === 'compact' &&
      scrollToBottom
    ) {
      scrollToBottom()
    }
  }, [inputMethodOverride, menuOpen])

  const sendMessage = () => {
    const newMessage = message.trim()
    if (newMessage.length > 0 && handler) {
      handler.send('message', { text: newMessage, input_type: 'keyboard' })
    }
    setMessage('')
    setHasMessage(false)
    if (input.current && settings) {
      const { alwaysFocus } = settings
      if (alwaysFocus) {
        input.current.focus()
      } else {
        input.current.blur()
      }
    }
  }

  useEffect(() => {
    if (message === '' && !hasMessage && scrollToBottom) {
      scrollToBottom()
    }
  }, [message, hasMessage])

  const sendTypingFactory = (payload: any) => {
    return () => {
      if (handler) {
        handler.send('typing', payload)
      }
    }
  }

  const sendTypingOn = debounce(sendTypingFactory(true), 1000, { leading: true, trailing: false })
  const sendTypingOff = debounce(sendTypingFactory(false), 1000, { leading: false, trailing: true })

  const onChange = (e: any) => {
    const message = e.target.value
    setMessage(message)
    setHasMessage(message.trim().length > 0)
  }

  const onKeyUp = (e: any) => {
    let layout = ''
    if (settings) layout = settings.layout
    if (scrollToBottom) {
      scrollToBottom()
    }

    if (e.keyCode === 13) {
      sendTypingOn.cancel()
      sendTypingOff.flush()
      sendMessage()
    } else {
      sendTypingOn()
      sendTypingOff()
    }

    if (e.keyCode === 27) {
      if (layout !== 'embedded' && handler) {
        if (handler.component.props.onClose) {
          handler.component.props.onClose()
        }
      } else {
        setMessage('')
        setHasMessage(false)
        setMenuOpen(false)
      }
    }
  }

  const onFocus = () => {
    if (_blurrer) {
      clearTimeout(_blurrer)
      set_Blurrer(null)
    }
    setInputFocus(true)
  }

  const onBlur = () => {
    set_Blurrer(
      setTimeout(() => {
        setInputFocus(false)
        set_Blurrer(null)
      }, 200),
    )
  }

  const upload = (accept: string) => {
    if (handler)
      handler.component.uploader.trigger(accept, (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
          alert('File is too large, please select a smaller file.')
          return
        }
        handler.sendFile(file)
        if (scrollToBottom) {
          scrollToBottom()
        }
        setMenuOpen(false)
      })
  }

  const isDisabled = (item: string | number) => {
    if (settings) return settings.chat_config.disabled_inputs?.indexOf(item) >= 0
    return false
  }

  const onInputFocus = () => {
    chatMessagesEvents.emit('scrollToBottom')
    setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 200)
    setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 500)
    if (!isiOS()) return
    if (inputDiv && inputDiv.current) {
      const mb = inputDiv.current.style.marginBottom
      inputDiv.current.style.marginBottom = mb === '-1px' ? '0' : '-1px'
    }
  }

  const onInputBlur = () => {
    if (!isiOS()) return
    setTimeout(() => {
      if (inputDiv && inputDiv.current) {
        const mb = inputDiv.current.style.marginBottom
        inputDiv.current.style.marginBottom = mb === '-1px' ? '0' : '-1px'
      }
    }, 10)
  }

  const renderDocked = () => {
    return (
      <ChatInputModalWrapper
        handler={handler}
        cancelLabel={chatLabel(settings as { ui_labels: any }, localePrefs, 'cancel')}
      >
        {operatorActive => (
          <div className="chat-input docked" ref={inputDiv}>
            <div className="input">
              {!isDisabled('text') || operatorActive ? (
                <input
                  type="text"
                  value={message}
                  readOnly={!online}
                  placeholder={chatLabel(settings as { ui_labels: any }, localePrefs, 'text_input_placeholder')}
                  ref={input}
                  onFocus={() => onInputFocus()}
                  onBlur={() => onInputBlur()}
                  onKeyUp={e => onKeyUp(e)}
                  onChange={e => onChange(e)}
                />
              ) : null}
            </div>
            {!hasMessage && (operatorActive || !isDisabled('location')) ? (
              <button disabled={!online} onClick={() => showLocationInput()}>
                {LocationShare}
              </button>
            ) : null}
            {!hasMessage && !isDisabled('image') ? (
              <button disabled={!online} onClick={() => upload('image/*,video/*')}>
                {ImageUpload}
              </button>
            ) : null}

            {hasMessage || (isDisabled('image') && isDisabled('location')) ? (
              <button
                className={`send ${hasMessage ? 'has-message' : ''}`}
                disabled={!online || !hasMessage}
                onClick={() => sendMessage()}
              >
                {Arrow}
              </button>
            ) : null}
          </div>
        )}
      </ChatInputModalWrapper>
    )
  }

  const renderEmbedded = () => {
    return (
      <ChatInputModalWrapper
        handler={handler}
        cancelLabel={chatLabel(settings as { ui_labels: any }, localePrefs, 'cancel')}
      >
        {operatorActive => (
          <div className={`chat-input embedded ${menuOpen ? 'menu-open' : ''} ${inputFocus ? 'input-focus' : ''}`}>
            <div className="input-menu">
              <span className="menu">
                {menuOpen ? (
                  <button onClick={() => setMenuOpen((prev: boolean) => !prev)}>{menuOpen ? Close : More}</button>
                ) : null}
                <button disabled={!online} onClick={() => showLocationInput()}>
                  {LocationShare}
                </button>
                <button disabled={!online} onClick={() => upload('image/*,video/*')}>
                  {ImageUpload}
                </button>
                <button disabled={!online} onClick={() => upload('*/*')}>
                  {FileUpload}
                </button>
                <button disabled={!online} onClick={() => upload('audio/*')}>
                  {AudioUpload}
                </button>
              </span>
              {!menuOpen ? (
                <button onClick={() => setMenuOpen((prev: boolean) => !prev)}>{menuOpen ? Close : More}</button>
              ) : null}
            </div>

            {!isDisabled('text') || operatorActive ? (
              <div className="input">
                <input
                  type="text"
                  value={message}
                  readOnly={!online}
                  placeholder={chatLabel(settings as { ui_labels: any }, localePrefs, 'text_input_placeholder')}
                  ref={input}
                  onKeyUp={e => onKeyUp(e)}
                  onFocus={() => onFocus()}
                  onBlur={() => onBlur()}
                  onChange={e => onChange(e)}
                />
                <button
                  className={`send ${hasMessage ? 'has-message' : ''}`}
                  disabled={!online}
                  onClick={() => sendMessage()}
                >
                  {Arrow}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </ChatInputModalWrapper>
    )
  }
  if (settings) {
    const { layout } = settings
    return layout === 'embedded' ? renderEmbedded() : renderDocked()
  } else {
    return null
  }
}
export default ChatInput
