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
import CustomSelectDropdown from '../../customDropDown/CustomSelectDropDown';
import { http } from '../../../apiService';
import { AddInwardRegister, extractNameFromEmail, handleSessionExpired, screenWidth } from '../../../utils/UrlConst';
import { colors } from '../../../utils/Colors';
import { AuthContext } from '../../../context/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import { debounce } from 'lodash';

interface InwardRegisterDetailsAddModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedItem?: any;
  vendorList: any;
  showAlert?: (message: string) => void;
  unitList?: any;
  productList?: any;
  fetchInwardRegisterListWithPagination: (startIndex: number, rowCount: number, searchText: string | null, selectedStartDate: Date | null, selectedEndDate: Date | null) => void
  startIndex: number
  rowCount: number
  searchText: string | null,
  setStatusMessage: (message: string) => void;
  navigation: NavigationProp<any>;
  updateInwardList: (e: any) => void;
  selectedDate: DateRange;
  setSelectedDate: (date: DateRange) => void;
}
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface Vendor {
  vendorID: number;
  vendorName: string;
}

const InwardRegisterDetailsAddModal: React.FC<
  InwardRegisterDetailsAddModalProps
> = ({
  modalVisible,
  setModalVisible,
  selectedItem,
  vendorList,
  showAlert,
  unitList,
  productList,
  fetchInwardRegisterListWithPagination,
  startIndex,
  rowCount,
  searchText,
  setStatusMessage,
  navigation,
  updateInwardList,
  setSelectedDate,
  selectedDate
}) => {

    const { width } = useWindowDimensions()

    const [vendorName, setVendorName] = useState('');
    const [vendorNameError, setVendorNameError] = useState('');
    const [productName, setProductName] = useState('');
    const [productNameError, setProductNameError] = useState('');
    const [unit, setUnit] = useState<number>();
    const [unitError, setUnitError] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [quantityError, setQuantityError] = useState('');
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [unitPriceError, setUnitPriceError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date)
    const [error, setError] = useState<string>('')

    const authContext = useContext(AuthContext);

    const { token, name } = authContext;

    useEffect(() => {
      handleEditData()
    }, [selectedItem]);


    const handleEditData = () => {
      if (selectedItem) {
        setVendorName(selectedItem?.vendorID.toString())
        setProductName(selectedItem?.productTypeID.toString())
        setUnit(selectedItem?.unitID.toString())
        setQuantity(selectedItem?.quantity)
        setUnitPrice(selectedItem?.price)
      }
    };

    const newVendorsForDropDownList = vendorList?.map((item: Vendor) => ({
      id: item.vendorID,
      title: item.vendorName,
    }));

    const selectedVendorName = newVendorsForDropDownList?.find((item: any) => item.id === selectedItem?.vendorID);


    const newProductsForDropDownList = productList?.map((item: any) => ({
      id: item.productTypeID,
      title: item.productName,
    }));

    const selectedProductName = newProductsForDropDownList?.find((item: any) => item.id === selectedItem?.productTypeID);

    const newUnitsForDropDownList = unitList?.map((item: any) => ({
      id: item.unitID,
      title: item.description,
    }));

    const selectedUnit = newUnitsForDropDownList?.find((item: any) => item.id === selectedItem?.unitID);

    const checkForErrors = () => {
      setVendorNameError(!vendorName ? 'vendorNameerror' : '');
      setProductNameError(!productName ? 'productnameerror' : '');
      setQuantityError(!quantity ? 'quantityerror' : '');
      setUnitError(!unit ? 'uniterror' : '');
      setUnitPriceError(!unitPrice ? 'unitpriceerror' : '');

      return unit && quantity && vendorName && productName && unitPrice;
    };

    const onInputTextChange = (
      value: string,
      type: 'Unit' | 'VendorName' | 'ProductName' | 'Quantity' | 'UnitPrice',
    ): void => {
      if (type === 'Unit') {
        setUnit(Number(value));
        setUnitError('');
      } else if (type === 'VendorName') {
        setVendorName(value);
        setVendorNameError('');
      } else if (type === 'ProductName') {
        setProductName(value);
        setProductNameError('');
      } else if (type === 'Quantity') {
        const parsedValue = parseInt(value);
        if (isNaN(parsedValue)) {
          setQuantity(0);
        } else {
          setQuantity(parsedValue);
        }
        setQuantityError('');
      } else if (type === 'UnitPrice') {
        const parsedValue = parseInt(value);
        if (isNaN(parsedValue)) {
          setUnitPrice(0);
        } else {
          setUnitPrice(parsedValue);
        }
        setUnitPriceError('');
      }
    };

    const addInwardRegisterList = useCallback(debounce(async () => {

      let jsonData = JSON.stringify({
        productTypeID: productName,
        unitID: unit,
        vendorID: vendorName,
        price: unitPrice,
        quantity: quantity,
        CreatedBy: extractNameFromEmail(name),
        createdAt: currentDate.toISOString(),
        isActive: true,
      });

      let methodtype = 'POST';

      const responseJson = await http.fetchURL(
        AddInwardRegister,
        token,
        jsonData,
        methodtype,
      );

      if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
        fetchInwardRegisterListWithPagination && fetchInwardRegisterListWithPagination(startIndex, rowCount, null, null, null);
        updateInwardList && updateInwardList({
          productTypeID: productName,
          unitID: unit,
          vendorID: vendorName,
          price: unitPrice,
          quantity: quantity,
          CreatedBy: extractNameFromEmail(name),
          createdAt: currentDate.toISOString(),
          isActive: true,
        });

        setStatusMessage('InwardRegister Added Successfully')
        handleClear();
        setModalVisible(false);
        if (showAlert) {
          showAlert('InwardRegister Added Successfully');
        }

      }
      else if (responseJson?.status === 1 && responseJson?.status_message?.success === false) {
        setError(responseJson?.status_message?.message)
        setStatusMessage('')
      }
      else if (responseJson?.status === 2) {
        handleSessionExpired(navigation);
      }
      else {
        setError('Some error occured')
        setStatusMessage('')
        Alert.alert('Error', 'Some error occured', [
          {
            text: 'ok',
          },
        ]);
      }
    }, 1000), [productName, unit, vendorName, unitPrice, quantity, name, currentDate])

    const editInwardRegisterList = useCallback(debounce(async () => {


      let jsonData = JSON.stringify({
        inwardRegID: selectedItem.inwardRegisterID,
        productTypeID: productName,
        unitID: unit,
        vendorID: vendorName,
        price: unitPrice,
        quantity: quantity,
        CreatedBy: extractNameFromEmail(name),
        createdAt: currentDate.toISOString(),
        isActive: true,

      });

      let methodtype = 'POST';

      const responseJson = await http.fetchURL(
        AddInwardRegister,
        token,
        jsonData,
        methodtype,
      );

      if (responseJson?.status === 1) {

        if (fetchInwardRegisterListWithPagination) {
          fetchInwardRegisterListWithPagination(startIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
        }
        setStatusMessage(responseJson?.statusMessage)
        handleClear();
        setModalVisible(false);

        if (showAlert) {
          showAlert('InwardRegister Updated Successfully');
        }
      }
      else if (responseJson?.status === 0) {
        setError(responseJson?.status_message?.message)
        setStatusMessage('')
      }
      else if (responseJson?.status === 2) {
        handleSessionExpired(navigation);
      }
      else {
        setStatusMessage('')
        setError('Some error occured')
        Alert.alert('Error', 'Some error occured', [
          {
            text: 'ok',
          },
        ]);
      }
    }, 1000), [selectedItem, productName, unit, vendorName, unitPrice, quantity, name, currentDate])

    const handleConfirm = () => {
      let error = checkForErrors();
      if (error) {
        if (selectedItem) {
          editInwardRegisterList()
        }
        else {
          addInwardRegisterList();
        }
      }
    };

    const handleClear = () => {
      setVendorNameError('');
      setQuantityError('');
      setUnitError('');
      setUnitPriceError('');
      setProductNameError('');
      setVendorName('');
      setProductName('');
      setQuantity(0);
      setUnitPrice(0);
      setError('')
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
          <View style={[styles.subContainer, { minWidth: width > screenWidth ? 600 : 300 }]}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Inward Register Details</Text>
              <Pressable onPress={handleClose} style={styles.closeButton}>
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
            <View style={styles.inputSection}>
              <View>
                <Text style={styles.inputText}>Vendor Name</Text>
                <CustomSelectDropdown
                  data={newVendorsForDropDownList}
                  defaultValue={vendorName}
                  onSelect={value => onInputTextChange(value.id, 'VendorName')}
                  placeHolderName="Select a Vendor"
                  width={width > screenWidth ? 274 : 101}
                  editSelected={selectedItem ? selectedVendorName : null}
                />
                {vendorNameError ? (
                  <Text style={{ color: 'red' }}>{'Select vendor'}</Text>
                ) : null}
              </View>
              <View>
                <Text style={styles.inputText}>Product Name</Text>
                <CustomSelectDropdown
                  data={newProductsForDropDownList}
                  defaultValue={productName}
                  onSelect={value => onInputTextChange(value.id, 'ProductName')}
                  placeHolderName="Select a Product"
                  width={width > screenWidth ? 274 : 101}
                  editSelected={selectedItem ? selectedProductName : null}
                />
                {productNameError ? (
                  <Text style={{ color: 'red' }}>{'Select product'}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.inputSection}>
              <View style={{}}>
                <Text style={styles.inputText}>Unit</Text>
                <CustomSelectDropdown
                  data={newUnitsForDropDownList}
                  defaultValue={unit}
                  onSelect={value => onInputTextChange(value.id, 'Unit')}
                  placeHolderName="Select a Unit"
                  width={width > screenWidth ? 274 : 101}
                  editSelected={selectedItem ? selectedUnit : null}
                />
                {unitError ? (
                  <Text style={{ color: 'red' }}>{'Select unit'}</Text>
                ) : null}
              </View>
              <View style={{}}>
                <Text style={styles.inputText}>Quantity</Text>
                <AuthTextInput
                  placeholder="Quantity"
                  value={quantity?.toString()}
                  onChangeText={value => onInputTextChange(value, 'Quantity')}
                  keyboardType="numeric"
                  style={[styles.inputs, { width: width > screenWidth ? 274 : 101, }]}
                />
                {quantityError ? (
                  <Text style={{ color: 'red' }}>{'Enter quantity'}</Text>
                ) : null}
              </View>
            </View>
            <View style={styles.inputSection}>
              <View style={{}}>
                <Text style={styles.inputText}>Unit Price</Text>
                <AuthTextInput
                  placeholder="Unit Price"
                  value={unitPrice?.toString()}
                  onChangeText={value => onInputTextChange(value, 'UnitPrice')}
                  style={[styles.inputs, { width: width > screenWidth ? 274 : 101, }]}
                />
                {unitPriceError ? (
                  <Text style={{ color: 'red' }}>{'Enter unit price'}</Text>
                ) : null}
              </View>
            </View>
            <View>
              <Text style={[styles.inputText, { color: 'red' }]}>
                {error ? error : null}
              </Text>
            </View>
            <View style={[styles.bottomButtonContainer, { justifyContent: width > screenWidth ? 'flex-end' : 'space-between' }]}>
              <CancelButton handleClose={handleClose} />
              <ConfirmButton handleConfirm={handleConfirm} />
            </View>
          </View>
        </View>
      </Modal >
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
    width: Platform.OS === 'web' ? '40%' : '80%',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: colors.Color_54595e,
  },
  closeButton: {
    height: 24,
    width: 24,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.Color_E5E5E5,
  },
  inputSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: colors.Color_4f4f4f,
    lineHeight: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  inputs: {
    borderWidth: 1,
    borderColor: colors.Color_ccc,
    borderRadius: 5,
    padding: 2,
    marginVertical: 10,
    height: 32,
    paddingHorizontal: 10,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
});

export default InwardRegisterDetailsAddModal;
