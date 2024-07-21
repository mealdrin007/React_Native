import React from 'react';
import { View, Text, Platform, Image, StyleSheet } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'
import DropDownArrow from '../../../assets/images/dropdown_arrow_mobile.svg'
import { colors } from '../../utils/Colors';

interface CustomSelectDropdownProps {
    data: any
    defaultValue?: string | number;
    onSelect: (selectedItem: any, index: number) => void;
    placeHolderName: string
    width?: number
    editSelected?: any
}

const CustomSelectDropdown: React.FC<CustomSelectDropdownProps> = (
    { data, defaultValue, onSelect, placeHolderName, width, editSelected }) => {
    return (
        <SelectDropdown
            data={data}
            defaultValue={defaultValue || ''}
            onSelect={onSelect}
            renderButton={(selectedItem, isOpened) => {
                return (
                    <View style={[styles.container, { width: width }]}>
                        <Text style={styles.selectedText}>
                            {(selectedItem ? selectedItem.title : editSelected && editSelected?.title) || placeHolderName}
                        </Text>
                        <View style={{ position: 'absolute', right: 3, padding: 3 }}>
                            {Platform.OS === 'web' ?
                                <Image source={{ uri: "/images/dropdown_arrow_mobile.svg" }}
                                    style={{
                                        height: 10,
                                        width: 10,
                                    }}
                                />
                                : <DropDownArrow
                                    height={10}
                                    width={10}
                                    style={{ marginLeft: 10 }}
                                />
                            }
                        </View>
                    </View>
                );
            }}
            renderItem={(item, index, isSelected) => {
                return (
                    <View style={[styles.renderItemContainer, { ...(isSelected && { backgroundColor: colors.Color_D2D9DF }) }]}>
                        <Text style={styles.renderItemText}>{item.title}</Text>
                    </View>
                );
            }}
            showsVerticalScrollIndicator={false}
            dropdownStyle={styles.dropDownStyle}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        height: 32,
        backgroundColor: colors.Blue_Color_006cff,
        borderColor: colors.Blue_Color_006cff,
        borderWidth: 1,
        borderRadius: 5,
        borderStyle: 'solid',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginVertical: 10,
    },
    selectedText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.White,
        textAlign: 'left',
        fontFamily: 'Poppins-Bold',
    },
    renderItemContainer: {
        backgroundColor: colors.Blue_Color_006cff,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    renderItemText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.White,
        textAlign: 'left',
        fontFamily: 'Poppins-Bold'
    },
    dropDownStyle: {
        backgroundColor: colors.Color_E9ECEF,
        borderRadius: 8,
    }
})

export default CustomSelectDropdown;
