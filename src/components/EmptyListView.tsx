import React from 'react';
import { View, Text } from 'react-native';

const EmptyListView = () => {
    return (
        <View style={{
            flex: 1,
            paddingTop: 10,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Text>{'No data'}</Text>
        </View>
    );
};

export default EmptyListView;
