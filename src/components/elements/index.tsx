import React from 'react'

import Text from './Text'
import { ImageMedia, WebMedia, AudioMedia, VideoMedia, FileMedia } from './Media'
import Template from './Template'
import Location from './Location'
import { Payload } from './types'
import Message from './types'
import { ChatHandler } from 'components'

interface AttributesProp {
  className: string
  message: Message<Payload>
  handler: ChatHandler
  onLoad: (() => void) | null
  toggleModalPreferHeight: ((condition: boolean) => void) | null
  modalParams?: { index?: number }
  settings: Record<string, any>
  localePrefs: string[]
}

type MessageProp = Message<Payload>

export default function elementFactory({ type, payload }: MessageProp, attrs: AttributesProp): React.FC {
  let element: any = null
  if (type === 'text') {
    element = <Text {...attrs} />
  }

  if (type === 'media' && payload.kind === 'image') {
    element = <ImageMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'web') {
    element = <WebMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'audio') {
    element = <AudioMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'video') {
    element = <VideoMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'file') {
    element = <FileMedia {...attrs} />
  }

  if (type === 'template') {
    element = <Template {...attrs} />
  }

  if (type === 'location') {
    element = <Location {...attrs} />
  }

  return element
}
