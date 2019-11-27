import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import styled from 'styled-components';

const Container = styled.View`
	flex: 1;
	background-color: papayawhip;
	justify-content: center;
	align-items: center;
`;

const Title = styled.Text`
	font-size: 24px;
	font-weight: 500;
	color: palevioletred;
`;

export default function App() {
  return (
    <Container>
      <Title>Open up App.tsx to start working on your app!</Title>
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
