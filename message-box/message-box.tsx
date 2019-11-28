import React,{ useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  KeyboardAvoidingView,
  TextInputProps, TouchableWithoutFeedback,
  PanResponder
} from 'react-native';

import {
  GestureHandlerGestureEvent,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  TapGestureHandler, TapGestureHandlerGestureEvent,
  TapGestureHandlerProperties,
  State as GestureStateEnum,
  LongPressGestureHandler, LongPressGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler';

import styled from 'styled-components/native';

import {attachIcon, voiceIcon, sentIcon } from "./assets";

import { VoiceRecordControl } from './voice-record-control'


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
`

const IconContainer = styled.View`
 flex-direction: column;
 justify-content: flex-end;
`

const IconTouchable = styled.TouchableWithoutFeedback``

const IconImage = styled.Image`
  width: 32px;
  height: 32px;
  margin: 8px;
  resizeMode: contain;
`




export interface MessageBoxProps {

}



export const MessageBox: React.FC<MessageBoxProps> = (props) => {
  const [messageText, setMessageText] = useState('')
/*  const gestureEventHandler = (e:TapGestureHandlerGestureEvent) =>{
     console.log('e',e);
    switch (e.nativeEvent.state) {
      case GestureStateEnum.ACTIVE: console.log('_active'); break;
      case GestureStateEnum.BEGAN: console.log('_began'); break;
      case GestureStateEnum.CANCELLED: console.log('_cancelled'); break;
      case GestureStateEnum.END: console.log('_end'); break;
      case GestureStateEnum.FAILED: console.log('_failed'); break;
      case GestureStateEnum.UNDETERMINED: console.log('_undetermined'); break;
    }

  }

  const tapHandlerStateChange = (e:TapGestureHandlerGestureEvent) =>{
    // console.log('tap',e, e.nativeEvent.state);
    switch (e.nativeEvent.state) {
      case GestureStateEnum.ACTIVE: console.log('active'); break;
      case GestureStateEnum.BEGAN: console.log('began'); break;
      case GestureStateEnum.CANCELLED: console.log('cancelled'); break;
      case GestureStateEnum.END: console.log('end'); break;
      case GestureStateEnum.FAILED: console.log('failed'); break;
      case GestureStateEnum.UNDETERMINED: console.log('undetermined'); break;
    }
  }*/

  //console.log('render')
  //const r = useRef()


  return <KeyboardAvoidingView
    behavior="position"
    style={styles.container}
    contentContainerStyle={styles.contentContainer}
    enabled>

    <IconContainer>
    <IconTouchable onPress={()=>{}}>
      <IconImage source={attachIcon}/>
    </IconTouchable>
    </IconContainer>

    <MessageTextInput
      placeholder="Сообщение..."
      multiline={true}
      placeholderTextColor="#a8a8a8"
      onChangeText={setMessageText}
      value={messageText}
    />

   {/* <IconContainer {...panResponder.panHandlers}>
        <IconImage source={messageText.length >  0 ? sentIcon : voiceIcon }/>
    </IconContainer>
*/}

    <VoiceRecordControl/>

  </KeyboardAvoidingView>
}

const styles = StyleSheet.create({
  container:{
    width: '100%'
  },
  contentContainer: {
    flexDirection:'row',
    backgroundColor:'#ffffff'
  }
})
