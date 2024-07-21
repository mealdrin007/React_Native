import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
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
import { extractNameFromEmail, isValidMobileNumber, isValidVendorAddress, isValidVendorName, screenWidth, validateMobile } from '../../../utils/UrlConst';
import { VendorListInterface } from '../../../utils/Interfaces';
import { AddVendors, EditVendors } from '../../../utils/UrlConst';
import { http } from '../../../apiService';
import { colors } from '../../../utils/Colors';
import { AuthContext } from '../../../context/AuthContext';
import { debounce } from 'lodash';

interface AddVendorDetailsModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedItem?: VendorListInterface;
  refreshVendorList?: () => void;
  showAlert?: (message: string) => void;
  setAlertMessage?: (message: string) => void;
  setEditAlertMessage?: (message: string) => void;
  startIndex?: number;
  rowCount?: number;
  searchText: string | null
  selectedStartDate: Date | null
  selectedEndDate: Date | null;
  updateStates?: (states: VendorListInterface) => void;
}

const AddVendorDetailsModal: React.FC<AddVendorDetailsModalProps> = ({
  modalVisible,
  setModalVisible,
  selectedItem,
  refreshVendorList,
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
  const [vendorName, setVendorName] = useState('');
  const [vendorNameError, setVendorNameError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [currentDate, setCurrentDate] = useState(new Date)

  const authContext = useContext(AuthContext);

  const { token, name } = authContext;

  useEffect(() => {
    handleEditData();
  }, [selectedItem, modalVisible]);

  const handleEditData = () => {
    if (selectedItem) {
      setVendorName(selectedItem.vendorName);
      setAddress(selectedItem.address);
      setMobile(selectedItem.mobileNo);
    }
  };

  const checkForErrors = () => {
    setVendorNameError(isValidVendorName(vendorName));
    setAddressError(isValidVendorAddress(address));
    setMobileError(isValidMobileNumber(mobile));
    var validations = [vendorNameError, addressError, mobileError]
    return validations.every(_ => _ === "valid");
  };

  const onInputTextChange = (
    value: string,
    type: 'VendorName' | 'Address' | 'Mobile',
  ): void => {
    if (type === 'VendorName') {
      setVendorName(value);
      setVendorNameError('');
    } else if (type === 'Address') {
      setAddress(value);
      setAddressError('');
    } else if (type === 'Mobile') {
      setMobile(value);
      setMobileError('');
    }
  };

  const addVendorList = useCallback(debounce(async (vendorName: string, address: string, mobile: string, name: string, currentDate: String) => {

    let jsonData = JSON.stringify({
      vendorName: vendorName,
      address: address,
      mobileNo: mobile,
      createdBy: name,
      createdAt: currentDate
    });

    let methodtype = 'POST';


    const responseJson = await http.fetchURL(AddVendors, token, jsonData, methodtype);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      refreshVendorList && refreshVendorList();
      handleClear();
      setModalVisible(false);

      if (setAlertMessage) {
        setAlertMessage('Vendor added successfully');
      }

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 1000), [vendorName, address, mobile, name, currentDate])


  const editVendorList = useCallback(debounce(async (vendorName, address, mobile, createdBy, createdAt) => {
    let jsonData = JSON.stringify({
      vendorID: selectedItem?.vendorID,
      vendorName: vendorName,
      address: address,
      mobileNo: mobile,
      createdBy: createdBy,
      createdAt: createdAt
    });

    let methodtype = 'PUT';

    let UpdateVendorUrl = `${EditVendors}${selectedItem?.vendorID}`;

    const responseJson = await http.fetchURL(
      UpdateVendorUrl,
      token,
      jsonData,
      methodtype,
    );


    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      if (setEditAlertMessage) {
        setEditAlertMessage('Vendor updated successfully');
      }

      updateStates && updateStates({
        vendorID: selectedItem?.vendorID ?? 0,
        vendorName: vendorName,
        address: address,
        createdBy: createdBy,
        createdAt: createdAt,
        mobileNo: mobile
      })

      setModalVisible(false);

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 1000), [selectedItem, vendorName, address, mobile, name, currentDate])

  const handleConfirm = () => {
    let error = checkForErrors();

    if (error) {
      if (selectedItem) {
        editVendorList(vendorName, address, mobile, extractNameFromEmail(name), currentDate.toISOString());
      } else {
        addVendorList(vendorName, address, mobile, extractNameFromEmail(name), currentDate.toISOString());
      }
    }
  };

  const handleClear = () => {
    setVendorNameError('');
    setAddressError('');
    setMobileError('');
    setVendorName('');
    setAddress('');
    setMobile('');
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
            <Text style={styles.headerTitle}>Vendor Details</Text>
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
          <Text style={styles.contentText}>Vendor Name</Text>
          <AuthTextInput
            placeholder="Vendor Name"
            value={vendorName}
            onChangeText={value => onInputTextChange(value, 'VendorName')}
            style={styles.contentInput}
          />
          {vendorNameError == "invalid" ? (
            <Text style={{ color: 'red' }}>{'Vendor Name is Invalid'}</Text>
          ) : vendorNameError == "short" ? <Text style={{ color: 'red' }}>{'Vendor Name is too short'}</Text> :
            vendorNameError == 'blank' && <Text style={{ color: 'red' }}>{'Vendor Name is required'}</Text>}
          <Text style={styles.contentText}>Address</Text>
          <AuthTextInput
            placeholder="Address"
            value={address}
            onChangeText={value => onInputTextChange(value, 'Address')}
            style={styles.contentInput}
          />
          {addressError == "invalid" ? (
            <Text style={{ color: 'red' }}>{'Address is invalid'}</Text>
          ) : addressError == "short" ? <Text style={{ color: 'red' }}>{'Address Name is too short'}</Text> :
            addressError == "blank" && <Text style={{ color: 'red' }}>{'Address Name is required'}</Text>}
          <Text style={styles.contentText}>Mobile</Text>
          <AuthTextInput
            value={mobile}
            placeholder="Mobile"
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={value => onInputTextChange(value, 'Mobile')}
            style={styles.contentInput}
          />
          {mobileError == 'invalid' ? (
            <Text style={{ color: 'red' }}>{'Mobile is invalid'}</Text>
          ) : mobileError == 'blank' && <Text style={{ color: 'red' }}>{'Mobile is required'}</Text>}
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
    marginTop: 30,
  },
});

export default memo(AddVendorDetailsModal);
