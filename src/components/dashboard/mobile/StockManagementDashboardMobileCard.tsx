import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../../../utils/Colors';

interface StockManagementDashboardMobileCardProps {
  header: string;
  text: string | undefined;
}

const StockManagementDashboardMobileCard: React.FC<
  StockManagementDashboardMobileCardProps
> = ({ header, text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>{header}</Text>
      </View>
      <View style={styles.subTextContainer}>
        <Text style={styles.subText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 115,
    minHeight: 115,
    height: 115,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: colors.White,
    borderColor: '#EFF0F6',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    padding: 8,
  },
  subText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: colors.black_Heading,
    fontFamily: 'Inter-Bold',
  },
  headerTextContainer: {
    position: 'absolute',
    top: 0,
  },
  subTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StockManagementDashboardMobileCard;
