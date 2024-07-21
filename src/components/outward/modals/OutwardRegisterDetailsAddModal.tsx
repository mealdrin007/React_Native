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
import { CustomerInterface, MasterData, OutwardRegisterItem } from '../../../utils/Interfaces';
import { http } from '../../../apiService';
import { AddOutwardRegister, extractNameFromEmail, handleSessionExpired, screenWidth } from '../../../utils/UrlConst';
import { colors } from '../../../utils/Colors';
import { AuthContext } from '../../../context/AuthContext';
import { NavigationProp } from '@react-navigation/native';
import { debounce } from 'lodash';

interface Item {
  id: number;
  vendorName: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface OutwardRegisterDetailsAddModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedItem?: OutwardRegisterItem;
  masterData?: MasterData;
  fetchOutwardRegisterList: () => void;
  showAlert?: (message: string) => void;
  productList?: any;
  unitList?: any;
  customerList?: CustomerInterface[];
  fetchOutwardRegisterListWithPagination: (startIndex: number, rowCount: number, searchText: string | null, selectedStartDate: Date | null, selectedEndDate: Date | null) => void
  startIndex: number
  rowCount: number
  searchText: string | null,
  navigation: NavigationProp<any>
  selectedDate: DateRange;
}

const OutwardRegisterDetailsAddModal: React.FC<
  OutwardRegisterDetailsAddModalProps
