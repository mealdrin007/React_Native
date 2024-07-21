import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export const useAsyncStorage = (keyName: string, defaultValue: any): [any, (newValue: any) => Promise<void>, boolean] => {
    const [storedValue, setStoredValue] = useState<any>(defaultValue);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStoredValue = async () => {
            try {
                const value = await AsyncStorage.getItem(keyName);
                if (value !== null) {
                    setStoredValue(JSON.parse(value));
                } else {
                    await AsyncStorage.setItem(keyName, JSON.stringify(defaultValue));
                    setStoredValue(defaultValue);
                }
            } catch (err) {
                console.error('Error fetching value from AsyncStorage', err);
                setStoredValue(defaultValue);
            } finally {
                setLoading(false);
            }
        };

        fetchStoredValue();
    }, [keyName, defaultValue]);

    const setValue = async (newValue: any) => {
        try {
            await AsyncStorage.setItem(keyName, JSON.stringify(newValue));
            setStoredValue(newValue);
        } catch (err) {
            console.error('Error setting value in AsyncStorage', err);
        }
    };

    return [storedValue, setValue, loading];
};
