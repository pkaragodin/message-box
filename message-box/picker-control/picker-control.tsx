import React, {useState, useEffect, useRef, RefForwardingComponent, ForwardRefExoticComponent} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';


import styled from "styled-components/native";

import SlidingUpPanel from 'rn-sliding-up-panel';

import { SelectPanel } from './select-panel'

import {BorderlessButton} from 'react-native-gesture-handler';

import {attachIcon} from "../assets";

import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import {ImageMessageInterface, VideoMessageInterface} from "../message-box";

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

const getPhotoLibraryPermissionAsync = async () => {
  if (Constants.platform.ios) {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      //alert('Sorry, we need camera roll permissions to make this work!');
      throw new Error('Sorry, we need camera roll permissions to make this work!')
    }
  }
}

const getCameraPermissionAsync = async () => {
  if (Constants.platform.ios) {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status !== 'granted') {
      //alert('Sorry, we need camera roll permissions to make this work!');
      throw new Error('Sorry, we need camera roll permissions to make this work!')
    }
  }
}

const launchCamera = async () => {
 const result = await ImagePicker.launchCameraAsync({})
  return result
};

const launchImageLibrary = async () => {
   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.All,
     allowsEditing: true,
     //aspect: [4, 3],
     //quality: 1,
     allowsMultipleSelection: true
   });

  return result
};

type Message = ImageMessageInterface | VideoMessageInterface

export interface PickerControlProps {
  onPicked: (result: Message) => void
}

export const PickerControl: React.FC<PickerControlProps> = ({ onPicked }) => {

  //const selectPanelRef = useRef<SlidingUpPanel>();
  const [isSelectPanelVisible, setIsSelectPanelVisible] = useState(false);
  useEffect(()=>{
    if(isSelectPanelVisible){
  //    selectPanelRef.current.show(176)
    } else {
    //  selectPanelRef.current.hide();
    }
  },[isSelectPanelVisible])
  const handleToggleSelectPanel = () => {
    setIsSelectPanelVisible(false)
    setIsSelectPanelVisible(!isSelectPanelVisible)
  }


  const [cameraPermissionGranted,
    setCameraPermissionGranted] = useState(false)
  const [pickingCamera, setPickingCamera] = useState(false);
  useEffect(()=>{
    if(!cameraPermissionGranted){
      getCameraPermissionAsync()
        .then((result) =>{
          setCameraPermissionGranted(true)
        }).catch(e=>{
        // todo handle error
      })
    }
    if(pickingCamera && cameraPermissionGranted) {

      launchCamera().then(result => {
        !result.cancelled && onPicked && onPicked(result as Message)
      }).catch(e => {
        // todo handle error
      }).finally(()=>{
        setPickingCamera(false)
      })
    }
  },[pickingCamera, cameraPermissionGranted])

  const handlePickCamera = async () => {
    setIsSelectPanelVisible(false)
    setPickingCamera(true)
  }

  const [cameraRollPermissionGranted,
    setCameraRollPermissionGranted] = useState(false)
  const [pickingCameraRoll, setPickingCameraRoll] = useState(false)


  useEffect(()=>{
    if(!cameraRollPermissionGranted){
      getPhotoLibraryPermissionAsync()
        .then((result) =>{
          setCameraRollPermissionGranted(true)
        }).catch(e=>{
        // todo handle error
      })
    }
    if(pickingCameraRoll && cameraRollPermissionGranted) {
      //setIsSelectPanelVisible(false)
      launchImageLibrary().then(result => {
        !result.cancelled && onPicked && onPicked(result as Message)
      }).catch(e => {
        // todo handle error
      }).finally(()=>{
        setPickingCameraRoll(false)
      })
    }
  },[pickingCameraRoll, cameraRollPermissionGranted])

  const handlePickCameraRoll = async () => {
    setIsSelectPanelVisible(false)
    setPickingCameraRoll(true)
  }

  return (<Container>
            <Button onPress={handleToggleSelectPanel}>
              <IconImage source={attachIcon}/>
            </Button>
             <SelectPanel
               // ref={selectPanelRef}
                          isVisible={isSelectPanelVisible}
                   onRequestCameraRoll={handlePickCameraRoll}
                   onRequestCamera={handlePickCamera}
                   onRequestToggleSelectPanel={handleToggleSelectPanel}
             />
          </Container>
  )
}

