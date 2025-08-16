// screens/HomeScreen.js (CORRECTED WITH MOCK LOCATION)
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';

// --- STEP 1: DEFINE YOUR MOCK DATA AND TOGGLE ---

// Set this to 'true' to use the coordinates below for testing.
// !!! IMPORTANT: Set this to 'false' for a real build or when using a real device !!!
const USE_MOCK_LOCATION = true; 

const MOCK_COORDINATES = {
  latitude: 51.06,
  longitude: -114.09,
};

// --- END OF MOCK DATA SETUP ---

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage(); 
  
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  // This is the main function that decides where to go next
  const navigateToConfirmation = async (imageUri) => {
    let locationCoords = null;
    
    // --- STEP 2: USE THE TOGGLE TO DECIDE WHICH LOCATION TO GET ---
    if (USE_MOCK_LOCATION) {
      console.log("--- USING MOCK LOCATION FOR TESTING ---");
      locationCoords = MOCK_COORDINATES;
    } else {
      // Otherwise, try to get the real location
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ maximumAge: 0 });
          locationCoords = location.coords;
        }
      } catch (error) {
        console.warn("Could not get real location:", error.message);
      }
    }
    
    // Navigate to the Confirmation screen with the correct location data
    navigation.navigate('Confirmation', {
      imageUri: imageUri,
      location: locationCoords,
    });
  };

  const takePicture = async () => {
    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert(t('alertPermissionRequired'), t('alertCameraPermission'));
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      navigateToConfirmation(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    if (!mediaLibraryPermission?.granted) {
      const { status } = await requestMediaLibraryPermission();
      if (status !== 'granted') {
        Alert.alert(t('alertPermissionRequired'), t('alertLibraryPermission'));
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      navigateToConfirmation(result.assets[0].uri);
    }
  };

  const handleAnalyzePress = () => {
    Alert.alert(
      t('alertSelectSource'),
      t('alertSourcePrompt'),
      [
        { text: t('alertTakePhoto'), onPress: takePicture },
        { text: t('alertChooseLibrary'), onPress: pickImage },
        { text: t('alertCancel'), style: "cancel" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.placeholderContainer}>
          <Ionicons name="scan-outline" size={120} color="#ccc" />
          <Text style={styles.placeholderText}>{t('homeReadyPrompt')}</Text>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyzePress}>
          <Text style={styles.analyzeText}>{t('analyzeButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles are the same as the previous version
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { marginTop: 20, color: '#aaa', fontSize: 18, fontWeight: '500' },
  bottomContainer: { height: 100, justifyContent: 'center', alignItems: 'center', padding: 20 },
  analyzeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analyzeText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});