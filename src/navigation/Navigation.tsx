import React from 'react'
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native'
import StackNavigation from './StackNavigation'
import { LinkingOptions } from '@react-navigation/native';
import { AuthProvider } from '../context/AuthContext';

type DrawerParamList = {
    Dashboard: undefined;
    StockRegister: undefined;
    ProductListEntry: undefined;
    OutwardRegister: undefined;
    InwardRegister: undefined;
};

type RootStackParamList = {
    AuthScreen: undefined;
    LoginScreen: undefined;
    DrawerNavigator: NavigatorScreenParams<DrawerParamList>;
};

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: ['twinlake://app'],
    config: {
        initialRouteName: 'AuthScreen',
        screens: {
            AuthScreen: 'AuthScreen',
            LoginScreen: 'login',
            DrawerNavigator: {
                path: '',
                screens: {
                    Dashboard: 'Dashboard',
                    StockRegister: 'StockRegister',
                    ProductListEntry: 'ProductListEntry',
                    OutwardRegister: 'OutwardRegister',
                    InwardRegister: 'InwardRegister',
                },
            },
        },
    },
};

const Navigation: React.FC = () => {
    return (
        <AuthProvider>
            <NavigationContainer linking={linking}>
                <StackNavigation />
            </NavigationContainer>
        </AuthProvider>
    )
}

export default Navigation