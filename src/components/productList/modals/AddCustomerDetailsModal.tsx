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
import { CustomerInterface } from '../../../utils/Interfaces';
import { http } from '../../../apiService';
import { AddCustomers, EditCustomers, extractNameFromEmail, isValidCustomerName, isValidMobileNumber, isValidVendorAddress, screenWidth, validateMobile } from '../../../utils/UrlConst';
import { colors } from '../../../utils/Colors';
import { AuthContext } from '../../../context/AuthContext';
import { debounce } from 'lodash';

interface AddCustomerDetailsModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedItem?: CustomerInterface;
  fetchCustomerList?: (startIndex: number, rowCount: number, searchValue: string | null, startDate: Date | null, endDate: Date | null) => void;
  refreshCustomerList: () => void;
  showAlert?: (message: string) => void;
  setAlertMessage?: (message: string) => void;
  setEditAlertMessage?: (message: string) => void;
  startIndex?: number;
  rowCount?: number;
  searchText: string | null
  selectedStartDate: Date | null
  selectedEndDate: Date | null;
  updateStates?: (states: CustomerInterface) => void;
}

const AddCustomerDetailsModal: React.FC<AddCustomerDetailsModalProps> = ({
  modalVisible,
  setModalVisible,
  selectedItem,
  fetchCustomerList,
  refreshCustomerList,
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
  const [customerName, setCustomerName] = useState('');
  const [customerNameError, setCustomerNameError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [currentDate, setCurrentDate] = useState(new Date)

  useEffect(() => {
    handleEditData();
  }, [selectedItem]);

  const authContext = useContext(AuthContext);

  const { token, name } = authContext;

  const handleEditData = () => {
    if (selectedItem) {
      setCustomerName(selectedItem.name);
      setAddress(selectedItem.address);
      setMobile(selectedItem.mobileNo);
    }
  };

  const checkForErrors = () => {
    setCustomerNameError(isValidCustomerName(customerName));
    setAddressError(isValidVendorAddress(address));
    setMobileError(isValidMobileNumber(mobile));
    var validations = [customerNameError, addressError, mobileError]
    return validations.every(_ => _ === "valid");
  };

  const onInputTextChange = (
    value: string,
    type: 'CustomerName' | 'Address' | 'Mobile',
  ): void => {
    if (type === 'CustomerName') {
      setCustomerName(value);
      setCustomerNameError('');
    } else if (type === 'Address') {
      setAddress(value);
      setAddressError('');
    } else if (type === 'Mobile') {
      setMobile(value);
      setMobileError('');
    }
  };

  const addCustomerList = useCallback(debounce(async (customerName, address, mobile, createdBy, createdAt) => {
    let jsonData = JSON.stringify({
      name: customerName,
      address: address,
      mobileNo: mobile,
      createdBy: createdBy,
      createdAt: createdAt
    });

    let methodtype = 'POST';

    const responseJson = await http.fetchURL(
      AddCustomers,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      refreshCustomerList && refreshCustomerList();
      handleClear();
      setModalVisible(false);
      if (setAlertMessage) {
        setAlertMessage('Customer Added Successfully');
      }

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 1000), [customerName, address, mobile, name, currentDate])

  const editCustomerList = useCallback(debounce(async (customerName, address, mobile, createdBy, createdAt) => {
    let jsonData = JSON.stringify({
      customerID: selectedItem?.customerID,
      name: customerName,
      address: address,
      mobileNo: mobile,
      createdBy: createdBy,
      createdAt: createdAt
    });

    let methodtype = 'PUT';

    let UpdateCustomerUrl = `${EditCustomers}${selectedItem?.customerID}`;

    const responseJson = await http.fetchURL(
      UpdateCustomerUrl,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {



      if (setEditAlertMessage) {
        setEditAlertMessage('Customer Updated Successfully');
      }
      updateStates && updateStates({
        customerID: selectedItem?.customerID ?? 0,
        name: customerName,
        address: address,
        mobileNo: mobile,
        createdAt: createdAt,
      })

      setModalVisible(false);

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 1000), [selectedItem, customerName, address, mobile, name, currentDate]);

  const handleConfirm = () => {
    let error = checkForErrors();

    if (error) {
      if (selectedItem) {
        editCustomerList(customerName, address, mobile, extractNameFromEmail(name), currentDate.toISOString());
      } else {
        addCustomerList(customerName, address, mobile, extractNameFromEmail(name), currentDate.toISOString());
      }
    }
  };

  const handleClear = () => {
    setCustomerNameError('');
    setAddressError('');
    setMobileError('');
    setCustomerName('');
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
            <Text style={styles.headerTitle}>Customer Details</Text>
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
          <Text style={styles.contentText}>Customer Name</Text>
          <AuthTextInput
            placeholder="Customer Name"
            value={customerName}
            style={styles.contentInput}
            onChangeText={value => onInputTextChange(value, 'CustomerName')}
          />
          {customerNameError == 'invalid' ? (
            <Text style={{ color: 'red' }}>{'Customer name is invalid'}</Text>
          ) : customerNameError == "short" ? <Text style={{ color: 'red' }}>{'Customer name is too short.'}</Text> :
            customerNameError == "blank" && <Text style={{ color: 'red' }}>{'Customer name is required.'}</Text>}
          <Text style={styles.contentText}>Address</Text>
          <AuthTextInput
            placeholder="Address"
            value={address}
            onChangeText={value => onInputTextChange(value, 'Address')}
            style={styles.contentInput}
          />
          {addressError == "invalid" ? (
            <Text style={{ color: 'red' }}>{'Address is invalid'}</Text>
          ) : addressError == "short" ? <Text style={{ color: 'red' }}>{'Address is too short.'}</Text> :
            addressError == "blank" && <Text style={{ color: 'red' }}>{'Address is required.'}</Text>}
          <Text style={styles.contentText}>Mobile</Text>
          <AuthTextInput
            placeholder="Mobile"
            maxLength={10}
            keyboardType='phone-pad'
            value={mobile?.toString()}
            onChangeText={value => onInputTextChange(value, 'Mobile')}
            style={styles.contentInput}
          />
          {mobileError == "invalid" ? (
            <Text style={{ color: 'red' }}>{'Mobile is invalid'}</Text>
          ) : mobileError == "blank" && <Text style={{ color: 'red' }}>{'Mobile is required'}</Text>}
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
    borderRadius: 10,
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
    borderColor: '#ccc',
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

export default AddCustomerDetailsModal;
