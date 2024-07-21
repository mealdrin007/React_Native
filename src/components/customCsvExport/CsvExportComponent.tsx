import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CSVLink } from 'react-csv';
import { colors } from '../../utils/Colors';

interface CsvExportComponentProps {
    csvData: any[];
    headers: any[];
}

const CsvExportComponent: React.FC<CsvExportComponentProps> = ({ csvData, headers }) => {
    return (
        <View style={styles.uploadContainer}>
            {
                csvData?.length !== 0 ?
                    <CSVLink data={csvData} headers={headers} style={{ textDecoration: 'none' }}>
                        <View style={styles.csvButtonContainer}>
                            <View style={{ paddingHorizontal: 10 }}>
                                <Image
                                    source={{ uri: '/images/PaperUpload.svg' }}
                                    style={styles.calendarIcon}
                                />
                            </View>
                            <View style={{ paddingHorizontal: 10 }}>
                                <Text style={styles.exportCsvTextStyle}>Export to CSV</Text>
                            </View>
                        </View>
                    </CSVLink>
                    :
                    <View style={styles.csvButtonContainer}>
                        <View style={{ paddingHorizontal: 10 }}>
                            <Image
                                source={{ uri: '/images/PaperUpload.svg' }}
                                style={styles.calendarIcon}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 10 }}>
                            <Text style={styles.exportCsvTextStyle}>Export to CSV</Text>
                        </View>
                    </View>
            }

        </View>
    )
}

const styles = StyleSheet.create({
    uploadContainer: {
        borderRadius: 8,
        borderStyle: 'solid',
        borderColor: colors.Border_Color_Grey,
        borderWidth: 1.35,
        paddingHorizontal: 8,
        paddingVertical: 4,
        height: 32,
        flexDirection: 'row',
        width: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportCsvTextStyle: {
        color: colors.Border_Color_Grey,
        textAlign: 'center',
        fontFamily: 'Roboto-Medium',
        fontSize: 14,
        fontWeight: '500',
    },
    csvButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarIcon: {
        width: 22,
        height: 22,
    },
})

export default CsvExportComponent