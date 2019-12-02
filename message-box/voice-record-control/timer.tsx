import React, {Fragment} from 'react';

import {Animated, Dimensions, PanResponder, View, Text, TextProps} from 'react-native';
import styled from "styled-components/native";


function millsToTime(duration:number): { minutes: number; seconds:number, mills:number } {
  const _seconds = (duration / 1000) >> 0
  const minutes = (_seconds / 60) >> 0;
  const seconds = _seconds - minutes * 60
  const mills = duration - _seconds*1000
  return { minutes, seconds, mills }
}

export interface TimerProps extends TextProps{
  time:number;
}


const TimerText = styled.Text`
      color:#a8a8a8;
      line-height: 16px;
      font-size: 14px;
      padding-left: 4px;
      padding-right: 4px;
`


export const Timer: React.FC<TimerProps> = ({ time, style }) => {
  const {minutes, seconds, mills }= millsToTime(time)
  return <TimerText style={style}>
    {minutes}:{seconds},{mills}
  </TimerText>
}
