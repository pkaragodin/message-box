import React from 'react';

import {
  StyleSheet, Text, View, TextInput,
  KeyboardAvoidingView,
  TextInputProps, TouchableWithoutFeedback,
  PanResponder, Animated, Dimensions
} from 'react-native';

import { Audio } from 'expo-av';

import * as Permissions from 'expo-permissions';

import * as FileSystem from 'expo-file-system';

import styled from 'styled-components/native';

import {sentIcon, sentIconWhite, stopIcon, voiceIcon} from "./assets";
import {PlaybackStatus} from "expo-av/build/AV";

interface IconContainerProps {
  pressed: boolean;
}

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

const StopIconImage = styled.Image`
  width: 24px;
  height: 24px;
  margin: 8px;
  resizeMode: contain;
`
const StopButtonContainer = styled.View`
  width: 48px;
  height:48px;
  border-radius: 24px;
  background-color: white;
  align-items: center;
  justify-content: center;
`


export interface VoiceRecordControlProps {
}

interface State {
  pressed:boolean;
  locked: boolean;
  recordCancelled: boolean;
  haveRecordingPermissions: boolean;
  isLoading: boolean;
  recordingDuration?:number;
  isRecording: boolean;
  soundDuration?: number,
  soundPosition?: number,
  shouldPlay?: boolean,
  isPlaying?: boolean,
  rate?: number,
  muted?: boolean,
  volume?: number,
  shouldCorrectPitch?: boolean,
  isPlaybackAllowed?: boolean,
}

export class VoiceRecordControl extends React.PureComponent<VoiceRecordControlProps, State>{
  constructor(props: VoiceRecordControlProps){
    super(props)
    this.state = {
      pressed: false,
      locked: false,
      recordCancelled: false,
      haveRecordingPermissions: false,
      isLoading: false,
      isRecording: false,
  //    yPos: new Animated.Value(-40)
    }

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        //console.log('onPanResponderGrant')
        if(!this.state.pressed && !this.state.isRecording)
          this.setState({ pressed: true });
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        //console.log('move', gestureState)
        /* if(gestureState.moveX > 5 || gestureState.moveY > 5){
           console.log('onPanResponderMove', gestureState)
         }*/
        //console.log(gestureState.dx, gestureState.dy)

        if(Math.abs(gestureState.dx) > 150){
         // console.log('cancel')
          if(this.state.pressed || this.state.locked){
            this.setState({ pressed: false, locked: false, recordCancelled : true })
          }
        }

        /* Animated.timing(
           // Animate value over time
           this.state.yPos, // The value to drive
           {
             toValue: -40 + gestureState.dy, // Animate to final value of 1
           },
         ).start();
   */
        if(Math.abs(gestureState.dy) > 150){

          if(!this.state.locked) {
            //console.log('lock')
            this.setState({locked: true})
          }
        }

        /* if(Math.abs(gestureState.moveX) > 50 || Math.abs(gestureState.moveY) > 50) {
           console.log('move')
         }*/



        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        //console.log('onPanResponderRelease',evt)
        if(this.state.pressed)
          this.setState({pressed: false})
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        //console.log('nPanResponderTerminate',evt)
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        //console.log('onShouldBlockNativeResponder',evt)
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
    this.millsToTime = this.millsToTime.bind(this);
    this._askForPermissions = this._askForPermissions.bind(this);
    this._stopRecording = this._stopRecording.bind(this);
    this._stopPlaybackAndBeginRecording = this._stopPlaybackAndBeginRecording.bind(this)
    this._updateScreenForRecordingStatus = this._updateScreenForRecordingStatus.bind(this);
    this._updateScreenForSoundStatus = this._updateScreenForSoundStatus.bind(this);
    this._stopRecordingAndEnablePlayback = this._stopRecordingAndEnablePlayback.bind(this);
  }
  _panResponder;
  recording: Audio.Recording = null
  sound: Audio.Sound = null;

  public componentDidMount(): void {
    this._askForPermissions();
  }

  async _askForPermissions(){
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  }

