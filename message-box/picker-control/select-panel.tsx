import React from "react";
import SlidingUpPanel from "rn-sliding-up-panel";
import { Dimensions, Text, View} from "react-native";
import styled from "styled-components/native";
import { BorderlessButton } from 'react-native-gesture-handler';

const panelHeight = 176;

const Button = styled(BorderlessButton)`
  width: 100%;
  height: 48px;
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
`

export interface SelectPanelProps {
  ref: React.Ref<SlidingUpPanel>
  onRequestToggleSelectPanel: () => void
  onRequestCamera: () => void
  onRequestCameraRoll: () => void
  isVisible?: boolean;
}
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
