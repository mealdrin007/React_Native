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
import { http } from '../../../apiService';
import { AddProducts, EditProducts, extractNameFromEmail, isValidProductDescription, isValidProductName, screenWidth } from '../../../utils/UrlConst';
import { ProductInterface } from '../../../utils/Interfaces';
import { colors } from '../../../utils/Colors';
import { AuthContext } from '../../../context/AuthContext';
import { debounce } from 'lodash';

interface AddProductDetailsModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedItem?: ProductInterface;
  fetchProductList?: (startIndex: number, rowCount: number, searchValue: string | null, startDate: Date | null, endDate: Date | null) => void;
  showAlert?: (title: string) => void;
  setAlertMessage?: (message: string) => void;
  setEditAlertMessage?: (message: string) => void;
  startIndex?: number;
  rowCount?: number;
  searchText: string | null
  selectedStartDate: Date | null
  selectedEndDate: Date | null;
  // TODO: need to confirm updateStats type
  updateStates?: (states: any) => void;
  refreshProdctList?: () => void;

}

const AddProductDetailsModal: React.FC<AddProductDetailsModalProps> = ({
  modalVisible,
  setModalVisible,
  selectedItem,
  fetchProductList,
  showAlert,
  setAlertMessage,
  setEditAlertMessage,
  startIndex,
  rowCount,
  searchText,
  selectedStartDate,
  selectedEndDate,
  updateStates,
  refreshProdctList
}) => {
  const { width } = useWindowDimensions();
  const [productName, setProductName] = useState('');
  const [productNameError, setProductNameError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState<"valid" | "invalid" | "short" | "blank" | "">('');
  const [currentDate, setCurrentDate] = useState(new Date)

  const authContext = useContext(AuthContext);

  const { token, name } = authContext;

  useEffect(() => {
    handleEditData();
  }, [selectedItem, modalVisible]);

  const handleEditData = () => {
    if (selectedItem) {
      setProductName(selectedItem.productName);
      setDescription(selectedItem.description);
    }
  };

  const checkForErrors = () => {
    setProductNameError(isValidProductName(productName));
    setDescriptionError(isValidProductDescription(description));

    var validations = [productNameError, descriptionError]
    return validations.every(_ => _ === "valid");
  };

  const onInputTextChange = (
    value: string,
    type: 'Unit' | 'Description' | 'Price' | 'ProductName',
  ): void => {
    if (type === 'Description') {
      setDescription(value);
      setDescriptionError('');
    }
    else if (type === 'ProductName') {
      setProductName(value);
      setProductNameError('');
    }
  };

  const editProductList = useCallback(debounce(async () => {
    let jsonData = JSON.stringify({
      productTypeID: selectedItem?.productTypeID,
      productName: productName,
      description: description,
      CreatedBy: extractNameFromEmail(name),
      createdAt: currentDate.toISOString()
    });

    let methodtype = 'PUT';

    let UpdateProductUrl = `${EditProducts}${selectedItem?.productTypeID}`;

    const responseJson = await http.fetchURL(
      UpdateProductUrl,
      token,
      jsonData,
      methodtype,
    );

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      refreshProdctList && refreshProdctList();

      handleClear();
      updateStates && updateStates({
        productTypeID: selectedItem?.productTypeID,
        productName: productName,
        description: description,
        CreatedBy: extractNameFromEmail(name),
        createdAt: currentDate.toISOString()
      })
      setModalVisible(false);
      if (setEditAlertMessage) {
        setEditAlertMessage('Product Updated Successfully');
      }

    } else {
      Alert.alert('Error', 'Some error occured', [
        {
          text: 'ok',
        },
      ]);
    }
  }, 5000), [selectedItem, productName, description, name, currentDate])

  const addProductList = useCallback(debounce(async () => {
    let jsonData = JSON.stringify({
      productName: productName,
      description: description,
      CreatedBy: extractNameFromEmail(name),
      createdAt: currentDate.toISOString()
    });
    let methodtype = 'POST';

    const responseJson = await http.fetchURL(AddProducts, token, jsonData, methodtype);

    if (responseJson.hasOwnProperty('status') && responseJson.status === 1) {
      refreshProdctList && refreshProdctList();
      handleClear();
      setModalVisible(false);
      if (setAlertMessage) {
        setAlertMessage('Product Added Successfully');
      }

    } else {
      Alert.alert('Error', 'Some error occured',
        [
          {
            text: 'ok',
          },
        ]);
    }
  }, 1000), [productName, description, name, currentDate])

  const handleConfirm = () => {
    let error = checkForErrors();
    if (error) {
      if (selectedItem) {
        editProductList();
      } else {
        addProductList();
      }
    }
  };

  const handleClear = () => {
    setProductNameError('');
    setDescriptionError('');
    setDescription('');
    setProductName('');
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
            <Text style={styles.headerTitle}>Product Details</Text>
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
          <Text style={styles.contentText}>Product Name</Text>
          <AuthTextInput
            placeholder="Product Name"
            value={productName}
            onChangeText={value => onInputTextChange(value, 'ProductName')}
            style={styles.contentInput}
          />
          {productNameError == 'invalid' ? (
            <Text style={{ color: 'red' }}>{'Product Name is invalid.'}</Text>
          ) : productNameError == "short" ? <Text style={{ color: 'red' }}>{'Product Name is too short'}</Text> :
            productNameError == "blank" && <Text style={{ color: 'red' }}>{'Product Name is required.'}</Text>}
          <Text style={styles.contentText}>Description</Text>
          <AuthTextInput
            placeholder="Description"
            value={description}
            onChangeText={value => onInputTextChange(value, 'Description')}
            style={styles.contentInput}
          />
          {descriptionError == 'invalid' ? (
            <Text style={{ color: 'red' }}>{'Please enter invalid.'}</Text>
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
    marginTop: 30,
  },
});

export default AddProductDetailsModal;
