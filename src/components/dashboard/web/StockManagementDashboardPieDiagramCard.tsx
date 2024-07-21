import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../../../utils/Colors';
import { PieChart } from 'react-native-svg-charts';
import { ScrollView } from 'react-native-gesture-handler';
interface StockManagementDashboardPieDiagramCardProps {
  header: string;
  data: {
    title: string;
    value: string | number;
    id: string;
    color?: string;
  }[];
  text?: number | undefined;
  layout?: "expanded-horizontal" | "expanded-vertical" | "collapsed-vertical" | "collapsed-horizontal"
}

const StockManagementDashboardPieDiagramCard: React.FC<
  StockManagementDashboardPieDiagramCardProps
> = ({ header, data, text, layout }) => {

  function generateColors(arr: any) {

    let l = 80;
    let h = 233 - 10;
    let s = 100;

    let percentages = arr.sort().map((_: any) => {
      if (l > 20) {
        l = l - 10;
        h = h + 2
      } else {
        h = h + 20;
        l = 70
      }
      return [h, s + '%', l + '%']
    }).reverse();
    return percentages.map((seg: string[]) => `hsl(${seg[0]},${seg[1]},${seg[2]})`)
  }

  const colors = generateColors(data)

  const chart = data.map((item, index) => ({
    key: index + 1,
    value: item.value,
    svg: item.color ? { fill: item.color } : { fill: colors[index] },
    title: item.title
  }))
  var pieChartWidth = layout == "expanded-horizontal" ?
    Math.max(Dimensions.get("window").width / 4.6, 260) :
    layout == "collapsed-vertical" ? 200 :
      layout == "expanded-vertical" ? 200 : 260
  return (
    <View style={[styles.container, {
      minWidth: 280
    }]}>
      <View style={styles.subContainer}>
        {header && <Text style={styles.headerText}>{header}</Text>}
      </View>
      <View
        style={[{
          justifyContent: 'center',
          alignItems: 'center',

        }, layout != "expanded-horizontal" && layout != "expanded-vertical" && layout != "collapsed-horizontal" ? {
          flexDirection: 'row',
        } : {
          margin: 28,
          height: 370
        }]}>
        {
          !data.every(item => item.value === 0) ? (<PieChart
            style={{
              height: layout != "expanded-horizontal" && layout != "expanded-vertical" ? 196 : 316,
              width: pieChartWidth,
              paddingHorizontal: 8,
              paddingVertical: 16
            }}
            data={chart}
            innerRadius={'50%'}
            outerRadius={'100%'}
            padAngle={0.004}
          />) : <View style={{
            height: 200,
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Text style={{
              fontSize: 26,
              color: "grey"
            }}>There is No Data.</Text>
          </View>
        }
        {
          !data.every(item => item.value === 0) && <ScrollView
            horizontal={layout == 'collapsed-horizontal' || layout == 'expanded-horizontal'}
            showsHorizontalScrollIndicator={false}
          >
            {chart.map((item, index) => (
              <View key={index} style={styles.chartIndCont}>
                <View style={[styles.chartInd, { backgroundColor: item.svg.fill }]} />
                <Text>{item.title}</Text>
              </View>
            ))}
          </ScrollView>
        }

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: colors.White,
    borderColor: '#EFF0F6',
    alignItems: 'center',
    margin: 16,
    overflow: 'hidden',
  },
  chartInd: {
    width: 16,
    height: 16,
    borderRadius: 99,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  chartIndCont: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: "center",
    marginTop: -6
  },
  headerText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgb(0, 0, 0, 0.7)',
    margin: 16
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
  innerCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.White,
    borderWidth: 20,
    borderColor: colors.White,
    zIndex: 1,
  },
  chart: {
    position: 'absolute',
    zIndex: 0,
  },
  absoluteView: {
    flex: 1,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StockManagementDashboardPieDiagramCard;
