import { View, StyleSheet } from 'react-native'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';


type CustomScrollBarType = {
    scrollProgress: any;
    listRef: any;
    children: React.ReactNode
}

const CustomScrollBar: React.FC<CustomScrollBarType> = ({ scrollProgress, listRef, children }) => {

    const [height, setHeight] = useState(0);
    const [barPos, setBarPos] = useState(scrollProgress);
    const [lowBound, setLowBound] = useState(0);
    const [highBound, setHighBound] = useState(0);
    const scrollBarContRef = useRef(null);
    const scrollBarRef = useRef(null);

    useEffect(() => {
        setBarPos(scrollProgress);
    }, [scrollProgress]);
    useFocusEffect(React.useCallback(() => {

        if (scrollBarContRef.current) {
            setLowBound(scrollBarContRef.current.getBoundingClientRect().y)
            setHighBound(scrollBarContRef.current.getBoundingClientRect().y + scrollBarContRef.current.getBoundingClientRect().height)

        }
    }, [scrollBarContRef]));

    const scrollToPercentage = (scrollTo) => {
        listRef.current.scrollToOffset({ offset: scrollTo, animated: true });

    };

    function calculatePivotPercentage(lower, higher, pivot) {
        if (higher <= lower) {
            throw new Error('Higher value must be greater than lower value.');
        }
        if (pivot < lower || pivot > higher) {
            throw new Error('Pivot value must be between lower and higher values.');
        }

        // Calculate the percentage position of the pivot point
        const percentage = ((pivot - lower) / (higher - lower)) * 100;
        return percentage;
    }

    const handleMouseDown = (event) => {
        if (event.button === 0) {
            if (scrollBarContRef.current) {
                setLowBound(scrollBarContRef.current.getBoundingClientRect().y)
                setHighBound(scrollBarContRef.current.getBoundingClientRect().y + scrollBarContRef.current.getBoundingClientRect().height)
            }
            // setBarPos(scrollBarContRef.current.getBoundingClientRect().y)
            // console.log("Lower: ", scrollBarContRef.current.getBoundingClientRect().y)
            // console.log("higher: ", scrollBarContRef.current.getBoundingClientRect().y + scrollBarContRef.current.getBoundingClientRect().height)
            // console.log("y: ", event.clientY)
            var scrollY = calculatePivotPercentage(lowBound, highBound, event.clientY) - 10
            // setBarPos(scrollY);
            // scrollBarRef.current.setNativeProps({
            //     style: {
            //         transform: [{ translateY: height * (calculatePivotPercentage(lowBound, highBound, event.clientY) - 10 / 100) }]
            //     }
            // });
            scrollToPercentage(scrollY * 20)

        }
    };

    const handleMouseUp = (event) => {
        // if (event.button === 0) {
        //     console.log('Left mouse button up');
        //     console.log("Y: ", event.clientY)
        //     setBarPos(event.clientY)


        // } else if (event.button === 1) {
        //     console.log('Middle mouse button up');
        // } else if (event.button === 2) {
        //     console.log('Right mouse button up');

        // }
    };
    return (
        <View style={styles.cont}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>
            {children}
            <View style={styles.scrollBarCont}
                ref={scrollBarContRef}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setHeight(height);
                    console.log("layout: ", event);
                }}>
                <View
                    ref={scrollBarRef}
                    style={[styles.scrollBar, barPos > 80 ?
                        { transform: [{ translateY: height - 100 }] } :
                        { transform: [{ translateY: height * (barPos / 100) }] }]} />

            </View>
        </View>
    )
}

export default CustomScrollBar;

const styles = StyleSheet.create({
    cont: {
        flexDirection: "row",
        height: "100%",
        width: "100%"
    },
    scrollBarCont: {
        width: 10,
        backgroundColor: "#EFF0F6",
        borderRadius: 10,
        height: "92%",
        marginLeft: 16
    },
    scrollBar: {
        position: "absolute",
        width: 10,
        backgroundColor: "lightgrey",
        borderRadius: 10,
        height: 100,
        transform: [{ translateY: 200 }],
    }

})