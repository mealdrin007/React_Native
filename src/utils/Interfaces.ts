export interface VendorListInterface {
    vendorID: number;
    vendorName: string;
    address: string;
    mobileNo: string;
    createdAt: string;
    createdBy:string;
}

export interface UnitInterface {
    unitID: number;
    description: string;
    unit: number;
    createdAt:Date|string;
    createdBy:string;
}

export interface CustomerInterface {
    customerID: number;
    name: string;
    address: string;
    mobileNo: string;
    // date: string;
    createdAt?:string|Date;
}

export interface ProductInterface {
    productTypeID: number;
    productName: string;
    description: string;
    unit: number;
    price: number;
}

interface Product {
    productTypeId: number;
    productName: string;
    description: string;
}

interface Unit {
    unitID: number;
    description: string;
}

interface Vendor {
    vendorID: number;
    vendorName: string;
    address: string;
    mobileNo: string;
}

interface Customer {
    customerID: 0,
    name: string,
    address: string,
    mobileNo: string,
}

export interface InwardRegisterItem {
    inwardRegisterID:number;
    productTypeID: number;
    productType: Product;
    unitID: number;
    unit: Unit;
    vendorID: number;
    vendor: Vendor;
    quantity: number;
    price: number;
    createdAt: string
    logID?: number;
    name:string;
}

export interface OutwardRegisterItem {
    productType: Product;
    customer: Customer;
    unit: Unit;
    outwardRegID: number;
    customerID: number;
    unitID: number;
    productTypeID: number,
    vendorID: number;
    quantity: number;
    price: number;
    createdAt: string
}

export interface StockRegisterItem {
    productType: Product;
    unit: Unit;
    productID: number;
    unitID: number;
    productTypeID: number,
    quantity: number;
    price: number;
    modifiedAt: string
}

interface Unit {
    id: number;
    name: string;
}

interface Customer {
    customer_id: number;
    customer_name: string;
}

interface Product {
    product_id: number;
    product_name: string;
    price: number;
}

export interface MasterData {
    units: Unit[];
    customers: Customer[];
    products: Product[];
}

export interface AvailableStock {
    totalValue: string;
    totalRows: string;
}
export interface DashboardInwardStock {
    totalValue: number;
    totalVendor: number;
    totalProduct: number;
    totalMasterVendorNum: number;
    totalMasterProductNum: number;
}
export interface DashboardOutwardStock {
    totalValue: number;
    totalCustomer: number;
    totalProduct: number;
    totalMasterCustomerNum: number;
    totalMasterProductNum: number;
}