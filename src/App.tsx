import 'react-native-gesture-handler';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Navigation from './navigation/Navigation';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native';

function App(): React.JSX.Element {

  return (
    <PaperProvider>
      <StatusBar backgroundColor={"white"} barStyle={'dark-content'} />
      <View style={{ flex: 1 }}>
        <Navigation />
      </View>
    </PaperProvider >
  );
}

const styles = StyleSheet.create({

});

export default App;
