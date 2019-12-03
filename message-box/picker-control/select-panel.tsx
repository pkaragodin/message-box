import React from "react";
import { Dimensions, Text, View, TouchableWithoutFeedback} from "react-native";
import Modal, { SlideAnimation, ModalContent, BottomModal } from 'react-native-modals';
import styled from "styled-components/native";


const panelHeight = 176;

const ButtonTouchable = styled(TouchableWithoutFeedback)`
`
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

export interface SelectPanelProps {
  onRequestToggleSelectPanel: () => void
  onRequestCamera: () => void
  onRequestCameraRoll: () => void
  isVisible?: boolean;
}

export const SelectPanel: React.FC<SelectPanelProps> = (props) =>
  <BottomModal
    visible={props.isVisible}
    swipeDirection="down" // can be string or an array
    swipeThreshold={80} // default 100
    onSwipeOut={(event) => {
      props.onRequestToggleSelectPanel && props.onRequestToggleSelectPanel()
    }}
    height={panelHeight}
    modalAnimation={new SlideAnimation({
      slideFrom: 'bottom',
    })}
    hardwareAccelerated={true}
  >
    <Container>
    <PanelContent>
      <ButtonTouchable onPress={props.onRequestCamera}>
        <Button>
        <ButtonText>Камера</ButtonText>
        </Button>
      </ButtonTouchable>
      <ButtonTouchable onPress={props.onRequestCameraRoll}>
        <Button>
        <ButtonText>Фото или видео</ButtonText>
        </Button>
      </ButtonTouchable>
      <ButtonTouchable style={{ marginTop: 16 }} onPress={props.onRequestToggleSelectPanel}>
        <Button>
        <ButtonText>Отмена</ButtonText>
        </Button>
      </ButtonTouchable>
    </PanelContent>
    </Container>
  </BottomModal>
/*
export const SelectPanel:React.FC<SelectPanelProps> =
  React.forwardRef<SlidingUpPanel, SelectPanelProps>((props, ref) => (
    <SlidingUpPanel
      ref={ref}
      height={176}
      showBackdrop={false}
      draggableRange={!props.isVisible ? { top: 0, bottom: 0}: undefined}
      friction={0.3}
      allowDragging={false}
    >
      <PanelContent>
        <Button onPress={props.onRequestCamera}>
          <ButtonText>Камера</ButtonText>
        </Button>
        <Button onPress={props.onRequestCameraRoll}>
          <ButtonText>Фото или видео</ButtonText>
        </Button>
        <Button style={{ marginTop: 16 }} onPress={props.onRequestToggleSelectPanel}>
          <ButtonText>Отмена</ButtonText>
        </Button>
      </PanelContent>
    </SlidingUpPanel>
  ));
*/
