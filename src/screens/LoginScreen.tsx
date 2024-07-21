import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import React, { useContext, useState } from 'react';
import AuthTextInput from '../components/textComponent/AuthTextInput';
import { _storeData, isEmail } from '../utils/UrlConst';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigation';
import LogoWithNameIcon from '../../public/images/LogoWithName.svg';
import MailIcon from '../../public/images/Mail.svg';
import LockIcon from '../../public/images/Lock.svg';
import { LoginApi, screenWidth } from '../utils/UrlConst';
import { http } from '../apiService';
import { colors } from '../utils/Colors';
import { AuthContext } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'LoginScreen'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {

  const { width } = useWindowDimensions();

  const [emailId, setEmailId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [emailIdWrong, setEmailIdWrong] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isSecureEntry, setIsSecureEntry] = useState<boolean>(true);
  const authContext = useContext(AuthContext);

  const { setToken, setName, setRole } = authContext;

  const checkForErrors = () => {

    setEmailError(!emailId ? 'emailerror' : '');
    setEmailIdWrong(
      typeof emailId !== 'undefined' && !isEmail(emailId) ? 'emailWrong' : '',
    );
    setPasswordError(!password ? 'passworderror' : '');

    return isEmail(emailId) && password;
  };

  const Login = async () => {
    let jsonData = JSON.stringify({
      username: emailId,
      password: password,
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURLWithoutToken(LoginApi, jsonData, methodtype);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {

      await _storeData('auth_Token', responseJson?.data?.accessToken)
      await _storeData('name', responseJson?.data?.userName)
      await _storeData('role_Id', responseJson?.data?.roleID)

      setName(responseJson?.data?.userName)
      setToken(responseJson?.data?.accessToken)
      setRole(responseJson?.data?.roleID)

      navigation.reset({
        index: 0,
        routes: [{ name: 'DrawerNavigator' }],
      });
      handleClear();
    } else {
      setLoginError(responseJson?.statusMessage);
    }
  };

  const handleClear = () => {
    setEmailId('');
    setEmailError('');
    setPassword('');
    setPasswordError('');
  };

  const handleLogin = () => {
    let isError = checkForErrors();
    if (isError) {
      Login();
    }
  };

  const onInputTextChange = (
    value: string,
    type: 'Email' | 'Password',
  ): void => {
    if (type === 'Email') {
      setEmailId(value.trim());
      setEmailError('');
      setEmailIdWrong('');
      setLoginError('');
    } else if (type === 'Password') {
      setPassword(value.trim());
      setPasswordError('');
      setLoginError('');
    }
  };

  return (
    <View style={styles.mainContainer}>
      {width > screenWidth ? (
        <View style={styles.container}>
          <View style={styles.leftContainer}>
            <Image
              source={{ uri: '/images/LogoWithName.svg' }}
              style={styles.image1}
            />
            <Text style={styles.title}>Login into your account</Text>
            <View
              style={{
                justifyContent: 'center',
              }}>
              <Text style={styles.text}>Email Address</Text>
              <View style={styles.inputContainer}>
                <AuthTextInput
                  placeholder="email"
                  placeholderTextColor={colors.Color_555555}
                  keyboardType={'email-address'}
                  onChangeText={e => onInputTextChange(e, 'Email')}
                  value={emailId}
                  style={styles.textInput}
                />
                <View style={styles.textInputIconContainer}>
                  <Image
                    source={{ uri: '/images/Mail.svg' }}
                    style={styles.textInputIcon}
                  />
                </View>
              </View>
              {emailError ? (
                <Text style={{ color: 'red' }}>{'Email is required'}</Text>
              ) : emailIdWrong ? (
                <Text style={{ color: 'red' }}>{'Email is invalid'}</Text>
              ) : null}
              <Text style={styles.text}>Password</Text>
              <View style={styles.inputContainer}>
                <AuthTextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.Color_555555}
                  value={password}
                  secureTextEntry={isSecureEntry}
                  onChangeText={e => onInputTextChange(e, 'Password')}
                  style={styles.textInput}
                />
                <View style={styles.textInputIconContainer}>
                  <Pressable onPress={() => setIsSecureEntry(prev => !prev)}>
                    <Image
                      source={{ uri: '/images/Lock.svg' }}
                      style={styles.textInputIcon}
                    />
                  </Pressable>
                </View>
              </View>
              {passwordError ? (
                <Text style={{ color: 'red' }}>{'Password is required'}</Text>
              ) : loginError ? (
                <Text style={{ color: 'red' }}>{loginError}</Text>
              ) : null}
            </View>
            <Pressable onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginText}>Login Now</Text>
            </Pressable>
            {/* <View style={styles.bottomBarContainer}>
              <View style={styles.bottomBar} />
              <Text style={styles.bottomBarText}>OR</Text>
              <View style={styles.bottomBar} />
            </View> */}
            {/* <Pressable style={styles.signupButton}>
              <Text style={styles.signupText}>Signup Now</Text>
            </Pressable> */}
          </View>
          <View style={styles.rightContainer}>
            <Image
              source={{ uri: '/images/LoginScreenMainIcon.svg' }}
              style={styles.image2}
              resizeMode="cover"
            />
          </View>
        </View>
      ) : (
        <View style={styles.mobileContainer}>
          <View style={styles.mobileSubContainer}>
            {
              Platform.OS === 'web' ?
                <Image
                  source={{ uri: '/images/LogoWithName.svg' }}
                  style={{
                    height: 282,
                    width: 282
                  }}
                /> :
                <LogoWithNameIcon height={282} width={282} />
            }
            <Text style={styles.title}>Login into your account</Text>
            <View style={styles.mobileInputContainer}>
              <Text style={styles.text}>Email Address</Text>
              <View style={styles.mobileInputSection}>
                <AuthTextInput
                  placeholder="email"
                  placeholderTextColor={colors.Color_555555}
                  keyboardType={'email-address'}
                  onChangeText={e => onInputTextChange(e, 'Email')}
                  value={emailId}
                  style={styles.mobileInput}
                />
                <View style={styles.textInputIconContainer}>
                  {
                    Platform.OS === 'web' ?
                      <Image
                        source={{ uri: '/images/Mail.svg' }}
                        style={{
                          height: 24,
                          width: 24
                        }}
                      /> :
                      <MailIcon width={24} height={24} />
                  }
                </View>
              </View>
              {emailError ? (
                <Text style={{ color: 'red' }}>{'Email is required'}</Text>
              ) : emailIdWrong ? (
                <Text style={{ color: 'red' }}>{'Email is invalid'}</Text>
              ) : null}
              <Text style={[styles.text, { paddingTop: 10 }]}>Password</Text>
              <View style={styles.mobileInputSection}>
                <AuthTextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.Color_555555}
                  value={password}
                  secureTextEntry={isSecureEntry}
                  onChangeText={e => onInputTextChange(e, 'Password')}
                  style={styles.mobileInput}
                />
                <View style={styles.textInputIconContainer}>
                  <Pressable onPress={() => setIsSecureEntry(prev => !prev)}>
                    {
                      Platform.OS === 'web' ?
                        <Image
                          source={{ uri: '/images/Lock.svg' }}
                          style={{
                            height: 24,
                            width: 24
                          }}
                        /> :
                        <LockIcon height={24} width={24} />
                    }
                  </Pressable>
                </View>
              </View>
              {passwordError ? (
                <Text style={{ color: 'red' }}>{'Password is required'}</Text>
              ) : loginError ? (
                <Text style={{ color: 'red' }}>{loginError}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={handleLogin}
              style={styles.mobileLoginNowButton}>
              <Text style={styles.loginText}>Login Now</Text>
            </Pressable>
            {/* <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 20,
              }}>
              <View style={styles.mobileBorderLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.mobileBorderLine} />
            </View> */}
            {/* <Pressable style={styles.mobileSignUpButton}>
              <Text style={styles.signupText}>Signup Now</Text>
            </Pressable> */}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    minWidth: 1000,
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 1,
    backgroundColor: colors.White,
    marginLeft: 2,
    alignItems: 'center',
    minWidth: 480,
  },
  rightContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: colors.Color_555555,
    paddingBottom: 10,
    paddingTop: 10,
    fontFamily: 'Poppins-Regular',
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    width: 410,
    backgroundColor: colors.Blue_Color_006cff,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  loginText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: colors.White,
    fontFamily: 'Poppins-SemiBold',
  },
  signupButton: {
    height: 50,
    borderRadius: 8,
    borderColor: colors.Blue_Color_006cff,
    borderWidth: 1,
    width: 410,
    backgroundColor: colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: colors.Blue_Color_006cff,
    fontFamily: 'Poppins-SemiBold',
  },
  image1: {
    height: 110,
    width: 282,
    marginTop: 104,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 30,
    fontFamily: 'Poppins-Bold',
  },
  inputContainer: {
    flexDirection: 'row',
    width: 410,
    height: 50,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: colors.Color_F1F3F6,
    fontSize: 16,
    paddingLeft: 20,
    width: 360,
    height: 50,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontFamily: 'Poppins-Regular',
  },
  textInputIconContainer: {
    backgroundColor: colors.Blue_Color_006cff,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  textInputIcon: {
    height: 24,
    width: 24,
  },
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 410,
  },
  bottomBar: {
    borderWidth: 1,
    width: 175,
    height: 0,
    borderColor: colors.Color_C2C2C2,
  },
  bottomBarText: {
    color: colors.Color_C2C2C2,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    marginHorizontal: 20,
  },
  image2: {
    width: '80%',
    height: '80%'
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: colors.White,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileSubContainer: {
    flex: 1,
    backgroundColor: colors.White,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileInputContainer: {
    justifyContent: 'center',
  },
  mobileInputSection: {
    flexDirection: 'row',
    height: 50,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  mobileInput: {
    backgroundColor: colors.Color_F1F3F6,
    fontSize: 16,
    paddingLeft: 20,
    width: 266,
    height: 50,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    fontFamily: 'Poppins-Regular',
  },
  mobileLoginNowButton: {
    height: 50,
    borderRadius: 8,
    width: 316,
    backgroundColor: colors.Blue_Color_006cff,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
    shadowColor: colors.Color_Bright_Orange,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  mobileSignUpButton: {
    height: 50,
    borderRadius: 8,
    borderColor: colors.Blue_Color_006cff,
    borderWidth: 1,
    width: 316,
    backgroundColor: colors.White,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  mobileBorderLine: {
    flex: 1,
    borderWidth: 1,
    height: 0,
    borderColor: colors.Color_C2C2C2,
  },
  orText: {
    color: colors.Color_C2C2C2,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    marginHorizontal: 20,
  },
});

export default LoginScreen;