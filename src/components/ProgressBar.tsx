import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { colors } from '../utils/Colors';

const ProgressBar = () => (
  <View style={styles.container}>
    <ActivityIndicator
      animating={true}
      color={colors.Page_Title_Color}
      size="large"
      style={styles.activityIndicator}
    />
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  text: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressBar;
