import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../../../utils/Colors';
import { mobileWidth } from '../../../utils/UrlConst';

interface StockManagementDashboardLineDiagramProps {
  header: string;
  text: string | undefined;
}

const StockManagementDashboardLineDiagram: React.FC<
  StockManagementDashboardLineDiagramProps
> = ({ header, text }) => {
  var screenWidth = Dimensions.get("window").width;
  return (
    <View style={[styles.container, screenWidth < mobileWidth ?
      { width: 120, height: 120 } : { width: 200, height: 200 }]}>
      <View style={styles.subContainer}>
        <Text style={[styles.headerText, screenWidth < mobileWidth ? { fontSize: 12 } : { fontSize: 18 }]}>{header}</Text>
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
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: colors.White,
    borderColor: '#EFF0F6',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    margin: 16

  },
  headerText: {
    textAlign: 'center',
    color: 'rgb(0, 0, 0, 0.7)',
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

export default StockManagementDashboardLineDiagram;
