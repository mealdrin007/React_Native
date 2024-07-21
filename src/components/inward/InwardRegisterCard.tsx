import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import EditIcon from '../../../public/images/edit_mobile.svg'
import DeleteIcon from '../../../public/images/delete_mobile.svg'
import { InwardRegisterItem } from '../../utils/Interfaces';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../utils/Colors';

interface InwardRegisterCardProps {
    item: InwardRegisterItem;
    handleEditClick: (id: number) => void
    handleDeleteClick: (id: number) => void
}

const InwardRegisterCard: React.FC<InwardRegisterCardProps> = ({ item, handleEditClick, handleDeleteClick }) => {

    const authContext = useContext(AuthContext);

    const { role } = authContext;

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <Text style={styles.headerText}>
                    {item.productType.productName}
                </Text>
                {role === 1 &&
                    <View style={styles.editButtonSection}>
                        <Pressable
                            onPress={() => handleEditClick(item.vendorID)}
                            style={{
                                height: 24,
                                width: 24,
                                marginHorizontal: 4
                            }}>
                            {
                                Platform.OS === 'web' ?
                                    <Image
                                        source={{ uri: '/images/edit_mobile.svg' }}
                                        style={{
                                            height: 24,
                                            width: 24
                                        }}
                                    />
                                    :
                                    <EditIcon
                                        height={24}
                                        width={24}
                                    />
                            }
                        </Pressable>
                        <Pressable
                            onPress={() => handleDeleteClick(item.vendorID)}
                            style={{
                                height: 24,
                                width: 24,
                                marginHorizontal: 4
                            }}>
                            {
                                Platform.OS === 'web' ?
                                    <Image
                                        source={{ uri: '/images/delete_mobile.svg' }}
                                        style={{
                                            height: 24,
                                            width: 24
                                        }}
                                    />
                                    :
                                    <DeleteIcon
                                        height={24}
                                        width={24}
                                    />
                            }
                        </Pressable>
                    </View>
                }
            </View>
            <View style={styles.itemSection}>
                <Text style={styles.labelText}>
                    Vendor Name
                </Text>
                <Text style={styles.valueText}>{item?.vendor.name}</Text>
            </View>
            <View style={styles.itemSection}>
                <Text style={styles.labelText}>Unit</Text>
                <Text style={styles.valueText}>{item.unit.description}</Text>
            </View>
            <View style={styles.itemSection}>
                <Text style={styles.labelText}>Quantity</Text>
                <Text style={styles.valueText}>{item.quantity}</Text>
            </View>
            <View style={styles.itemSection}>
                <Text style={styles.labelText}>Unit Price</Text>
                <Text style={styles.valueText}>{item.price}</Text>
            </View>
            <View style={styles.itemSection}>
                <Text style={styles.labelText}>Total Value</Text>
                <Text style={styles.valueText}>{item.price * item.quantity}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderRadius: 8,
        margin: 5,
        backgroundColor: colors.White,
        shadowColor: colors.Color_000000,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
        borderColor: colors.Color_959595,
        borderStyle: 'solid',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    headerText: {
        fontFamily: 'Inter-SemiBold',
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '600',
        color: colors.Color_1b2128
    },
    editButtonSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center"
    },
    itemSection: {
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

export default InwardRegisterCard
