import React, {useState, useRef, Fragment} from 'react';
import {
  StyleSheet, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, View, Platform, TextInput
} from 'react-native';



import styled from 'styled-components/native';

import { VoiceRecordControl } from './voice-record-control'

import { PickerControl  } from './picker-control'
import {sendIcon, sendIconWhite} from "./assets";
import {BorderlessButton} from "react-native-gesture-handler";
import { GiphyControl } from './giphy-control'


const Container = styled.View`
  width: 100%;
  min-height: 48px;
  background-color: #ffffff;
`

const MessageTextInput = Platform.select({
  ios:styled.TextInput`
  flex: 1;
  margin: 0;
  padding: 0;
  font-size: 14px;
  line-height: 16px;
  min-height: 48px;
  align-items: center;
  
  padding-top: 16px;
  padding-bottom: 16px;
  padding-left: 4px;
  padding-right: 4px;
`,
  android: styled.TextInput`
  flex: 1;
  margin: 0;
  padding: 0;
  font-size: 14px;
  line-height: 16px;
  min-height: 48px;
  align-items: center;
  
  padding-left: 4px;
  padding-right: 4px;
  border: none;
`
})


const ButtonContainer = styled.View`
 flex-direction: column;
 justify-content: flex-end;
`

const IconImage = styled.Image`
  width: 32px;
  height: 32px;
  margin: 8px;
  resizeMode: contain;
`
const SendButtonContainer = styled(BorderlessButton)`
  width: 48px;
  height: 48px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 4px;
`
const SendIconContainer=styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  padding: 4px;
  background-color: #0062FF;
  align-items: center;
  justify-content: center;
`

const AndroidWrapper: React.FC = ({ children })=>{
  if(Platform.OS === 'android')
    return <View style={{ width: '100%' }}>{children}</View>
  return <Fragment>{children}</Fragment>
}


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


enum MessageBoxStatusEnum{
  DEFAULT = 'default',
  VOICE = 'voice',
  PICKER = 'picker',
}

export interface MessageBoxProps {
  onSendMessage: (message:BaseMessageInterface) => void
}

export const MessageBox: React.FC<MessageBoxProps> = ({ onSendMessage }) => {
  const textInputRef = React.createRef<TextInput>()
  const [status, setStatus] = useState<MessageBoxStatusEnum>(MessageBoxStatusEnum.DEFAULT)
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
  const handleChangeStatusVoiceActive = () =>
    status!==MessageBoxStatusEnum.VOICE && setStatus(MessageBoxStatusEnum.VOICE)
  const handleChangeStatusDefault = () =>
    status!==MessageBoxStatusEnum.DEFAULT && setStatus(MessageBoxStatusEnum.DEFAULT)
  return <AndroidWrapper>
    <KeyboardAvoidingView
    behavior="position"
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
    enabled>

    <PickerControl onPicked={handlePickImageOrVideo}/>

      {status === MessageBoxStatusEnum.DEFAULT ?
      <MessageTextInput
        ref={textInputRef}
        placeholder="Сообщение..."
        multiline={true}
        onSubmitEditing={Keyboard.dismiss}
        placeholderTextColor="#a8a8a8"
        onChangeText={setMessageText}
        value={messageText}
      /> : <View style={{ flex: 1}}/>}

      {messageText.length === 0 && <GiphyControl/> }


    <ButtonContainer>
    {messageText.length > 0 ?
      <SendButtonContainer onPress={handlePressSendTextMessage}>
        <SendIconContainer>
          <IconImage source={sendIconWhite}/>
        </SendIconContainer>
      </SendButtonContainer>
      :
      <VoiceRecordControl
        onActive={handleChangeStatusVoiceActive}
        onPassive={handleChangeStatusDefault}
        onSendMessage={onSendMessage}
      />
    }
    </ButtonContainer>
  </KeyboardAvoidingView>
  </AndroidWrapper>

}

const styles = StyleSheet.create({
  container:{
    width: '100%',
  },
  contentContainer: {
    flexDirection:'row',
    backgroundColor:'#ffffff',
  }
})
