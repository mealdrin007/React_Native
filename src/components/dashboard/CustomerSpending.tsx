import { View, Text, StyleSheet, Animated, Pressable } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { colors } from '../../utils/Colors'
import { FlatList } from 'react-native-gesture-handler'
import { http } from '../../apiService'
import { GetAllCustomers, GetAllOutWardRegisterWithPagination } from '../../utils/UrlConst'
import { AuthContext } from '../../context/AuthContext'
import FooterComponent from '../FooterComponent'
import { debounce, max, min } from 'lodash'
import CustomScrollBar from '../CustomScrollBar/CustomScrollBar'
import { Image } from 'react-native'

const CustomerSpending = () => {
    const [customerList, setCustomerList] = useState([])
    const [customerStartIndex, setCustomerStartIndex] = useState(0);
    const count = 10;
    const authContext = useContext(AuthContext);
    const { token } = authContext;
    // const dropDownIcon = require('../../../public/images/dropdown_arrow_mobile.svg')


    useEffect(() => {
        fetchSpendingList({ startIndex: customerStartIndex, count: count });
    }, [])

    const RenderItem = ({ customer }) => {
        const [expanded, setExpanded] = useState(false);
        const [height, setHeight] = useState(new Animated.Value(160));

        const toggleExpand = () => {
            if (expanded) {
                Animated.timing(height, {
                    toValue: 160,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            } else {
                Animated.timing(height, {
                    toValue: 260 * customerList.length,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }
            setExpanded(!expanded);
        };

        const ExpandedContent = () => {

            const progress = useRef(new Animated.Value(0)).current;
            const animateProgress = () => {

                progress.setValue(0);
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }).start();
            };
            animateProgress();

            const progressBarWidth = progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '70%']
            });
            return (
                <FlatList
                    data={customerList}
                    renderItem={item => {
                        return (
                            <View style={styles.spendingSplitups}>
                                <Text style={styles.title}>Product Name</Text>
                                <Text style={styles.description}>Product Description</Text>
                                <View style={styles.progressBarCont}>
                                    <Animated.View style={[styles.progressBar, { width: progressBarWidth }]}></Animated.View>
                                </View>
                                <View style={styles.extraData}>
                                    <View style={styles.tag}>
                                        <Text>{"99"} {"Kg"} </Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text>Rs. {"999"}</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text>{"99999"} Sold</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text>{"999999999"} Stock</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    }}
                />

            )
        }

        return (
            <Animated.View style={[styles.stkProgressCont, { height }]}>
                <View style={styles.moreBtn}>
                    <Text>E</Text>
                </View>
                <View style={styles.main}>
                    <Text style={styles.title}>{customer.name}</Text>
                    <Text style={styles.spending}>Spending: ₹ 19000</Text>

                    <View style={styles.extraData}>
                        <Text>Last Purchased : Weed </Text>
                        <Text>: 21/10/2001 </Text>
                    </View>
                    <Pressable onPress={toggleExpand} style={styles.expandBtn}>
                        {/* <Text>{expanded ? "Show less" : "Show More"}</Text> */}
                        {/* <Image
                            source={dropDownIcon} /> */}
                    </Pressable>
                    {
                        expanded && <ExpandedContent />
                    }


                </View>
            </Animated.View>
        )
    }
    const fetchOutwardRegisterList = async ({
        startIndex = customerStartIndex,
        count = 10,
    }) => {
        try {
            return new Promise(async (resolve, reject) => {
                let jsonData = JSON.stringify({
                    startIndex: startIndex,
                    rowCount: count,
                    searchString: null,
                    startDate: null,
                    endDate: null
                });
                let methodtype = 'POST';
                const responseJson = await http.fetchURL(GetAllOutWardRegisterWithPagination, token, jsonData, methodtype);
                if (
                    responseJson.hasOwnProperty('status') &&
                    responseJson.status === 1
                ) {
                    resolve(responseJson?.data?.outwardStock)
                } else if (
                    responseJson.hasOwnProperty('status') &&
                    responseJson.status === 0
                ) {
                    resolve([])
                } else {
                    reject(responseJson)

                }
            })
        } catch (error) {
            //todo: failed alert
            console.log("API failed: " + error)
        }
    }


    const fetchAllCustomerList = async ({
        startIndex = customerStartIndex,
        count = 10,
    }) => {
        try {
            return new Promise(async (resolve, reject) => {
                let jsonData = JSON.stringify({
                    startIndex: startIndex,
                    rowCount: count,
                    searchString: null,
                    startDate: null,
                    endDate: null
                });
                let methodtype = 'POST';
                const responseJson = await http.fetchURL(GetAllCustomers, token, jsonData, methodtype);
                if (
                    responseJson.hasOwnProperty('status') &&
                    responseJson.status === 1
                ) {
                    resolve(responseJson?.data?.customerData)
                } else if (
                    responseJson.hasOwnProperty('status') &&
                    responseJson.status === 0
                ) {
                    resolve([])
                } else {
                    reject(responseJson)

                }
            })
        } catch (error) {
            //todo: failed alert
            console.log("API failed: " + error)
        }

    }
    const fetchSpendingList = useCallback(debounce(
        async ({
            startIndex = customerStartIndex,
            count = 10,
        }) => {
            Promise.all([
                fetchAllCustomerList({ startIndex, count }),
                // fetchOutwardRegisterList({ startIndex, count })
            ]).then(result => {

                const customerList: any = result[0];
                // const inwardRegister: any = result[1];

                setCustomerList(customerList)



            }).catch((error) => {
                console.log("error occured: " + JSON.stringify(error))
            })

        }, 1000
    ), [customerStartIndex])

    return (
        <CustomScrollBar scrollProgress={50} listRef={null} >
            <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={styles.container}
                data={customerList}
                renderItem={(item) => <RenderItem customer={item.item} />}
            />
        </CustomScrollBar>


    )
}

