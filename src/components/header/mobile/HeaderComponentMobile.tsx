import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AddIcon from '../../../../public/images/basil_add-solid.svg';
import UploadIcon from '../../../../public/images/PaperUpload.svg';
import CommonSearchBar from '../../search/CommonSearchBar';
import DatePickerComponent from '../../customDatePicker/DatePickerComponent';
import { colors } from '../../../utils/Colors';

interface HeaderComponentMobileProps {
  setModalVisible: (visible: boolean) => void;
  handleSearchChange: (text: string) => void;
  searchQuery: string | null;
  title: string;
  selectedDate: DateRange;
  setSelectedDate: (date: DateRange) => void;
  style?: any;
  handleConfirmCalendar: (date: DateRange) => void;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const HeaderComponentMobile: React.FC<HeaderComponentMobileProps> = ({
  setModalVisible,
  handleSearchChange,
  searchQuery,
  title,
  selectedDate,
  setSelectedDate,
  style,
  handleConfirmCalendar

}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{title}</Text>
        <View style={styles.buttonSections}>
          <View style={styles.buttonContainer}>
            <Pressable onPress={() => setModalVisible(true)}>
              <Text style={styles.addEntryText}>Add a entry</Text>
            </Pressable>
            <Pressable
              style={{
                height: 24,
                width: 24,
              }}>
              {
                Platform.OS === 'web' ?
                  <Image
                    source={{ uri: '/images/basil_add-solid.svg' }}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                  />
                  :
                  <AddIcon height={24} width={24} />
              }
            </Pressable>
          </View>
          <Pressable style={styles.uploadButton}>
            {
              Platform.OS === 'web' ?
                <Image
                  source={{ uri: '/images/PaperUpload.svg' }}
                  style={{
                    width: 15.58,
                    height: 18.33,
                    alignItems: 'center',
                  }}
                />
                :
                <UploadIcon
                  width={15.58}
                  height={18.33}
                  style={{
                    alignItems: 'center',
                  }}
                />
            }
          </Pressable>
        </View>
      </View>
      <View style={styles.bodyContainer}>
        <CommonSearchBar
          placeholder="Search"
          handleSearchChange={handleSearchChange}
          searchQuery={searchQuery}
        />
        <DatePickerComponent
          selectedDate={selectedDate}
          style={style}
          setSeletedDate={(date: DateRange) => setSelectedDate(date)}
          handleConfirmCalendar={handleConfirmCalendar}

        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Roboto-Bold',
    fontWeight: '700',
    fontSize: 20,
    color: colors.Font_Text_Color_101828,
  },
  buttonSections: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  buttonContainer: {
    width: 113,
    height: 32,
    backgroundColor: colors.Blue_Color_006cff,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.Blue_Color_006cff,
    borderRadius: 8,
    shadowColor: colors.Card_Shadow_Color,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  addEntryText: {
    color: colors.White,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    marginRight: 10,
  },
  uploadButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.Border_Color_Grey,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  bodyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    alignItems: 'center',
  },
});

export default HeaderComponentMobile;