> = ({
  modalVisible,
  setModalVisible,
  selectedItem,
  showAlert,
  productList,
  unitList,
  customerList,
  fetchOutwardRegisterListWithPagination,
  startIndex,
  rowCount,
  searchText,
  navigation,
  selectedDate,

}) => {

    const { width } = useWindowDimensions()

    const [currentDate, setCurrentDate] = useState(new Date)
    const [customerName, setCustomerName] = useState('');
    const [customerNameError, setCustomerNameError] = useState('');
    const [productName, setProductName] = useState('');
    const [productNameError, setProductNameError] = useState('');
    const [unit, setUnit] = useState('');
    const [unitError, setUnitError] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [quantityError, setQuantityError] = useState('');
    const [unitPrice, setUnitPrice] = useState<number>(0);
    const [unitPriceError, setUnitPriceError] = useState('');
    const [error, setError] = useState<string>('')

    const authContext = useContext(AuthContext);

    const { token, name } = authContext;

    useEffect(() => {
      handleEditData()
    }, [selectedItem]);

    const handleEditData = () => {
      if (selectedItem) {
        setCustomerName(selectedItem?.customerID.toString());
        setProductName(selectedItem?.productTypeID.toString())
        setUnit(selectedItem?.unitID.toString())
        setQuantity(selectedItem?.quantity)
        setUnitPrice(selectedItem?.price)
      }
    };
    const newCustomersForDropDownList = customerList?.map(
      (item: CustomerInterface) => ({
        id: item.customerID,
        title: item.name,
      }),
    );

    const selectedCustomerName = newCustomersForDropDownList?.find(item => item.id === selectedItem?.customerID);

    const newProductsForDropDownList = productList?.map((item: any) => ({
      id: item.productTypeID,
      title: item.productName,
    }));

    const selectedProductName = newProductsForDropDownList?.find((item: any) => item.id === selectedItem?.productTypeID);

    const newUnitsForDropDownList = unitList?.map((item: any) => ({
      id: item.unitID,
      title: item.description,
    }));

    const selectedUnitName = newUnitsForDropDownList?.find((item: any) => item.id === selectedItem?.unitID);

    const checkForErrors = () => {
      setCustomerNameError(!customerName ? 'customerNameerror' : '');
      setProductNameError(!productName ? 'productnameerror' : '');
      setQuantityError(!quantity ? 'quantityerror' : '');
      setUnitError(!unit ? 'uniterror' : '');
      setUnitPriceError(!unitPrice ? 'unitpriceerror' : '');

      return unit && quantity && customerName && productName && unitPrice;
    };

    const onInputTextChange = (
      value: string,
      type:
        | 'Unit'
        | 'CustomerName'
        | 'ProductName'
        | 'Quantity'
        | 'UnitPrice'
        | 'TotalValue',
    ): void => {
      if (type === 'Unit') {
        setUnit(value);
        setUnitError('');
      } else if (type === 'CustomerName') {
        setCustomerName(value);
        setCustomerNameError('');
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

    const addOutwardRegisterList = useCallback(debounce(async () => {

      let jsonData = JSON.stringify({
        unitID: unit,
        productTypeID: productName,
        customerID: customerName,
        quantity: quantity,
        price: unitPrice,
        CreatedBy: extractNameFromEmail(name),
        createdAt: currentDate.toISOString(),
        isActive: true,
      });

      let methodtype = 'POST';

      const responseJson = await http.fetchURL(
        AddOutwardRegister,
        token,
        jsonData,
        methodtype,
      );

      if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
        setError('')
        if (fetchOutwardRegisterListWithPagination) {
          fetchOutwardRegisterListWithPagination(startIndex, rowCount, null, null, null);
        }
        handleClear();
        setModalVisible(false);

        if (showAlert) {
          showAlert('OutwardRegister Added Successfully');
        }
      }
      else if (responseJson?.status === 0) {
        setError(responseJson?.statusMessage)
      }
      else if (responseJson?.status === 2) {
        handleSessionExpired(navigation);
      }
      else {
        setError('Some error occured')
        Alert.alert('Error', 'Some error occured', [
          {
            text: 'ok',
          },
        ]);
      }
    }, 1000), [unit, productName, customerName, quantity, unitPrice, name, currentDate])

    const editOutwardRegisterList = useCallback(debounce(async () => {

      let jsonData = JSON.stringify({
        outwardRegID: selectedItem?.outwardRegID,
        unitID: unit,
        productTypeID: productName,
        customerID: customerName,
        quantity: quantity,
        price: unitPrice,
        CreatedBy: extractNameFromEmail(name),
        createdAt: currentDate.toISOString(),
        isActive: true,
      });

      let methodtype = 'POST';

      const responseJson = await http.fetchURL(
        AddOutwardRegister,
        token,
        jsonData,
        methodtype,
      );


      if (responseJson?.status === 1) {
        setError('')
        if (fetchOutwardRegisterListWithPagination) {
          fetchOutwardRegisterListWithPagination(startIndex, rowCount, searchText, selectedDate.startDate, selectedDate.endDate);
        }
        handleClear();
        setModalVisible(false);

        if (showAlert) {
          showAlert('OutwardRegister Updated Successfully');
        }
      }
      else if (responseJson?.status === 0) {
        setError(responseJson?.status_message?.message)
      }
      else if (responseJson?.status === 2) {
        handleSessionExpired(navigation);
      }
      else {
        setError('Some error occured')
        Alert.alert('Error', 'Some error occured', [
          {
            text: 'ok',
          },
        ]);
      }
    }, 1000), [unit, productName, customerName, quantity, unitPrice, name, currentDate, selectedItem])

    const handleConfirm = () => {
      let error = checkForErrors();
      if (error) {
        if (selectedItem) {
          editOutwardRegisterList()
        }
        else {
          addOutwardRegisterList();
        }
      }
    };

    const handleClear = () => {
      setCustomerNameError('');
      setQuantityError('');
      setUnitError('');
      setUnitPriceError('');
      setProductNameError('');
      setCustomerName('');
      setQuantity(0);
      setUnit('');
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
              <Text style={styles.headerText}>Outward Register Details</Text>
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
                <Text style={styles.inputText}>Customer Name</Text>
                <CustomSelectDropdown
                  data={newCustomersForDropDownList}
                  onSelect={value => onInputTextChange(value.id, 'CustomerName')}
                  placeHolderName="Select a Customer"
                  width={width > screenWidth ? 274 : 101}
                  editSelected={selectedItem ? selectedCustomerName : null}
                />
                {customerNameError ? (
                  <Text style={{ color: 'red' }}>{'Select customer'}</Text>
                ) : null}
              </View>
              <View>
                <Text style={styles.inputText}>Product Name</Text>
                <CustomSelectDropdown
                  data={newProductsForDropDownList}
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
                  onSelect={value => onInputTextChange(value.id, 'Unit')}
                  placeHolderName="Select a Unit"
                  width={width > screenWidth ? 274 : 101}
                  editSelected={selectedItem ? selectedUnitName : null}
                />
                {unitError ? (
                  <Text style={{ color: 'red' }}>{'Select unit'}</Text>
                ) : null}
              </View>
              <View>
                <Text style={styles.inputText}>Quantity</Text>
                <AuthTextInput
                  placeholder="Quantity"
                  value={quantity?.toString()}
                  onChangeText={value => onInputTextChange(value, 'Quantity')}
                  keyboardType="numeric"
                  style={[styles.inputs, { width: width > screenWidth ? 274 : 101, }]}
                  defaultValue='0'
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
                  keyboardType="numeric"
                  defaultValue='0'
                />
                {unitPriceError ? (
                  <Text style={{ color: 'red' }}>{'Enter unit price'}</Text>
                ) : null}
              </View>
            </View>
            {error ?
              <Text style={{ color: 'red' }}>{error}</Text>
              : null}
            <View style={[styles.bottomButtonContainer, { justifyContent: width > screenWidth ? 'flex-end' : 'space-between' }]}>
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

export default OutwardRegisterDetailsAddModal;
