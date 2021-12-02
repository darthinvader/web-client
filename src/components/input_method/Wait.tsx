import React, { useState, useEffect } from 'react'
import InputMethodContainer from './InputMethodContainer'
import { buttonClick } from '../elements/Template'
import { Closed } from '../icons'
import { fixedLabel } from '../../common/labels'
import { TextUtil } from '@botsquad/sdk'
import { useInputMethodProps, useInputMethodPropsUpdate } from './InputMethodContext'

interface renderImplicitCloseButtonProps {
  type: string
}

const renderImplicitCloseButton: React.FC<renderImplicitCloseButtonProps> = props => {
  const { handler, localePrefs } = useInputMethodProps()

  if (props.type !== 'closed') {
    return null
  }
  const { closeConversation } = handler.component.props
  if (!closeConversation) {
    return null
  }

  return <button onClick={closeConversation}>{fixedLabel('new_conversation', localePrefs)}</button>
}

function renderButton(button, props) {
  if (!button) return null

  const onClick = payload =>
    props.inputModal.finish('message', { type: 'wait', text: button.title, data: { event: payload } }, props.config)

  return <button onClick={() => buttonClick(button, props.handler, onClick)}>{button.title}</button>
}

function pad(n: number, char = '0') {
  return (n < 10 ? char : '') + Math.floor(n)
}

function formatTime(waitTime: number, total: number) {
  const delta = total - waitTime
  return (
    <span className="time">
      {pad(delta / 60, '')}:{pad(delta % 60)}
    </span>
  )
}

interface WaitProps {
  type: string
  time: number
}

const Wait: React.FC<WaitProps> = props => {
  const { config, inputModal } = useInputMethodProps()
  const updateValues = useInputMethodPropsUpdate()

  const { type, time } = props

  const { description, wait_time, button } = config
  const [waitTime, setWaitTime] = useState(0)

  const tick = () => {
    if (!wait_time || waitTime < 0) return

    const delta = Math.floor((new Date().getTime() - time) / 1000)

    if (delta > wait_time) {
      setWaitTime(-1)
      inputModal!.finish('message', { type: 'wait', text: 'Timeout', data: { timeout: true } }, config)
    } else {
      setWaitTime(delta)
    }
  }

  useEffect(() => {
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    updateValues('inline', type === 'closed')
  }, [type])

  return (
    <InputMethodContainer
      {...props}
      className="wait"
      below={renderButton(button, props) || renderImplicitCloseButton(props)}
    >
      {type === 'wait' && typeof wait_time !== 'undefined' && <div className="loader" />}

      {props.type === 'closed' ? <span className="closed">{Closed}</span> : null}

      {description ? <div className="description" dangerouslySetInnerHTML={TextUtil.processText(description)} /> : null}

      {wait_time && waitTime >= 0 ? formatTime(waitTime, wait_time) : null}
    </InputMethodContainer>
  )
}

export default Wait
