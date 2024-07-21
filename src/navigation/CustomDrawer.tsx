import React, { useContext, useRef, useState } from "react";
import { Text, Pressable, View, StyleSheet, Easing, Animated, Image, Platform, SafeAreaView, useWindowDimensions } from 'react-native';
import {
    useNavigationBuilder,
    DrawerActions,
    createNavigatorFactory,
    DrawerRouter,
} from '@react-navigation/native';
import { DrawerHeaders } from './DrawerHeaders';
import Modal from "react-native-modal";
import { screenWidth } from "../utils/UrlConst";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";
import { colors } from "../utils/Colors";
import LogoutIcon from '../../public/images/logout.svg'
import LogoWithNameIcon from '../../public/images/logo_with_name_mobile.svg'

export type drawerType = "fixed" | "front" | "back";

interface CustomNavigatorProps {
    initialRouteName?: string;
    children: React.ReactNode;
    screenOptions?: any
    contentStyle?: any
    drawerWidth?: number
    drawerType: drawerType
}

const CustomDrawer: React.FC<CustomNavigatorProps> = ({
    initialRouteName,
    children,
    screenOptions,
    contentStyle,
    drawerWidth = 250,
    drawerType = "front"
}) => {
    const { width, height } = useWindowDimensions();

    const { state, navigation, descriptors, NavigationContent } =
        useNavigationBuilder(DrawerRouter, {
            children,
            screenOptions,
            initialRouteName
        });
    const [modalVisible, setModalVisible] = useState(false)
    const leftAnim = useRef(new Animated.Value(-drawerWidth)).current;
    const rightAnim = useRef(new Animated.Value(drawerWidth)).current;

    const authContext = useContext(AuthContext);

    const { setToken, setRole, setName } = authContext;

    // Define the side list view for listing the pages
    const sideListView = () => (
        <SafeAreaView>
            <View style={[styles.modalContainer, {
                width: drawerWidth,
                height: height,
                padding: 10
            }]}>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10
                }}>
                    {
                        Platform.OS !== 'web' ?
                            <LogoWithNameIcon
                                width={drawerWidth}
                                height={72}
                            /> : width < 760 ?
                                <Image source={{ uri: "/images/LogoWithName.svg" }} style={{
                                    height: 72, width: 150
                                }} /> : <View />
                    }
                </View>
                {state.routes.map((route, index) => {
                    const { image, title, drawerIcon } = descriptors[route.key].options;
                    return (
                        <Pressable
                            key={route.key}
                            onPress={() => {
                                const isFocused = state.index === index;
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused) {
                                    navigation.dispatch({
                                        ...DrawerActions.jumpTo(route.name, route.params),
                                        target: state.key,
                                    });
                                }
                                if (drawerType === "front") {
                                    setModalVisible(false)
                                }
                            }}
                            style={state.index === index ? styles.flatListItemSelected : styles.flatListItem}
                        >
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                {width > screenWidth ? (
                                    <Image source={{ uri: image }} style={state.index === index ? styles.selectedMenuIcon : styles.menuIcon} />
                                ) : (
                                    <View style={{ marginRight: 10, marginLeft: 10 }}>
                                        {Platform.OS !== 'web' ?
                                            drawerIcon
                                            :
                                            <Image source={{ uri: image }} style={state.index === index ? styles.selectedMenuIcon : styles.menuIcon} />
                                        }
                                    </View>
                                )}
                                <Text style={state.index === index ? styles.titleSelected : styles.title}>{title ?? route.name}</Text>
                            </View>
                        </Pressable>
                    );
                })}
                <View style={styles.logoutContainer}>
                    <Pressable onPress={handleLogout}
                        style={styles.logoutButton}
                    >{
                            Platform.OS === 'web' ?
                                <Image
                                    source={{ uri: '/images/logout.svg' }}
                                    style={styles.logoutIcon}
                                /> :
                                <LogoutIcon
                                    height={20}
                                    width={20}
                                    style={{
                                        position: 'absolute',
                                        left: 10,
                                    }}
                                />
                        }
                        <Text style={width > screenWidth ? styles.logoutText : styles.logoutTextMobile}>Logout</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView >
    );

    // Get slider for different drawer type
    const getSliderView = () => {
        if (drawerType === "front") {
            return (
                <Modal
                    animationIn={"slideInLeft"}
                    animationOut={"slideOutLeft"}
                    animationInTiming={500}
                    animationOutTiming={900}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    isVisible={modalVisible}
                    style={{ margin: 0, height: "100%" }}
                >
                    <Pressable style={{ flex: 1, backgroundColor: "transparent" }} onPress={() => setModalVisible(false)
                    }>
                        {sideListView()}
                    </Pressable>
                </Modal>
            )
        } else if (drawerType === "back") {
            return (
                <>
                    {modalVisible ?
                        <Animated.View style={{ left: leftAnim }}>
                            {sideListView()}
                        </Animated.View>
                        :
                        null}
                </>
            )
        } else {
            return (
                <>
                    {sideListView()}
                </>
            )
        }
    }

    const toggleButtonAction = () => {
        setModalVisible(!modalVisible)
        if (drawerType === "back") {
            if (!modalVisible) {
                Animated.timing(leftAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.linear
                }).start();
            }
        }
    }

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear()
            setToken(null);
            setRole(null);
            setName(null);
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            });
        } catch (error) {
            console.error('Error during logout: ', error);
        }
    };

    return (
        <NavigationContent>
            <SafeAreaView style={{
                flex: 1,
                backgroundColor: "honeydew",
            }}>
                <View style={{ flex: 1 }}>
                    <DrawerHeaders toggleDrawer={toggleButtonAction} showToggleButton={drawerType === "fixed" ? false : true} />
                    <View style={{
                        flex: 1,
                        flexDirection: drawerType === "front" ? "column" : "row",
                    }}>
                        {getSliderView()}
                        <View style={[{ flex: 1, margin: 10, left: rightAnim }, contentStyle]}>
                            {state.routes.map((route, i) => {
                                return (
                                    <View
                                        key={route.key}
                                        style={[
                                            StyleSheet.absoluteFill,
                                            { display: i === state.index ? 'flex' : 'none' },
                                        ]}>
                                        {descriptors[route.key].render()}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </NavigationContent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: colors.White,
        borderRightColor: colors.Color_9e9e9e,
        shadowColor: colors.Color_9e9e9e,
        shadowOffset: { width: 2, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 3,

    },
    flatListItem: {
        padding: 10,
        marginVertical: 8,
    },
    flatListItemSelected: {
        padding: 10,
        marginVertical: 8,
        borderRadius: 5,
        backgroundColor: colors.Color_Royal_Blue
    },
    title: {
        color: colors.Black
    },
    titleSelected: {
        color: colors.White
    },
    logoutContainer: {
        position: 'absolute',
        bottom: 140,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutIcon: {
        height: 20,
        width: 20,
        position: 'absolute',
        left: 20,
    },
    logoutIconMobile: {
        height: 20,
        width: 20,
        position: 'absolute',
        left: 0
    },
    logoutButton: {
        flexDirection: 'row',
        padding: 10,
        width: 160,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: colors.Blue_Color_006cff,
    },
    logoutText: {
        fontWeight: '300',
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        color: colors.White
    },
    logoutTextMobile: {
        fontWeight: '300',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        color: colors.White
    },
    menuIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        marginLeft: 10
    },
    selectedMenuIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        marginLeft: 10,
        tintColor: colors.White
    }
})

export const createCustomDrawerNavigator = createNavigatorFactory(CustomDrawer);

