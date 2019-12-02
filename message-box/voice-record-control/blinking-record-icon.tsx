import React, {Fragment, useEffect, useState} from 'react';

import {Animated, Dimensions, PanResponder, View, Text, TextProps, StyleProp} from 'react-native';
import styled from "styled-components/native";


const AnimatedRedIcon = styled(Animated.View)`
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background-color: red;
`

export interface BlinkingRecordIconProps{
  style?: StyleProp<View>
}

export const BlinkingRecordIcon: React.FC<BlinkingRecordIconProps> =
  ({ style }) => {
    const [animatedOpacity, setAnimatedOpacity] = useState(new Animated.Value(0));

    const blink = () => {
      Animated.sequence([
        Animated.timing(animatedOpacity, { toValue: 1.0, duration: 150 }),
        Animated.timing(animatedOpacity, { toValue: 0.0, duration: 450 }),
      ]).start(() => blink());
    };
  useEffect(()=>{
      blink()
  },[])
  return <AnimatedRedIcon style={[style, { opacity: animatedOpacity }]} />
}
