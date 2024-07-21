import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import CheckBox from '@react-native-community/checkbox';
import { StockRegisterItem } from '../../../utils/Interfaces';
import { formatDate } from '../../../utils/UrlConst';
import { colors } from '../../../utils/Colors';

interface StockRegisterCardMobileProps {
    item: StockRegisterItem
}

const StockRegisterCardMobile: React.FC<StockRegisterCardMobileProps> = ({ item }) => {

    return (
        <View style={styles.container}>
            <View style={styles.itemSection}>
                <Text style={styles.valueText}>
                    {item.productType.productName}
                </Text>
            </View>
            <View style={styles.subItemSection}>
                <Text style={styles.labelText}>Available Stock</Text>
                <Text style={styles.valueText}>10</Text>
            </View>
            <View style={styles.subItemSection}>
                <Text>Stock Value</Text>
                <Text>{item.price}</Text>
            </View>
            <View style={styles.subItemSection}>
                <Text>Unit</Text>
                <Text>{item.unit.description}</Text>
            </View>
            <View style={styles.subItemSection}>
                <Text>Last Purchase Date</Text>
                <Text>{formatDate(item.modifiedAt)}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.White,
        paddingVertical: 12,
        borderRadius: 8,
        margin: 5,
        shadowColor: colors.Color_000000,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    itemSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: colors.Color_959595,
        borderStyle: 'solid',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    subItemSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    labelText: {
        fontFamily: 'Inter-Bold',
        color: colors.Color_959595,
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '700',
        paddingVertical: 5
    },
    valueText: {
        fontFamily: 'Inter-Regular',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '600',
        color: colors.Color_1b2128
    }
})

export default StockRegisterCardMobile