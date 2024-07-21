import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../utils/Colors';

interface CustomAlertProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    handleDeleteWeb?: () => void
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, message, onClose, handleDeleteWeb }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            style={{ height: 300, width: 500 }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text>{message}</Text>
                    <View style={{
                        flexDirection: 'row',
                        position: 'absolute',
                        bottom: 20,
                        right: 30
                    }}>
                        <TouchableOpacity
                            style={{
                                margin: 5
                            }}
                            onPress={onClose}>
                            <Text style={styles.closeButton}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                margin: 5
                            }}
                            onPress={handleDeleteWeb}>
                            <Text style={styles.closeButton}>Yes</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.Color_Gradient_Black,
    },
    modalView: {
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        width: 400,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
        shadowColor: colors.Color_000,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    closeButton: {
        marginTop: 10,
        color: colors.Blue
    },
});

export default CustomAlert;