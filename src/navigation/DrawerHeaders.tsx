import React, { useContext, useState } from "react"
import { Image, Platform, Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from "react-native"
import SearchBar from "../components/search/SearchBar";
import LogoWithNameIcon from '../../public/images/logo_with_name_mobile.svg'
import MenubarIcon from '../../public/images/menu-hamburger_mobile.svg'
import EllipseIcon from '../../public/images/Ellipse.svg'
import { screenWidth } from "../utils/UrlConst";
import { AuthContext } from "../context/AuthContext";
import { extractNameFromEmail } from "../utils/UrlConst";
import { colors } from "../utils/Colors";

export const topBarHeight = 68;

interface drawerHeaderProps {
    toggleDrawer: () => void
    showToggleButton: boolean
}

export const DrawerHeaders: React.FC<drawerHeaderProps> = ({ toggleDrawer, showToggleButton = true }) => {

    const { width } = useWindowDimensions();

    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const authContext = useContext(AuthContext);

    const { name } = authContext;

    return (
        <SafeAreaView>
            <View style={{}}>
                {
                    width > 1100 ?
                        (
                            <View style={styles.container}>
                                <Image source={{ uri: "/images/LogoWithName.svg" }} style={styles.headerIcon} />
                                {/* <SearchBar placeholder="Search for anything..." handleSearchChange={handleSearchChange} searchQuery={searchQuery} /> */}
                                <View style={styles.profileHeaderContainer}>
                                    {
                                        // width > screenWidth ?
                                        //     <Image source={{ uri: "/images/notification.svg" }}
                                        //         style={styles.notificationIcon} /> :
                                        //     <Image source={{ uri: "/images/Ellipse.svg" }}
                                        //         style={styles.profileIcon} />
                                    }
                                    <View style={styles.profileNameContainer}>
                                        <Text style={styles.nameText}>{extractNameFromEmail(name)}</Text>
                                        <Text style={styles.addressText}>KL, India</Text>
                                    </View>

                                    <View style={styles.profileIconContainer}>
                                        <Image source={{ uri: "/images/profileIcon.svg" }}
                                            style={styles.profileIcon} />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.mobileContainer}>
                                {showToggleButton &&
                                    <Pressable style={styles.hamburgerIcon} onPress={toggleDrawer}>
                                        {Platform.OS !== 'web' ?
                                            <MenubarIcon
                                                height={35}
                                                width={35}
                                            />
                                            :
                                            <Image source={{ uri: "/images/menu-hamburger_mobile.svg" }}
                                                style={{
                                                    height: 35,
                                                    width: 35
                                                }}
                                            />
                                        }
                                    </Pressable>}
                                {
                                    Platform.OS !== 'web' ?
                                        <LogoWithNameIcon
                                            width={122}
                                            height={72}
                                        /> :
                                        <Image source={{ uri: "/images/LogoWithName.svg" }} style={{
                                            height: 72, width: 122
                                        }} />
                                }
                                <View style={styles.profileHeaderContainer}>
                                    <View style={styles.profileHeaderSection}>
                                        {
                                            Platform.OS !== 'web' ?
                                                <EllipseIcon
                                                    height={49}
                                                    width={49}
                                                /> :
                                                <Image source={{ uri: "/images/Ellipse.svg" }}
                                                    style={styles.profileIcon} />
                                        }
                                    </View>
                                </View>
                            </View>
                        )
                }
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: topBarHeight,
        borderRightColor: colors.Color_9e9e9e,
        shadowColor: colors.Color_9e9e9e,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        zIndex: 20000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 25,
        backgroundColor: colors.White

    },
    imageContainer: {
        width: 50,
        height: 60,
        padding: 8,
        alignItems: "center",
        justifyContent: "center"
    },
    image: {
        width: 30,
        height: 30,
        padding: 8
    },
    headerIcon: {
        width: 143,
        height: 78,
        paddingTop: 3,
    },
    profileHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileHeaderSection: {
        borderRadius: 50,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#f0f6ff',
        width: 49,
        height: 49,
    },
    notificationIcon: {
        width: 37.95,
        height: 35,
        paddingTop: 24,
    },
    profileNameContainer: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 15,
        marginLeft: 35
    },
    nameText: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 19.36,
        textAlign: 'right',
        color: '#0D062D',
        marginBottom: 5
    },
    addressText: {
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 16.94,
        textAlign: 'right',
        color: colors.Color_787486
    },
    profileIconContainer: {
        borderRadius: 50,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#f0f6ff',
        width: 49,
        height: 49,
    },
    profileIcon: {
        width: 49,
        height: 49,
    },
    mobileContainer: {
        width: "100%",
        height: 80,
        borderRightColor: colors.Color_9e9e9e,
        shadowColor: colors.Color_9e9e9e,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        zIndex: 20000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: colors.White,
    },
    hamburgerIcon: {
        width: 35,
        height: 35,
        padding: 8,
        alignItems: "center",
        justifyContent: "center"
    }
})