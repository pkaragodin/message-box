import React, {useState} from "react";
import {Dimensions, Text, View, TouchableWithoutFeedback, Keyboard} from "react-native";
import Modal, { SlideAnimation, ModalContent, BottomModal } from 'react-native-modals';
import styled from "styled-components/native";


const panelHeight = 176;

const Button = styled.View`
width: 100%;
  height: 48px;
  max-height: 48px;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`

const ButtonText = styled.Text`
  font-size: 20px;
  color: #0062FF
`

const PanelContent = styled.View`
        height: ${panelHeight}px;
        width: ${Dimensions.get('screen').width};
        padding-top: 16px;
        padding-bottom: 16px;
        background-color: #ffffff;
`
const Container = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
`

const SearchTextInput = styled.TextInput`
  width: 100%;
  height: 48px;
  background-color: darkseagreen;
`

export interface GiphySelectPanelProps {
  onRequestCloseGiphySelectPanel?: () => void
  isVisible?: boolean;
}

export const GiphySelectPanel: React.FC<GiphySelectPanelProps> = (props) => {
  const [searchTag, setSearchTag] = useState('')
  return <BottomModal
    visible={props.isVisible}
    swipeDirection="down" // can be string or an array
    swipeThreshold={120} // default 100
    onSwipingOut = {()=>{
      //props.onRequestCloseGiphySelectPanel && props.onRequestCloseGiphySelectPanel()
      Keyboard.dismiss();
    }}
    onSwipeOut={(event) => {
      props.onRequestCloseGiphySelectPanel && props.onRequestCloseGiphySelectPanel()
    }}
    height={0.8}
    modalAnimation={new SlideAnimation({
      slideFrom: 'bottom',
    })}
    hardwareAccelerated={true}
  >
    <PanelContent>
      <SearchTextInput
        value={searchTag}
      />

      <Text>Select Panel</Text>
    </PanelContent>
  </BottomModal>
}
