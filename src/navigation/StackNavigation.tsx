import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import DrawerNavigator from './DrawerNavigator';
import AuthScreen from './AuthScreen';

interface StackNavigationProps { }

export type RootStackParamList = {
    LoginScreen: undefined
    DrawerNavigator: undefined
    AuthScreen: undefined
}

const StackNavigation: React.FC<StackNavigationProps> = () => {

    const Stack = createNativeStackNavigator<RootStackParamList>();

    return (
        <Stack.Navigator>
            <Stack.Screen name="AuthScreen" component={AuthScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen name="LoginScreen" component={LoginScreen}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator}
                options={{
                    headerTitle: 'DrawerNavigator',
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    )
}

export default StackNavigation