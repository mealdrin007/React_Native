import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../../../utils/Colors';

interface StockManagementDashboardCardProps {
  header: string;
  text: string | undefined;
}

const StockManagementDashboardCard: React.FC<
  StockManagementDashboardCardProps
> = ({ header, text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.headerText}>{header}</Text>
      </View>
      <View style={styles.subContainer2}>
        <Text style={styles.text2}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: 200,
    height: 200,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.White,
    borderColor: '#EFF0F6',
    // paddingTop: 9.97,
    // paddingHorizontal: 6.32,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    margin: 16

  },
  headerText: {
    // fontWeight: '700',
    fontSize: 18,
    // lineHeight: 24.2,
    textAlign: 'center',
    color: 'rgb(0, 0, 0, 0.7)',
    // fontFamily: 'Inter-Bold',
  },
  text2: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 29.05,
    color: colors.black_Heading,
    fontFamily: 'Inter-Bold',
  },
  subContainer: {
    flex: 2,
    alignItems: 'center',
  },
  subContainer2: {
    flex: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default StockManagementDashboardCard;
