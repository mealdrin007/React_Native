import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Modal,
  Text,
  View,
  Pressable,
  Platform,
  Image,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import AuthTextInput from '../../textComponent/AuthTextInput';
import CloseIcon from '../../../../public/images/close_mobile.svg';
import CancelButton from '../../buttons/CancelButton';
import ConfirmButton from '../../buttons/ConfirmButton';
import { UnitInterface } from '../../../utils/Interfaces';
import { http } from '../../../apiService';
import { AddUnits, EditUnits, extractNameFromEmail, isValidUnitDescription, screenWidth } from '../../../utils/UrlConst';
import { colors } from '../../../utils/Colors';
import { AuthContext } from '../../../context/AuthContext';
import { debounce } from 'lodash';

interface AddUnitDetailsModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedItem?: UnitInterface;
  refreshUnitList: () => void;
  fetchUnitsList?: (startIndex: number, rowCount: number, searchValue: string | null, startDate: Date | null, endDate: Date | null) => void;
  showAlert?: (message: string) => void;
  setAlertMessage?: (message: string) => void;
  setEditAlertMessage?: (message: string) => void;
  startIndex?: number;
  rowCount?: number;
  searchText: string | null
  selectedStartDate: Date | null
  selectedEndDate: Date | null;
  updateStates?: (states: UnitInterface) => void;

}

const AddUnitDetailsModal: React.FC<AddUnitDetailsModalProps> = ({
  modalVisible,
  setModalVisible,
  selectedItem,
  refreshUnitList,
  fetchUnitsList,
  showAlert,
  setAlertMessage,
  setEditAlertMessage,
  startIndex,
  rowCount,
  searchText,
  selectedStartDate,
  selectedEndDate,
  updateStates
}) => {
  const { width } = useWindowDimensions();
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [currentDate, setCurrentDate] = useState(new Date)

  const authContext = useContext(AuthContext);

  const { token, name } = authContext;

  useEffect(() => {
    handleEditData();
  }, [selectedItem]);

  const handleEditData = () => {
    if (selectedItem) {
      setDescription(selectedItem.description);
    }
  };

  const checkForErrors = () => {
    setDescriptionError(isValidUnitDescription(description))

    return descriptionError == "valid";
  };

  const onInputTextChange = (
    value: string,
    type: 'Units' | 'Description',
  ): void => {
    if (type === 'Description') {
      setDescription(value);
      setDescriptionError('');
    }
  };

  const addUnitList = useCallback(debounce(async () => {
    let jsonData = JSON.stringify({
      description: description,
      CreatedBy: extractNameFromEmail(name),
      createdAt: currentDate.toISOString()
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURL(AddUnits, token, jsonData, methodtype);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      refreshUnitList && refreshUnitList();
      handleClear();
      setModalVisible(false);
      if (setAlertMessage) {
        setAlertMessage('Unit Added Successfully!');
      }

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 1000), [description, name, currentDate])

  const editUnitList = useCallback(debounce(async () => {
    let jsonData = JSON.stringify({
      unitID: selectedItem?.unitID,
      description: description,
      CreatedBy: extractNameFromEmail(name),
      createdAt: currentDate.toISOString()
    });
    let methodtype = 'PUT';

    let UpdateUnitUrl = `${EditUnits}${selectedItem?.unitID}`;

    const responseJson = await http.fetchURL(
      UpdateUnitUrl,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      if (fetchUnitsList && startIndex && rowCount) {
        fetchUnitsList(startIndex, rowCount, searchText, selectedStartDate, selectedEndDate);
      }
      handleClear();

      updateStates && updateStates({
        unitID: selectedItem?.unitID ?? 0,
        description: description,
        createdAt: currentDate.toISOString(),
        createdBy: name,
        unit: 0
      });

      setModalVisible(false);
      if (setEditAlertMessage) {
        setEditAlertMessage('Unit Updated successfully!');
      }

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 1000), [selectedItem, description, description, name, currentDate])

  const handleConfirm = () => {
    let error = checkForErrors();

    if (error) {
      if (selectedItem) {
        editUnitList();
      } else {
        addUnitList();
      }
    }
  };

  const handleClear = () => {
    setDescriptionError('');
    setDescription('');
  };

  const handleClose = () => {
    setModalVisible(false);
    handleClear();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
      style={{ height: 300 }}>
      <View style={styles.container}>
        <View style={[styles.subContainer, { width: width > screenWidth ? '60%' : '80%', }]}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Unit Details</Text>
            <Pressable onPress={handleClose} style={styles.closeIconContainer}>
              {Platform.OS === 'web' ? (
                <Image
                  source={{ uri: '/images/close_mobile.svg' }}
                  style={{
                    height: 10,
                    width: 10,
                  }}
                />
              ) : (
                <CloseIcon height={10} width={10} />
              )}
            </Pressable>
          </View>
          <Text style={styles.contentText}>Description</Text>
          <AuthTextInput
            placeholder="Description"
            value={description}
            onChangeText={value => onInputTextChange(value, 'Description')}
            style={styles.contentInput}
          />
          {descriptionError == 'invalid' ? (
            <Text style={{ color: 'red' }}>{'Description is invalid.'}</Text>
          ) : descriptionError == "short" ? <Text style={{ color: 'red' }}>{'Description is too short.'}</Text> :
            descriptionError == "blank" && <Text style={{ color: 'red' }}>{'Description required.'}</Text>}

          <View style={[styles.bottonButtomContainer, { justifyContent: width > screenWidth ? 'flex-end' : 'center' }]}>
            <CancelButton handleClose={handleClose} />
            <ConfirmButton handleConfirm={handleConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.Color_Gradient_Black,
  },
  subContainer: {
    backgroundColor: colors.White,
    padding: 20,
    borderRadius: 10
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.Color_54595e,
  },
  closeIconContainer: {
    height: 24,
    width: 24,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.Color_E5E5E5,
  },
  contentText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: colors.Color_4f4f4f,
    lineHeight: 24,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: colors.Color_ccc,
    borderRadius: 5,
    padding: 2,
    marginVertical: 10,
    height: 32,
    paddingHorizontal: 10,
  },
  bottonButtomContainer: {
    flexDirection: 'row',
    marginTop: 30
  },
});

export default AddUnitDetailsModal;
