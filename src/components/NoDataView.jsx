import React from 'react';
import { Text, StyleSheet, View, Image, Dimensions } from 'react-native';
import Colours from '../Constants/Colours';
const windowHeight = Dimensions.get("window").height - 300
const NoDataView = ({
  text
}) => (
  <View
    style={[
      style.container,
      { alignItems: 'center', justifyContent: 'center' },
    ]}>
    <Image
      resizeMode="contain"
      source={require('../Assets/Images/empty_icon.png')}
      style={style.emptyLogo}
    />
    <Text style={style.emptyText}>{text}</Text>
  </View>

);
const style = StyleSheet.create({
  container: {
    height: windowHeight,
    width: '100%',
    marginVertical: 10,

  },
  emptyLogo: {
    width: '30%',
    height: '30%',
    tintColor: Colours.color.color_red
  },
  emptyText: {
    color: Colours.color.color_red,
    fontSize: 17,
    alignSelf: 'center',
  },
});

export default NoDataView;
