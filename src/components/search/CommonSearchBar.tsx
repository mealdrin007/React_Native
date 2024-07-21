import React from 'react';
import { View, TextInput, StyleSheet, Image, Platform, useWindowDimensions } from 'react-native';
import SearchIcon from '../../../public/images/mobile_search.svg';
import { screenWidth } from '../../utils/UrlConst';
import { colors } from '../../utils/Colors';

interface SearchBarProps {
  placeholder: string;
  searchQuery: string | null;
  handleSearchChange: (value: string) => void;
}

const CommonSearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  handleSearchChange,
  searchQuery,
}) => {
  const { width } = useWindowDimensions();
  return (
    <View style={{ flex: 1 }}>
      {width > screenWidth ? (
        <View style={styles.searchBarContainer}>
          <Image
            source={{ uri: '/images/mobile_search.svg' }}
            style={{
              height: 16,
              width: 16
            }}
          />
          <TextInput
            placeholder={placeholder}
            style={styles.searchInputWeb}
            value={searchQuery ? searchQuery : ''}
            onChangeText={handleSearchChange}
          />
        </View>
      ) : (
        <View style={styles.mobileContainer}>
          {
            Platform.OS === 'web' ?
              <Image
                source={{ uri: '/images/mobile_search.svg' }}
              />
              :
              <SearchIcon />
          }
          <TextInput
            placeholder={placeholder}
            style={styles.searchInput}
            value={searchQuery ? searchQuery : ''}
            onChangeText={handleSearchChange}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.Color_FEFEFE,
    paddingVertical: 5,
    alignItems: 'center',
    width: 210,
    height: 32,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.Color_9A93B3,
    paddingLeft: 5
  },
  searchIcon: {
    width: 20.36,
    height: 22,
    paddingRight: 10,
  },
  searchInputWeb: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.94,
    color: colors.Color_787486,
    marginLeft: 10,
    height: 32,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.Color_787486,
    marginLeft: 2,
    marginRight: 5,
    paddingHorizontal: 2,
    height: Platform.OS === 'android' ? 40 : null,
    alignItems: 'center',
  },
  mobileContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.Color_FEFEFE,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
    height: 35,
    borderWidth: 1.35,
    borderRadius: 8,
    borderColor: colors.Border_Color_Grey,
    borderStyle: 'solid',
    overflow: 'hidden'
  }
});

export default CommonSearchBar;
