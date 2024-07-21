import React, { useContext, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

interface AuthScreenProps {
  navigation: NavigationProp<any>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {

  const authContext = useContext(AuthContext);
  const { token } = authContext;

  useEffect(() => {
    handleLogin();
  }, []);

  const handleLogin = async () => {
    if (token) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'DrawerNavigator' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }
  };

  return (
    <View>
      <StatusBar hidden={true} />
    </View>
  );
};

export default AuthScreen;