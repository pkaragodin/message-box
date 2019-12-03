import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import styled from 'styled-components/native';


if(__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'))
}

import MessageBox from './message-box'

const Container = styled.View`
	flex: 1;
	background-color: papayawhip;
	justify-content: center;
	align-items: center;
`;

const Title = styled.Text`
	font-size: 24px;
	font-weight: 500;
	color: blue;
`;

export default function App() {
  const [message, setMessage] = useState(null)
  return (
    <Container>
      <Title>Open up App.tsx to start working on your app!</Title>
      {message &&
      <Text>
        {JSON.stringify(message, null, 2)}
      </Text>
      }
      <View style={{ flex: 1 }}/>
      <MessageBox onSendMessage={(message => {
        setMessage(message);
      })}/>

    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
