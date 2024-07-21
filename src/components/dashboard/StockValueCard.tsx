import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { colors } from '../../utils/Colors';
import DatePickerComponent from '../customDatePicker/DatePickerComponent';
import StockManagementDashboardLineDiagram from './web/StockManagementDashboardLineDiagram';
import StockManagementDashboardPieDiagramCard from './web/StockManagementDashboardPieDiagramCard';
import useDimensions from '../../utils/hooks/useDimensions';

type DateRange = {
    startDate: Date | null;
    endDate: Date | null;
}

type StockValueCardProps = {
    outwardStock: any;
    inwardStock: any;
    handleCloseCalendar: () => void;
    selectedDate: DateRange;
    setSeletedDate: (date: DateRange) => void;
}

enum CardLayout {
    Full = "fullLayout",
    Medium = "mediumLayout",
    Compact = "compactLayout",
}

enum ChartLayout {
    CollapsedVertical = "collapsed-vertical",
    CollapsedHorizontal = "collapsed-horizontal",
    ExpandedVertical = "expanded-vertical",
    ExpandedHorizontal = "expanded-horizontal",
}

const StockValueCard: React.FC<StockValueCardProps> = ({ outwardStock, inwardStock, handleCloseCalendar, selectedDate, setSeletedDate }) => {
    const dimensions = useDimensions();
    var screenWidth = dimensions.width;
    var drawerVisible = screenWidth > dimensions.breakPoints.webWidth_mid + 100;
    var cardLayout: CardLayout = CardLayout.Full;
    var chartLayout: ChartLayout = ChartLayout.ExpandedHorizontal;

    if (drawerVisible) {
        if (screenWidth > dimensions.breakPoints.webWidth) {
            cardLayout = CardLayout.Full;
            chartLayout = ChartLayout.ExpandedHorizontal;
        } else {
            cardLayout = CardLayout.Medium;
            chartLayout = ChartLayout.CollapsedVertical;
        }
    } else {
        if (screenWidth < dimensions.breakPoints.tabletWidth_mid) {
            cardLayout = CardLayout.Compact;
            chartLayout = ChartLayout.CollapsedVertical;
        } else if (screenWidth < dimensions.breakPoints.tabletWidth) {
            cardLayout = CardLayout.Full;
            chartLayout = ChartLayout.ExpandedVertical;
        } else if (screenWidth < dimensions.breakPoints.webWidth_collapsed) {
            cardLayout = CardLayout.Medium;
            chartLayout = ChartLayout.CollapsedVertical;
        } else if (screenWidth < dimensions.breakPoints.webWidth_mid) {
            cardLayout = CardLayout.Full;
            chartLayout = ChartLayout.ExpandedVertical;
        } else {
            cardLayout = CardLayout.Full;
        }
    }

    return (
        <View style={[styles.cardContainer, cardLayout === CardLayout.Compact ? { minWidth: 300 } : { minWidth: 500, paddingHorizontal: 16 }]}>
            <View style={[styles.vertCardContainer]}>
                <View style={{
                    paddingBottom: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    <Text style={styles.titleText}>Stock Value</Text>
                    <View >
                        <DatePickerComponent
                            handleConfirmCalendar={handleCloseCalendar}
                            selectedDate={selectedDate}
                            collapse={dimensions.width < dimensions.breakPoints.webWidth_mid}
                            setSeletedDate={(_date: DateRange) => setSeletedDate(_date)}
                        />
                    </View>
                </View>
                <View style={cardLayout === CardLayout.Full ? styles.horiCardContainer : styles.vertCardContainer}>

                    <View style={[cardLayout === CardLayout.Full ? styles.vertCardContainer : styles.horiCardContainer]}>
                        <StockManagementDashboardLineDiagram
                            header="Inward Register Stock Value"
                            text={"₹ " + inwardStock?.totalValue.toString()}
                        />
                        <StockManagementDashboardLineDiagram
                            header="Outward Register Stock Value"
                            text={"₹ " + outwardStock?.totalValue.toString()}
                        />
                    </View>
                    <StockManagementDashboardPieDiagramCard
                        header=""
                        text={outwardStock?.totalMasterCustomerNum}
                        data={[{
                            value: inwardStock?.totalValue ?? 0, id: "0",
                            title: 'Inward',
                            color: "#2D9CDA"
                        }, {
                            value: outwardStock?.totalValue ?? 0, id: "1",
                            title: 'Outward',
                            color: "#FC5B5B"
                        }]}
                        layout={chartLayout}
                    />
                </View>
            </View>
        </View>
    )
}

export default StockValueCard

const styles = StyleSheet.create({
    vertCardContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    horiCardContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    titleText: {
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 32.81,
        color: colors.black_Heading,
        textAlign: 'center'
    },
    cardContainer: {
        borderRadius: 16,
        backgroundColor: "white",
        paddingVertical: 28,
        marginVertical: 16,
        shadowColor: colors.Color_9e9e9e,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        maxHeight: 580,
        flex: 1,
        justifyContent: 'center',
        alignItems: "stretch"
    },
});
