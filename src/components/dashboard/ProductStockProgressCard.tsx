import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { colors } from '../../utils/Colors'
import { FlatList } from 'react-native-gesture-handler'
import { http } from '../../apiService'
import { GetAllInWardRegisterWithPagination, GetAllOutWardRegisterWithPagination } from '../../utils/UrlConst';
import { AuthContext } from '../../context/AuthContext'
import FooterComponent from '../FooterComponent'
import { debounce, max, min } from 'lodash'
import CustomScrollBar from '../CustomScrollBar/CustomScrollBar'
import "../../utils/hoverElementStyle.css"
type ProductStockProgressCardProps = {
    inViewport: boolean
}
type ProductDataType = {
    productID: number;
    productName: string;
    productDescription: string;
    price: number;
    inventoryQuantity: number;
    soldQuantity: number;
    unit: string;
    totalInventoryStockValue: number;
    totalSoldStockValue: number;
    layout?: "expanded-horizontal" | "expanded-vertical" | "collapsed-vertical" | "collapsed-horizontal";
}

const ProductStockProgressCard: React.FC<ProductStockProgressCardProps> = ({ inViewport }) => {
    const authContext = useContext(AuthContext);

    const { token } = authContext;


    const progress = useRef(new Animated.Value(0)).current;
    const count = 10;
    const [productList, setProductList] = React.useState<ProductDataType[]>([]);
    const [productStartIndex, setProductStartIndex] = React.useState(0);
    const [scrollPercent, setScrollPercent] = useState(0);
    const productListRef = useRef(null);
    var screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        inViewport && animateProgress();
        inViewport && fetchProductList({ startIndex: productStartIndex, count: count });
    }, [inViewport])
    const animateProgress = () => {
        progress.setValue(0);
        Animated.timing(progress, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };


    const fetchInwardRegisterList = async ({
        startIndex = productStartIndex,
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
                const responseJson = await http.fetchURL(GetAllInWardRegisterWithPagination, token, jsonData, methodtype);
                if (
                    responseJson.hasOwnProperty('status') &&
                    responseJson.status === 1
                ) {
                    resolve(responseJson?.data?.inwardStock);
                } else {
                    reject(responseJson)
                }
            })
        } catch (error) {
            //todo: failed alert
            console.log("API failed: " + error)
        }

    }

    const fetchOutwardRegisterList = async ({
        startIndex = productStartIndex,
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
    const fetchProductList = useCallback(debounce(
        async ({
            startIndex = productStartIndex,
            count = 10,
        }) => {
            Promise.all([
                fetchInwardRegisterList({ startIndex, count }),
                fetchOutwardRegisterList({ startIndex, count })
            ]).then(result => {

                const inwardRegister: any = result[0];
                const outwardRegister: any = result[1];
                if (inwardRegister && outwardRegister) {
                    const combinedData: ProductDataType[] = inwardRegister.map(inwardItem => {

                        var outwardItems = outwardRegister.filter(outwardItem => outwardItem.productTypeID === inwardItem.productTypeID);
                        var totalSoldQuantity = 0;
                        if (outwardItems.length != 0) {
                            totalSoldQuantity = outwardItems.reduce((sum, item) => sum + item.quantity, 0);
                        }

                        return {
                            productID: inwardItem.productTypeID,
                            productName: inwardItem.productType.productName,
                            productDescription: inwardItem.productType.description,
                            price: inwardItem.price,
                            inventoryQuantity: inwardItem.quantity,
                            soldQuantity: totalSoldQuantity,
                            unit: inwardItem.unit.description,
                            totalInventoryStockValue: inwardItem.price * inwardItem.quantity,
                            totalSoldStockValue: inwardItem.price * totalSoldQuantity
                        };
                    });
                    setProductList([...productList, ...combinedData]);
                }



            }).catch((error) => {
                console.log("error occured: " + JSON.stringify(error))
            })

        }, 1000
    ), [productStartIndex])

    const handleLoadMore = useCallback(debounce(async () => {
        fetchProductList({
            startIndex: productStartIndex + productList.length,
            count: 10
        });
    }), [])

    const renderFooter = () => {
        return (
            <FooterComponent loading={true} />
        )
    };

    const RenderItem = ({ item }: any) => {
        const progressBarWidth = progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', max([min([(item.soldQuantity / item.inventoryQuantity) * 100, 100]), 4]) + "%"]
        });
        return (
            <View style={[styles.stkProgressCont]}>
                <Pressable style={styles.moreBtn}>
                    <Text>E</Text>
                </Pressable>
                <View style={styles.main}>
                    <Text style={styles.title}>{item.productName}</Text>
                    <Text style={styles.description}>{item.productDescription}</Text>
                    <View style={styles.progressBarCont}>
                        <Animated.View style={[styles.progressBar, { width: progressBarWidth }]}></Animated.View>
                    </View>
                    <View style={styles.extraData}>
                        <View style={styles.tag}>
                            <Text>{item.inventoryQuantity} {item.unit} </Text>
                        </View>
                        <View style={styles.tag}>
                            <Text>Rs. {item.price}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text>{item.totalSoldStockValue} Sold</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text>{item.totalInventoryStockValue} Stock</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    const handleScroll = (event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const totalScrollHeight = contentSize.height - layoutMeasurement.height;
        const currentScrollPosition = contentOffset.y;

        if (totalScrollHeight > 0) {
            const scrolledPercent = (currentScrollPosition / totalScrollHeight) * 100;
            setScrollPercent(scrolledPercent);
        } else {
            setScrollPercent(0);
        }
    };


    return (
        <CustomScrollBar
            scrollProgress={scrollPercent} listRef={productListRef}>
            <FlatList
                ref={productListRef}
                style={[styles.container]}
                data={productList}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}

                renderItem={(item: { item: { inwardRegisterID: number; productType: any } }) =>
                    <RenderItem key={item.item?.inwardRegisterID} item={item.item} />}
                onEndReached={handleLoadMore}
                onScroll={handleScroll}
                onEndReachedThreshold={0}
                ListFooterComponent={renderFooter}
            />
        </CustomScrollBar>

    )
}

export default ProductStockProgressCard

const styles = StyleSheet.create({

    container: {
        height: 500,
    },
    stkProgressCont: {
        borderWidth: 2,
        borderRadius: 20,
        backgroundColor: colors.White,
        borderColor: '#EFF0F6',
        marginVertical: 16,
        paddingHorizontal: 8,
        paddingTop: 16,
        paddingBottom: 8,
        marginRight: 16,
        width: "100%",
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

        padding: 8
    },
    title: {
        fontSize: 18,
        marginVertical: 6,
        marginHorizontal: 4
    },
    description: {
        letterSpacing: 0.6,
        marginVertical: 2,
        marginHorizontal: 4
    },
    extraData: {
        display: "flex",
        flexDirection: 'row',
        marginHorizontal: 4,
        marginVertical: 6

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