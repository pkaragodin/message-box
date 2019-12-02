import React, {Fragment} from 'react';

import {Animated, Dimensions, PanResponder, View, Text} from 'react-native';

import {Audio} from 'expo-av';

import * as Permissions from 'expo-permissions';

import * as FileSystem from 'expo-file-system';

import Queue from 'queue'

import styled from 'styled-components/native';

import {deleteIcon, pauseIcon, playIcon, sendIconWhite, stopIcon, voiceIcon} from "../assets";
import {PlaybackStatus} from "expo-av/build/AV";
import {BorderlessButton} from 'react-native-gesture-handler';
import {MessageType, VoiceMessage} from "../message-box";
import { Timer } from './timer'
import { BlinkingRecordIcon } from './blinking-record-icon'

const Container = styled.View`
 flex-direction: column;
 justify-content: flex-end;
`

const PlayerContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

const DeleteButton = styled(BorderlessButton)`
  width: 48px;
  height: 48px;
`

const SendButton = styled(BorderlessButton)`
  width: 48px;
  height: 48px;
`

const PlayPauseButton = styled(BorderlessButton)`
  width: 48px;
  height: 48px;
`

const SendIconContainer = styled.View`
   width: 40px;
  height: 40px;
  background-color: #0062FF;
  border-radius: 20px;
  padding: 4px;
  margin: 4px;
`
const SendIcon = styled.Image`
  width: 32px;
  height: 32px;
  resizeMode: contain;
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
const StopButton = styled(BorderlessButton)`
  width: 48px;
  height:48px;
  border-radius: 24px;
  background-color: white;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -116px;
  left: -4px;
`

const RecordingPanel = styled.View`
      position: absolute;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      width: ${Dimensions.get('screen').width}px;
      left: ${-Dimensions.get('screen').width + 48}px;
      height: 48px;
      background-color: #ffffff;
`

const RecordActiveRedIcon = styled(BlinkingRecordIcon)`
      margin-left: 16px;
      margin-right: 4px;
`

const CancelButton = styled(BorderlessButton)`

`
const CancelButtonText = styled.Text`
      color: #0062FF;
      line-height: 16px;
      font-size: 16px;
      margin-left: 4px;
      margin-right: 16px;
`

const SwipeCancelText = styled.Text`
      color:#a8a8a8;
      line-height: 16px;
      font-size: 14px;
      margin-left: 4px;
      margin-right: 16px;
`

const ACTIVE_BUTTON_TOP = -48;

const RecordingActiveButtonContainer = styled(Animated.View)`
      position: absolute;
      align-items: center;
      justify-content: center;
      width: 144px;
      height: 144px;
      border-radius: 72px;
      top:  ${ACTIVE_BUTTON_TOP}px;
      left: -48px;
      background-color: #0062FF
`

const RecordingActiveButton = styled(BorderlessButton)`
      flex: 1;
      justify-content: center;
      align-items: center
`

const TimerText = styled.Text`
      color:#a8a8a8;
      line-height: 16px;
      font-size: 14px;
      padding-left: 4px;
      padding-right: 4px;
      min-width: 60px;
`

const RecordTimer = styled(Timer)`
    min-width: 80px;
`
const TotalPlaybackTime = styled(Timer)`
  min-width: 65px;
`
const CurrentPlaybackTime = styled(Timer)`
   min-width: 65px;
`

const PlaybackTimersContainer = styled.View`
  min-width: 140px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`


const RecordingButtonIconImage = styled.Image`
  width: 32px;
  height: 32px;
  margin: 8px;
  resizeMode: contain;
