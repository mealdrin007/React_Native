import React, { useState } from 'react';
import {
  View,
  Pressable,
  Image,
  Text,
  Modal,
  StyleSheet,
  Platform,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import UploadIcon from '../../../public/images/Calendar.svg';
import { formatDatesObject, screenWidth } from '../../utils/UrlConst'
import { StyleProp } from 'react-native';
import { colors } from '../../utils/Colors';

interface DatePickerProps {
  selectedDate: DateRange;
  style?: StyleProp<ViewStyle>;
  handleConfirmCalendar: (date: DateRange) => void;
  setSeletedDate: (date: DateRange) => void;
  collapse?: boolean;
}
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({
  selectedDate,
  style,
  handleConfirmCalendar,
  setSeletedDate,
  collapse = true
}) => {
  const { width } = useWindowDimensions();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [date, setDate] = useState<DateRange>({
    startDate: null,
    endDate: null
  });


  const handleDateChange = (_date: Date, type: string) => {

    if (type === 'START_DATE') {

      setDate((_) => ({ endDate: null, startDate: _date }))
      setSeletedDate({
        startDate: _date,
        endDate: null
      })
    }
    if (type === 'END_DATE') {
      setDate((_) => ({ ..._, endDate: _date }))
      setCalendarVisible(true);
      setSeletedDate({
        startDate: date.startDate,
        endDate: _date
      })
    }

  };

  const handleClick = () => {
    setCalendarVisible(false)
    handleConfirmCalendar(date)
    setSeletedDate({
      startDate: date.startDate,
      endDate: date.endDate
    })
  }

  const handleClear = () => {
    setCalendarVisible(false)
    setDate({
      startDate: null,
      endDate: null
    });
    setSeletedDate({
      startDate: null,
      endDate: null
    })

  }
  const formatDate = (_date: Date | null): string => {
    if (!_date) {
      return ""
    }
    const date = new Date(_date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  return (
    <Pressable onPress={() => setCalendarVisible(!isCalendarVisible)} style={style ? style : styles.datePickerContainer}>
      <View >
        {width > screenWidth ? (
          <Image
            source={{ uri: '/images/Calendar.svg' }}
            style={styles.downloadIcon}
          />
        ) : (
          Platform.OS === 'web' ?
            <Image
              source={{ uri: '/images/Calendar.svg' }}
              style={{
                width: 15.58,
                height: 18.33,
                alignItems: 'center',
              }}
            /> :
            <UploadIcon
              width={15.58}
              height={18.33}
              style={{
                alignItems: 'center',
              }}
            />
        )}
      </View>
      {
        !collapse && selectedDate ?
          <Text style={styles.datePickerTitle}>
            {
              selectedDate.startDate !== null && formatDate(selectedDate.startDate)
            }
            {" - "}
            {
              selectedDate.endDate !== null && formatDate(selectedDate.endDate)
            }

          </Text> : <View />
      }
      <Modal
        visible={isCalendarVisible}
        animationType="fade"
        transparent={true}
      >
        <Pressable onPress={() => { }} style={styles.modalCalendarContainer}>
          <View style={[styles.modalCalendarSection, {
            width: width > screenWidth ? 400 : 300,
            height: width > screenWidth ? 340 : 300
          }]}>
            <CalendarPicker
              allowRangeSelection={true}
              selectedStartDate={selectedDate && selectedDate.startDate}
              selectedEndDate={selectedDate && selectedDate.endDate}
              onDateChange={handleDateChange}
              width={width > screenWidth ? 400 : 300}
              height={width > screenWidth ? 340 : 300}
              selectedRangeStyle={{
                backgroundColor: colors.Blue_Color_006cff
              }}
            />
            <View style={styles.closeButtonContainer}>
              <Pressable style={styles.button} onPress={handleClick}>
                <Text>Ok</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={handleClear}>
                <Text>Clear</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    // flex: 1,
    flexDirection: 'row',
    // position: 'absolute',
    // right: 0,
    borderRadius: 8,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    borderWidth: 1.35,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadIcon: {
    height: 22,
    width: 22,
  },
  datePickerTitle: {
    flex: 1,
    color: colors.Border_Color_Grey,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  modalCalendarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  modalCalendarSection: {
    borderWidth: 1,
    backgroundColor: colors.White,
    borderColor: colors.Black,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    position: 'absolute',
    bottom: 5,
    right: 20,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    height: 24,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
});

export default DatePickerComponent;