import React, {useState, useEffect, useRef, RefForwardingComponent, ForwardRefExoticComponent} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import styled from "styled-components/native";

import {BorderlessButton} from 'react-native-gesture-handler';
import {giphyIcon, sendIcon} from "../assets";
import { GiphySelectPanel } from './giphy-select-panel'

const Container = styled.View`
 flex-direction: column;
 justify-content: flex-end;
`

const Button = styled(BorderlessButton)``

const IconImage = styled.Image`
  width: 32px;
  height: 32px;
  margin: 8px;
  resizeMode: contain;
`


export interface GiphyControlProps {

}

export const GiphyControl:React.FC<GiphyControlProps> = () =>{
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const handleClosePanel = ()=> setIsPanelVisible(false)
  const handleOpenPanel = () => setIsPanelVisible(true)
  return <Container>
    <Button onPress={handleOpenPanel}>
    <IconImage source={giphyIcon}/>
    </Button>
    <GiphySelectPanel
      isVisible={isPanelVisible}
      onRequestCloseGiphySelectPanel={handleClosePanel}
    />
  </Container>
}
