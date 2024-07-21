import { Dimensions, useWindowDimensions } from 'react-native';
import { mobileWidth, tabletWidth } from '../UrlConst';

type DimensionsType = {
    width: number;
    height: number;
    breakPoints: breakPointsType
}

type breakPointsType = {
    mobileWidth: number;
    tabletWidth: number;
    tabletWidth_mid: number;
    webWidth: number;
    webWidth_collapsed: number;
    webWidth_mid: number;

};
const useDimensions: () => DimensionsType = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const breakPoints:breakPointsType = {
    mobileWidth:mobileWidth,
    tabletWidth:tabletWidth,
    tabletWidth_mid:600,
    webWidth:1200,
    webWidth_collapsed:900,
    webWidth_mid:1000,
  }
  
  return { width:screenWidth,height:screenHeight, breakPoints:breakPoints };
};

export default useDimensions;