export default CustomerSpending

const styles = StyleSheet.create({

    container: {
        height: 500,
    },
    stkProgressCont: {
        borderWidth: 2,
        borderRadius: 20,
        backgroundColor: colors.White,
        borderColor: '#EFF0F6',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 8,
        marginRight: 16,
        overflow: 'hidden',

    },
    moreBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        borderWidth: 2,
        borderRadius: 20,
        backgroundColor: colors.White,
        borderColor: '#EFF0F6',
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center"
    },
    progressBarCont: {
        borderWidth: 2,
        backgroundColor: "smockwhite",
        borderColor: '#EFF0F6',
        borderRadius: 99,
        overflow: 'hidden',
        justifyContent: "center",
        marginVertical: 12
    },
    progressBar: {
        backgroundColor: 'mediumseagreen',
        height: 18,
        borderTopRightRadius: 99,
        borderBottomRightRadius: 99,

    },
    main: {
        display: "flex",
        flex: 1,
        width: "100%",
        padding: 8
    },
    title: {
        fontSize: 18,
        marginVertical: 6,
        marginHorizontal: 4,
    },
    spending: {
        letterSpacing: 0.6,
        marginVertical: 2,
        marginHorizontal: 4,

    },
    extraData: {
        display: "flex",
        flexDirection: 'row',
        marginHorizontal: 4,
        marginVertical: 6
    },
    expandBtn: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 6
    },
    spendingSplitups: {
        borderTopWidth: 2,
        backgroundColor: colors.White,
        borderColor: '#EFF0F6',
        marginVertical: 16,
        paddingVertical: 16
    },
    description: {
        letterSpacing: 0.6,
        marginVertical: 2,
        marginHorizontal: 4
    },
    tag: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 99,
        borderColor: '#EFF0F6',
        borderWidth: 2,
        marginRight: 8
    }

})