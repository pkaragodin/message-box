import React,{ useState, useRef } from 'react';
import {
  StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, View
} from 'react-native';


import styled from 'styled-components/native';

import { VoiceRecordControl } from './voice-record-control'

import { PickerControl  } from './picker-control'
import {sendIcon} from "./assets";



const Container = styled.View`
  width: 100%;
  min-height: 48px;
  background-color: #ffffff;
`

const MessageTextInput = styled.TextInput`
  flex: 1;
  padding-top: 16px;
  padding-bottom: 16px;
  font-size: 14px;
  line-height: 16px;
  min-height: 48px;
`

const IconContainer = styled.View`
 flex-direction: column;
 justify-content: flex-end;
`

const IconImage = styled.Image`
  width: 32px;
  height: 32px;
  margin: 8px;
  resizeMode: contain;
`

export enum MessageType{
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice',
  TEXT = 'text'
}

export interface BaseMessageInterface {
  type: MessageType
}

export interface ImageMessageInterface extends BaseMessageInterface{
  type: MessageType.IMAGE
  width: number;
  height:number;
  uri: string;
}

export interface VideoMessageInterface extends BaseMessageInterface{
  type: MessageType.VIDEO
  width: number;
  height:number;
  uri: string;
  duration: number;
}

export interface TextMessageInterface extends BaseMessageInterface {
  type: MessageType.TEXT
  text: string
}

export interface VoiceMessage extends BaseMessageInterface{
  type: MessageType.VOICE
  uri: string;
  duration: number;
}


export interface MessageBoxProps {
  onSendMessage: (message:BaseMessageInterface) => void
}

export const MessageBox: React.FC<MessageBoxProps> = ({ onSendMessage }) => {
  const [messageText, setMessageText] = useState('')
  const handlePickImageOrVideo = (payload: ImageMessageInterface | VideoMessageInterface) =>{
      onSendMessage && onSendMessage(payload);
  }
  const handlePressSendTextMessage = () => {
    Keyboard.dismiss();
    const message: TextMessageInterface = {
      type: MessageType.TEXT,
      text: messageText
    }
    onSendMessage && onSendMessage(message)
  }
  return <KeyboardAvoidingView
    behavior="position"
    style={styles.container}
    //keyboardVerticalOffset={0}
    contentContainerStyle={styles.contentContainer}
    enabled>

    <PickerControl onPicked={handlePickImageOrVideo}/>


    <MessageTextInput
      placeholder="Сообщение..."
      multiline={true}
      placeholderTextColor="#a8a8a8"
      onChangeText={setMessageText}
      value={messageText}
    />

    {messageText.length > 0 ?
      <TouchableWithoutFeedback onPress={handlePressSendTextMessage}>
        <IconContainer>
          <IconImage source={sendIcon}/>
        </IconContainer>
      </TouchableWithoutFeedback>
      :
      <VoiceRecordControl onSendMessage={onSendMessage}/>
    }
  </KeyboardAvoidingView>

}

const styles = StyleSheet.create({
  container:{
    width: '100%',

  },
  contentContainer: {
    flexDirection:'row',
    backgroundColor:'#ffffff',
    zIndex: 10000,
  }
})
