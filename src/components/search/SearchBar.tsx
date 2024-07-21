import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Image } from 'react-native';
import { colors } from '../../utils/Colors';

interface SearchBarProps {
    placeholder?: string;
    searchQuery?: string;
    handleSearchChange: (value: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search for anything...', handleSearchChange, searchQuery }) => {

    return (
        <View style={styles.searchBarContainer}>
            <Image source={{ uri: "/images/search-normal.svg" }} style={styles.searchIcon} />
            <TextInput
                placeholder={placeholder}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchBarContainer: {
        flexDirection: 'row',
        backgroundColor: colors.Color_FEFEFE,
        paddingVertical: 10,
        alignItems: 'center',
        width: 385.95,
        height: 44,
        borderWidth: 1,
        borderRadius: 6,
        borderColor: colors.Color_9A93B3,
        paddingLeft: 5
    },
    searchIcon: {
        width: 20.36,
        height: 22,
        paddingRight: 5
    },
    searchInput: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 16.94,
        color: colors.Color_787486,
        marginLeft: 10,
        width: 385.95,
        height: 44,
        paddingHorizontal: 10,
    }
});

export default SearchBar;