import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { colors } from '../../utils/Colors';

interface AddAnEntryButtonProps {
    setModalVisible: (visible: boolean) => void;
    handleAddEntry: () => void
}

const AddAnEntryButton: React.FC<AddAnEntryButtonProps> = ({ setModalVisible, handleAddEntry }) => {

    return (

        <View style={styles.addButtonContainer}>

            <View style={styles.addButtonSection}>
                <Pressable
                    style={styles.addButtonSection}
                    onPress={handleAddEntry}
                >
                    <Text style={styles.addEntryText}>Add a entry</Text>
                    <Image source={{ uri: "/images/basil_add-solid.svg" }}
                        style={{
                            height: 24,
                            width: 24,
                        }} />
                </Pressable>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    addButtonContainer: {
        marginTop: 10,
        marginBottom: 10
    },
    addButtonSection: {
        width: 163,
        height: 30,
        backgroundColor: colors.Blue_Color_006cff,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: colors.Blue_Color_006cff,
        borderRadius: 5,
        shadowColor: colors.Card_Shadow_Color,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    addEntryText: {
        color: colors.White,
        textAlign: 'center',
        fontFamily: 'Poppins-Bold',
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 15,
        marginRight: 10
    },
})

export default AddAnEntryButton