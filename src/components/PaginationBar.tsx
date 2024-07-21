import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../utils/Colors';

interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
    onPageClick: (pageNumber: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ currentPage, totalPages, onNext, onPrev, onPageClick }) => {
    const visiblePages = 3;
    const halfVisible = Math.floor(visiblePages / 2);

    const startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.prevNextButtonContainer} onPress={onPrev}
                disabled={currentPage === 1}
            >
                <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>


            {pageNumbers.map((pageNumber) => (
                pageNumber === currentPage ? (
                    <View style={[styles.pageNumContainer, styles.activePageNumTextContainer]} key={pageNumber}>
                        <Text style={[styles.pageNumText, styles.activePageNumText]}>
                            {pageNumber}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.pageNumContainer} key={pageNumber} onPress={() => onPageClick(pageNumber)}>
                        <Text style={styles.pageNumText}>
                            {pageNumber}
                        </Text>
                    </TouchableOpacity>
                )
            ))}

            <TouchableOpacity style={styles.prevNextButtonContainer} onPress={onNext} disabled={currentPage === totalPages}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pageNumContainer: {
        backgroundColor: colors.Color_e0e0e0,
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 8,
        display: 'flex',
        margin: 5
    },
    pageNumText: {
        color: colors.Color_000000,
        textAlign: 'center',
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        fontWeight: '500',
        width: 13,
        height: 15,
    },
    activePageNumTextContainer: {
        backgroundColor: colors.Color_0a3b83,
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 8,
        display: 'flex'
    },
    activePageNumText: {
        color: colors.White,
        textAlign: 'center',
        fontFamily: 'Roboto-Medium',
        fontSize: 12,
        fontWeight: '500',
        width: 13,
        height: 15,
    },
    pageNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonText: {
        color: colors.Color_9e9e9e,
        fontFamily: 'Roboto-Medium',
        fontWeight: '500',
        fontSize: 12
    },
    prevNextButtonContainer: {
        margin: 5
    }
});

export default PaginationBar;