  async _stopPlaybackAndBeginRecording(){
    this.setState({
      isLoading: true,
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    }catch (e) {
      console.log('Can not enable audio mode', e)
      return;
    }
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }
    const recording = new Audio.Recording();

    await recording.prepareToRecordAsync(this.recordingSettings);
    recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false,
    });

  }
  recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY))

  _updateScreenForRecordingStatus(status: Audio.RecordingStatus){
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
     /* if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }*/
    }
  }

  _updateScreenForSoundStatus(status: PlaybackStatus){
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        muted: status.isMuted,
        volume: status.volume,
        shouldCorrectPitch: status.shouldCorrectPitch,
        isPlaybackAllowed: true,
      });
    } else {
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false,
      });
      // @ts-ignore
      if (status.error) {
        // @ts-ignore
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  };
  async _stopRecording(setIsLoadingState:boolean = true){
    setIsLoadingState && this.setState({
      isLoading: true,
    });
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    setIsLoadingState && this.setState({
      pressed: false,
      locked: false,
      isLoading: false,
      isRecording: false,
      recordCancelled: false,
      recordingDuration: 0
    })
  }
  async _stopRecordingAndEnablePlayback() {
    if(!this.state.isRecording) return;
    this.setState({
      isLoading: true,
    });
    await this._stopRecording(false)

    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
   //   playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const { sound, status } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state.shouldCorrectPitch,
      },
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.setState({
      isLoading: false,
      isRecording: false,
      recordCancelled: false
    });
  }


  millsToTime(duration:number): { m: number; s:number  } {
    const seconds = (duration / 1000) >> 0
    const minutes = (seconds / 60) >> 0;
    return { m: minutes, s: seconds - minutes * 60 }
  }

  componentDidUpdate(prevProps: VoiceRecordControlProps, prevState: State){
    if(this.state.isRecording &&
      this.state.recordCancelled && !prevState.recordCancelled){
      // cancel record
      console.log('stop recording')
      this._stopRecording()
    } else {
      if(!this.state.pressed &&
        prevState.pressed && !this.state.locked){
        this._stopRecordingAndEnablePlayback()
      }
    }
    if(this.state.pressed && !prevState.pressed){
      // start recording
      // this.handleStartRecord();
      console.log('start recording')
      this._stopPlaybackAndBeginRecording()
    }
   /* if(!this.state.pressed &&
      prevState.pressed && !this.state.locked &&
      !this.state.recordCancelled){
      console.log('stop recording and enable playback')
      // stop recording
     //  this.handleFinishRecord();
      this._stopRecordingAndEnablePlayback()
    }*/
  }

 render(){
    const { m, s } = this.millsToTime(this.state.recordingDuration)
   return  <IconContainer
     {...(!this.state.locked && this._panResponder.panHandlers)}
   >

     <IconImage source={voiceIcon} />

     {this.state.locked &&
       <View style={{
         position: 'absolute',
         top: -110,
         left: 0,
       }}>
         <TouchableWithoutFeedback onPress={(e) =>{
           console.log('stop record')
           this.setState({pressed: false, locked: false, recordCancelled: false})
         }}>
           <StopButtonContainer>
             <StopIconImage source={stopIcon} />
           </StopButtonContainer>
         </TouchableWithoutFeedback>
       </View>
     }

     {(this.state.pressed || this.state.locked) &&
     <Animated.View style={{
       position: 'absolute',
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'flex-start',
       width: Dimensions.get('screen').width,
       left: -Dimensions.get('screen').width + 48,
       height: 48,
       backgroundColor: '#ffffff',
     }}>
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: 'red',
            marginLeft: 16,
            marginRight: 4,
          }}
        />
        <Text style={{
          color:'#a8a8a8',
          lineHeight: 16,
          fontSize: 14,
          marginLeft: 4,
          marginRight: 4,
        }}>{m}:{s}</Text>
       {this.state.locked ?
         <TouchableWithoutFeedback onPress={(e) => {
           this.setState({pressed: false, locked: false, recordCancelled : true})
         }
       }>

           <Text style={{
             color:'#a8a8a8',
             lineHeight: 16,
             fontSize: 14,
             marginLeft: 4,
             marginRight: 16,
           }}>Отмена</Text>

       </TouchableWithoutFeedback>
         :
         <Text style={{
           color:'#a8a8a8',
           lineHeight: 16,
           fontSize: 14,
           marginLeft: 4,
           marginRight: 16,
         }}>{`Влево \u2013 отмена`}</Text>
       }

     </Animated.View>
     }

     {(this.state.pressed || this.state.locked) &&
       <TouchableWithoutFeedback onPress={(e) =>{
         console.log('complete record')
         this.setState({pressed: false, locked: false, recordCancelled: false})
       }}>
     <View style={{
       position: 'absolute',
       alignItems: 'center',
       justifyContent: 'center',
       width: 144,
       height: 144,
       borderRadius: 72,
       top:  -48, //this.state.yPos,
       left: -48,
       backgroundColor: '#0062FF'
     }}>
       <IconImage source={this.state.locked ? sentIconWhite : voiceIcon} />
     </View>
       </TouchableWithoutFeedback>
     }

     {this.sound !== null &&
     <Animated.View style={{
       position: 'absolute',
       flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'flex-start',
       width: Dimensions.get('screen').width - 48,
       left: -Dimensions.get('screen').width + 48,
       height: 48,
       backgroundColor: '#ffffff',
     }}>
       <Text style={{
         color:'#a8a8a8',
         lineHeight: 16,
         fontSize: 14,
         marginLeft: 4,
         marginRight: 16,
       }}>{`Запись готова!`}</Text>
     </Animated.View>
     }

   </IconContainer>
 }
}
