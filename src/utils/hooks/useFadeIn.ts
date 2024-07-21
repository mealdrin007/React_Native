import {useRef, useEffect} from 'react';
import {Animated} from 'react-native';

const useFadeIn = (duration: number = 1000,dependency: any[]=[]): Animated.Value => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();
    console.log("fadeAnim: ", dependency);
  }, [dependency]);

  return fadeAnim;
};

export default useFadeIn;
