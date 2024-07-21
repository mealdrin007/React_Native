import * as React from 'react';
import {View, Text, StyleSheet, Image, Modal} from 'react-native';
// import {strings} from '../Localesi18n/i18n';
import PropTypes from 'prop-types';

export default class NetworkScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: props.modalVisible,
    };
  }

  render() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.modalVisible}>
        <View style={styles.centeredView}>
          {/* <Image resizeMode="contain" style={styles.tinyLogo} source={require('../Assets/Images/logo.png')} /> */}
          <Image
            style={styles.logo}
            // source={require('../Assets/Images/login_logo.png')}
          />
          <View style={styles.modalView}>
            <Image
              resizeMode="contain"
              //   source={require('../Assets/Images/no-wifi.png')}
              style={styles.noNetworkImage}
            />
            <Text style={styles.noNetworkText}>
              {/* {strings('networkScreen.noNetworkHeading')} */}
            </Text>
            <Text style={styles.noNetworkMessage}>
              {/* {strings('networkScreen.noNetworkMessage')} */}
            </Text>
          </View>
        </View>
      </Modal>
    );
  }
}

NetworkScreen.propTypes = {
  modalVisible: PropTypes.bool,
};

const styles = StyleSheet.create({
  centeredView: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    width: '70%',
    paddingBottom: 5,
    alignItems: 'center',
  },
  noNetworkImage: {
    height: '30%',
  },
  noNetworkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  noNetworkMessage: {
    fontSize: 15,
    textAlign: 'center',
    paddingTop: 10,
    color: 'black',
  },
  tinyLogo: {
    resizeMode: 'contain',
    height: '5%',
    aspectRatio: 1,
  },
  logo: {
    height: '25%',
    aspectRatio: 1,
  },
});
