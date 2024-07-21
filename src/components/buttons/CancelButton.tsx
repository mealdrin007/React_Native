import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../../utils/Colors'

interface CancelButtonProps {
    handleClose: () => void
}

const CancelButton: React.FC<CancelButtonProps> = ({ handleClose }) => {
    return (
        <Pressable
            onPress={handleClose}
            style={{
                backgroundColor: colors.White,
                borderRadius: 8,
                borderStyle: 'solid',
                borderColor: colors.Blue_Color_006cff,
                borderWidth: 1,
                paddingVertical: 6,
                paddingHorizontal: 20,
                width: 106,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'flex-start',
                marginHorizontal: 5
            }}>
            <Text style={{
                color: colors.Blue_Color_006cff,
                fontFamily: 'Inter-Medium',
                fontSize: 12,
                fontWeight: '500'
            }}>No, cancel</Text>
        </Pressable>
    )
}

export default CancelButton

const styles = StyleSheet.create({})