import React from 'react';
import DashboardScreen from '../screens/DashboardScreen';
import StockRegisterScreen from '../screens/StockRegisterScreen';
import { useWindowDimensions } from 'react-native';
import ProductListEntryScreen from '../screens/ProductListEntry';
import OutwardRegisterScreen from '../screens/OutwardRegisterScreen';
import InwardRegisterScreen from '../screens/InwardRegisterScreen';
import DashboardIcons from '../../public/images/DashboardIcons.svg';
import ProductListEntryIcon from '../../public/images/ProductListEntry.svg';
import OutwardRegisterIcon from '../../public/images/OutwardRegister.svg';
import StockRegisterIcon from '../../public/images/StockRegister.svg';
import InwardRegisterIcon from '../../public/images/InwardRegister.svg';
import { screenWidth } from '../utils/UrlConst';
import { createCustomDrawerNavigator } from './CustomDrawer';

const customDrawer = createCustomDrawerNavigator();

const DrawerNavigator: React.FC = () => {

    const { width } = useWindowDimensions();

    return (
        <customDrawer.Navigator
            //TODO: need to commonize break point
            drawerType={width > 1100 ? 'fixed' : 'front'}
        >
            <customDrawer.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'Dashboard',
                    image: '/images/DashboardIcons.svg',
                    drawerIcon: <DashboardIcons width={20} height={20} />
                }}
            />
            <customDrawer.Screen name="StockRegister" component={StockRegisterScreen}
                options={{
                    title: 'Stock Register',
                    image: '/images/StockRegister.svg',
                    drawerIcon: <StockRegisterIcon width={20} height={20} />
                }}
            />
            <customDrawer.Screen name="ProductListEntry" component={ProductListEntryScreen}
                options={{
                    title: 'Product List Entry',
                    image: '/images/ProductListEntry.svg',
                    drawerIcon: <ProductListEntryIcon width={20} height={20} />
                }}
            />
            <customDrawer.Screen name="OutwardRegister" component={OutwardRegisterScreen}
                options={{
                    title: 'Outward Register',
                    image: '/images/OutwardRegister.svg',
                    drawerIcon: <OutwardRegisterIcon width={20} height={20} />
                }}
            />
            <customDrawer.Screen name="InwardRegister" component={InwardRegisterScreen}
                options={{
                    title: 'Inward Register',
                    image: '/images/InwardRegister.svg',
                    drawerIcon: <InwardRegisterIcon width={20} height={20} />
                }}
            />
        </customDrawer.Navigator>
    );
}

export default DrawerNavigator;