`

enum UserActionEnum {
  NOTHING = 'nothing',
  TOUCH_START= 'touch start',
  TOUCH_RELEASE = 'touch release',
  SWIPE_LEFT = 'swipe left',
  SWIPE_UP = 'swipe up',
}


enum StatusEnum {
  WAITING_FOR_GRANT_PERMISSION = 'waiting for grant permission',
  PERMISSION_NOT_GRANTED = 'permission granted',

  READY_FOR_RECORD = 'ready for record',
  START_RECORDING = 'start recording',
  STOP_RECORDING = 'stop recording',
  STOP_RECORDING_AND_SEND = 'stop recording and send',
  CANCEL_RECORDING = 'cancel recording',
  RECORDING = 'recording',
  RECORDING_LOCKED = 'rocording locked',
  READY_FOR_PLAYBACK = 'ready for playback',
  MESSAGE_READY_FOR_SEND = 'message ready for send',

  PLAY = 'play',
  PAUSE = 'pause',

}


export interface VoiceRecordControlProps {
  onSendMessage: (message: VoiceMessage) => void;
  onActive?: () => void
  onPassive?: () => void
}

interface State {
  userAction: UserActionEnum;
  prevUserAction: UserActionEnum;
  status: StatusEnum;
  animatedActiveButtonY: Animated.Value;
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
      userAction: UserActionEnum.NOTHING,
      prevUserAction: UserActionEnum.NOTHING,
      animatedActiveButtonY: new Animated.Value(0),
      status: StatusEnum.READY_FOR_RECORD,
      pressed: false,
      locked: false,
      recordCancelled: false,
      haveRecordingPermissions: false,
      isLoading: false,
      isRecording: false,
    }

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this.emitUserAction(UserActionEnum.TOUCH_START)
      },
      onPanResponderMove: (evt, gestureState) => {
        if(Math.abs(gestureState.dx) > 150){
          this.emitUserAction(UserActionEnum.SWIPE_LEFT)
        }


        if(Math.abs(gestureState.dy) > 150){
          this.emitUserAction(UserActionEnum.SWIPE_UP)
          return;
        }

        if(this.state.status === StatusEnum.RECORDING_LOCKED){
          return;
        }

        return Animated.event([null, {
          dy: this.state.animatedActiveButtonY,
        }])(evt, gestureState)
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
       this.emitUserAction(UserActionEnum.TOUCH_RELEASE);
      },
      onPanResponderTerminate: (evt, gestureState) => {
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        return true;
      },
    });
    this._askForPermissions = this._askForPermissions.bind(this);
    this._cancelRecording = this._cancelRecording.bind(this);
    this._stopPlaybackAndBeginRecording = this._stopPlaybackAndBeginRecording.bind(this)
    this._updateScreenForRecordingStatus = this._updateScreenForRecordingStatus.bind(this);
    this._updateScreenForSoundStatus = this._updateScreenForSoundStatus.bind(this);
    this._stopRecordingAndEnablePlayback = this._stopRecordingAndEnablePlayback.bind(this);

    this.emitUserAction = this.emitUserAction.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.isRecordingPanelVisible = this.isRecordingPanelVisible.bind(this);
  }
  _panResponder;
  recording: Audio.Recording = null
  sound: Audio.Sound = null;
  queue = new Queue()

  emitUserAction(userAction: UserActionEnum){
    if(this.state.userAction!=userAction){
      this.setState({ userAction, prevUserAction: this.state.userAction });
    }
  }
  public componentDidMount(): void {
    this.queue.autostart = true
    this.queue.concurrency = 1;
    this.queue.push(this._askForPermissions)
  }
  public componentWillUnmount(): void {
    this.queue.stop()
  }

  async _askForPermissions(){
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  }

  async _stopPlaybackAndBeginRecording(){
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
    recording.setProgressUpdateInterval(100)

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.

  }
  recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY))

  _updateScreenForRecordingStatus(status: Audio.RecordingStatus){
    if (status.canRecord && status.isRecording) {
      this.setState({
        status:
          this.state.status === StatusEnum.STOP_RECORDING ||
          this.state.status === StatusEnum.STOP_RECORDING_AND_SEND ||
          this.state.status=== StatusEnum.CANCEL_RECORDING ?
          this.state.status :
            this.state.status === StatusEnum.RECORDING_LOCKED ? StatusEnum.RECORDING_LOCKED
              : StatusEnum.RECORDING,
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {

    }
  }

  _updateScreenForSoundStatus(status: PlaybackStatus){
    if (status.isLoaded) {
      this.setState({
        status: this.state.status!== StatusEnum.PLAY && this.state.status !== StatusEnum.PAUSE
          && this.state.status!== StatusEnum.READY_FOR_PLAYBACK ?
          StatusEnum.MESSAGE_READY_FOR_SEND : this.state.status,
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
  async _cancelRecording(){

    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
  }

  async _stopRecordingAndEnablePlayback() {

   await this._cancelRecording()

    if(this.recording === null){
      return;
    }
    if(this.recording._finalDurationMillis < 500){
      this.setState({ status: StatusEnum.CANCEL_RECORDING})
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
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
  }

  componentDidUpdate(prevProps: VoiceRecordControlProps, prevState: State){
    if(prevState.status != this.state.status){
      console.log('change status', prevState.status, this.state.status);
    }
    if(prevState.userAction != this.state.userAction){
      switch (this.state.userAction) {
        case UserActionEnum.TOUCH_START:
          console.log(this.queue.length)
          if(this.queue.length < 1 && this.state.status !== StatusEnum.RECORDING_LOCKED) {
            this.setState({status: StatusEnum.START_RECORDING})
          }
        break;
        case UserActionEnum.SWIPE_LEFT:
          this.setState({ status: StatusEnum.CANCEL_RECORDING})
        break;
        case UserActionEnum.TOUCH_RELEASE:
          if(this.state.status === StatusEnum.RECORDING){
            this.setState({status: StatusEnum.STOP_RECORDING_AND_SEND})
          }
          if(this.state.status === StatusEnum.START_RECORDING &&
            this.state.prevUserAction !== UserActionEnum.SWIPE_UP){
            this.setState({status: StatusEnum.CANCEL_RECORDING})
          }
          if(this.state.status === StatusEnum.RECORDING_LOCKED &&
            this.state.prevUserAction!== UserActionEnum.SWIPE_UP){
            this.setState({status: StatusEnum.STOP_RECORDING_AND_SEND})
          }
          break;
        case UserActionEnum.SWIPE_UP:
          if(this.state.status === StatusEnum.RECORDING ||
            this.state.status === StatusEnum.START_RECORDING){
            this.setState({ status: StatusEnum.RECORDING_LOCKED})
            Animated.timing(this.state.animatedActiveButtonY, {
              toValue: 0,
              duration: 50,
            }).start();
          }
        break
      }
    }
    if(this.state.status !== prevState.status){
      switch(this.state.status){
        case StatusEnum.START_RECORDING:
          if(this.queue.length < 1)
          this.queue.push(this._stopPlaybackAndBeginRecording);
          break;
        case StatusEnum.STOP_RECORDING:
          this.queue.push(this._stopRecordingAndEnablePlayback,
            ()=> new Promise((resolve, reject) =>
              this.setState({ status: StatusEnum.READY_FOR_PLAYBACK},()=>resolve()))
          );
        break;

        case StatusEnum.STOP_RECORDING_AND_SEND:
          this.queue.push(
            this._stopRecordingAndEnablePlayback,
            this.handleSendMessage
          );
          break;

        case StatusEnum.CANCEL_RECORDING:
          this.queue.push(this._cancelRecording);
          break;
        case StatusEnum.PLAY:
          this.queue.push(this.play);
      }
    }
  }
  async play(){
    await this.sound.playAsync()
    if(this.state.status === StatusEnum.PLAY) {
      this.queue.push(this.play);
    } else {
      if(this.state.status === StatusEnum.PAUSE)
        this.queue.push(this.pause);
      else {
        this.queue.push(()=> this.sound.stopAsync());
      }
    }
  }
  async pause(){
    await this.sound.pauseAsync()
  }
  async handleSendMessage(){
     const info = await FileSystem.getInfoAsync(this.recording.getURI());
    this.props.onSendMessage && this.props.onSendMessage({
      type: MessageType.VOICE,
      uri: info.uri,
      duration: this.state.soundDuration
    })
    await this.queue.push(()=> new Promise((resolve, reject) => {
      this.setState({ status: StatusEnum.READY_FOR_RECORD }, ()=>{
        resolve()
      })
    }))

  }
  isRecordingPanelVisible(){
    if(this.state.status === StatusEnum.RECORDING ||
      this.state.status === StatusEnum.RECORDING_LOCKED ||
      this.state.status === StatusEnum.READY_FOR_PLAYBACK ||
      this.state.status === StatusEnum.PLAY ||
      this.state.status === StatusEnum.PAUSE){
      this.props.onActive && this.props.onActive()
      return true
    }
    this.props.onPassive && this.props.onPassive();
    return false
  }
  render(){
    return  <Container
      {...(
        this.state.status !== StatusEnum.READY_FOR_PLAYBACK &&
        this.state.status !== StatusEnum.PLAY &&
        this.state.status !== StatusEnum.PAUSE &&
        this.state.status !== StatusEnum.RECORDING_LOCKED
        && this._panResponder.panHandlers)}
      style={{ zIndex: this.state.status!== StatusEnum.READY_FOR_RECORD? 1000000: undefined }}
    >
      <IconImage source={voiceIcon} />

      {this.isRecordingPanelVisible() &&
      <RecordingPanel>
        {this.state.status === StatusEnum.READY_FOR_PLAYBACK ||
        this.state.status === StatusEnum.PLAY ||
        this.state.status === StatusEnum.PAUSE?
        <Fragment>
          <DeleteButton onPress={()=>{
            this.setState({ status: StatusEnum.CANCEL_RECORDING })
          }}>
            <IconImage source={deleteIcon}/>
          </DeleteButton>

          <PlayerContainer>
            <PlayPauseButton onPress={()=>{
              if(this.state.status === StatusEnum.PLAY){
                this.setState({ status: StatusEnum.PAUSE })
              } else {
                this.setState({ status: StatusEnum.PLAY})
              }

            }}>
              <IconImage source={
                this.state.status === StatusEnum.READY_FOR_PLAYBACK ||
                this.state.status === StatusEnum.PAUSE ?
                playIcon : pauseIcon
              }/>
            </PlayPauseButton>

            <PlaybackTimersContainer>
            <CurrentPlaybackTime time={this.state.soundPosition}/>
            <Text>/</Text>
            <TotalPlaybackTime time={this.state.soundDuration}/>
            </PlaybackTimersContainer>

          </PlayerContainer>

          <SendButton onPress={this.handleSendMessage}>
            <SendIconContainer>
            <SendIcon source={sendIconWhite}/>
            </SendIconContainer>
          </SendButton>
        </Fragment>
          :
          <Fragment>
            <RecordActiveRedIcon/>
              <RecordTimer time={this.state.recordingDuration}/>
            {/*<TimerText>{m}:{s}</TimerText>*/}
            {this.state.status === StatusEnum.RECORDING_LOCKED ?
              <CancelButton onPress={(e) => {
                this.setState({ status: StatusEnum.CANCEL_RECORDING })
              }}>
                <CancelButtonText>Отмена</CancelButtonText>
              </CancelButton>
              :
              <SwipeCancelText>{`Влево \u2013 отмена`}</SwipeCancelText>
            }
          </Fragment>
        }
      </RecordingPanel>
      }

      {(this.state.status === StatusEnum.START_RECORDING ||
        this.state.status === StatusEnum.RECORDING_LOCKED ||
        this.state.status === StatusEnum.RECORDING
      ) &&
      <RecordingActiveButtonContainer style={{
        top: this.state.animatedActiveButtonY.interpolate({
          inputRange: [0,150],
          outputRange: [ 0 + ACTIVE_BUTTON_TOP, 150 + ACTIVE_BUTTON_TOP]
        })
      }}>
        <RecordingActiveButton onPress={()=>{
          this.setState({status: StatusEnum.STOP_RECORDING_AND_SEND})
        }}>
        <RecordingButtonIconImage
          source={this.state.status === StatusEnum.RECORDING_LOCKED ? sendIconWhite : voiceIcon} />
        </RecordingActiveButton>
      </RecordingActiveButtonContainer>
      }
      {this.state.status === StatusEnum.RECORDING_LOCKED &&
      <StopButton onPress={()=>{
        this.setState({ status: StatusEnum.STOP_RECORDING })
      }}>
        <StopIconImage source={stopIcon}/>
      </StopButton>
      }
    </Container>
  }
}
