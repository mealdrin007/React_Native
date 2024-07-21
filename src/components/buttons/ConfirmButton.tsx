import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../../utils/Colors'

interface ConfirmButtonProps {
    handleConfirm: () => void
}

const ConfirmButton: React.FC<ConfirmButtonProps> = ({ handleConfirm }) => {
    return (
        <Pressable
            onPress={handleConfirm}
            style={{
                backgroundColor: colors.Blue_Color_006cff,
                borderRadius: 8,
                borderStyle: 'solid',
                borderColor: colors.Blue_Color_006cff,
                borderWidth: 1,
                paddingVertical: 6,
                width: 106,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'flex-end',
                marginHorizontal: 5
            }}>
            <Text style={{
                color: '#f5f5f5',
                fontFamily: 'Inter-Medium',
                fontSize: 12,
                fontWeight: '500',
            }}>Yes, confirm</Text>
        </Pressable>
    )
}

export default ConfirmButton

const styles = StyleSheet.create({})