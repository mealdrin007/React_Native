import { View, Text, StyleSheet, Animated } from 'react-native'
import React from 'react'
import StockManagementDashboardLineDiagram from './web/StockManagementDashboardLineDiagram'
import { colors } from '../../utils/Colors'
import useDimensions from '../../utils/hooks/useDimensions'

type CustomerVendorCardProps = {
    outwardStock: any
    inwardStock: any
}

enum CardLayout {
    Full = "fullLayout",
    Medium = "mediumLayout",
    Compact = "compactLayout",
}

const CustomerVendorCard: React.FC<CustomerVendorCardProps> = ({ outwardStock, inwardStock }) => {
    const dimensions = useDimensions();
    var screenWidth = dimensions.width
    var cardLayout = screenWidth < dimensions.breakPoints.tabletWidth ? CardLayout.Compact : screenWidth < dimensions.breakPoints.tabletWidth ? CardLayout.Medium : CardLayout.Full;

    return (
        <Animated.View style={[styles.cardContainer, cardLayout === CardLayout.Compact ? { minWidth: 300 } : {
            minWidth: 100, marginRight: 16, marginLeft: 8
        }]}>
            <View style={[styles.vertCardContainer, { alignItems: 'center' }]}>
                <View style={{ paddingBottom: 8, }}>
                    <Text style={styles.titleText}>Customer / Vendor</Text>
                </View>
                <View style={[cardLayout === CardLayout.Full ? styles.vertCardContainer : styles.horiCardContainer]}>

                    <StockManagementDashboardLineDiagram
                        header="Total Number of Customers"
                        text={outwardStock?.totalCustomer.toString()}
                    />
                    <StockManagementDashboardLineDiagram
                        header="Total Number of Vendors"
                        text={inwardStock?.totalVendor.toString()}
                    />
                </View>
            </View>
        </Animated.View>
    )
}

export default CustomerVendorCard

const styles = StyleSheet.create({
    vertCardContainer: {
        display: 'flex',
        justifyContent: 'center',

    },
    horiCardContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    titleText: {
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 32.81,
        color: colors.black_Heading,
        textAlign: 'center'
    },
    cardContainer: {

        alignItems: "stretch",
        borderRadius: 16,
        backgroundColor: "white",
        padding: 32,
        marginVertical: 16,
        shadowColor: colors.Color_9e9e9e,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        maxHeight: 580

    },
});
