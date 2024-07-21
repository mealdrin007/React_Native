import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProgressBar from './ProgressBar'

interface FooterComponentProps {
    loading: boolean;
}

const FooterComponent: React.FC<FooterComponentProps> = ({ loading }) => {
    return (
        <View style={styles.footerContainer}>
            {
                loading ?
                    <ProgressBar />
                    : null

            }
        </View>)
}

const styles = StyleSheet.create({
    footerContainer: {
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20
    },
    footerText: {
        fontSize: 14,
        fontFamily: 'Inter-SemiBold',
        textAlign: 'center'
    }
})

export default FooterComponent