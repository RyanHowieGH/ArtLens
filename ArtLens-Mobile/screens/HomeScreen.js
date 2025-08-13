// screens/HomeScreen.js (FINAL VERSION WITH CAMERA & GALLERY)
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = 'http://192.168.1.10:3001'; // <-- MAKE SURE THIS IS YOUR IP

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  // We no longer need selectedImage state, as we go straight to analyzing
  const { t, locale } = useLanguage(); 
  
  // --- 1. GET PERMISSIONS FOR BOTH CAMERA AND LIBRARY ---
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();


  // --- 2. THE NEW "CHOICE" HANDLER ---
  const handleAnalyzePress = () => {
    Alert.alert(
      "Select Image Source",
      "Would you like to take a new photo or choose one from your library?",
      [
        {
          text: "Take Photo",
          onPress: () => takePicture(),
        },
        {
          text: "Choose from Library",
          onPress: () => pickImage(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // --- 3. CREATE takePicture FUNCTION ---
  const takePicture = async () => {
    // Check and request camera permissions
    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant camera permission to take a photo.');
        return;
      }
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Set to false to use the full image
        quality: 1,
      });

      if (!result.canceled) {
        analyzeImageWithLocation(result.assets[0].uri); // Send image to be analyzed
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert("Error", "Could not open the camera.");
    }
  };

  // --- 4. CREATE pickImage FUNCTION ---
  const pickImage = async () => {
    // Check and request library permissions
    if (!mediaLibraryPermission?.granted) {
      const { status } = await requestMediaLibraryPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'You need to grant permission to access the photo library.');
        return;
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        analyzeImageWithLocation(result.assets[0].uri); // Send image to be analyzed
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Could not open the photo library.");
    }
  };

  // --- 5. COMBINE LOCATION & UPLOAD LOGIC ---
  const analyzeImageWithLocation = async (uri) => {
    setIsLoading(true);
    let location = null;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({ maximumAge: 0 });
      }
    } catch (error) {
      console.warn("Could not get location:", error.message);
    }
    await uploadImage(uri, location?.coords);
  };

  const uploadImage = async (uri, location) => {
    const formData = new FormData();
    formData.append('image', { uri, type: 'image/jpeg', name: 'photo.jpg' });
    formData.append('language', locale);
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/identify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        navigation.navigate('Result', { artwork: response.data.data });
      } else {
        Alert.alert('Identification Failed', response.data.error || 'Could not identify artwork.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Connection Error', 'Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 6. UPDATE THE RENDERED UI ---
  return (
    <View style={styles.container}>
      {/* A simplified placeholder view */}
      <View style={styles.placeholderContainer}>
          <Ionicons name="scan-outline" size={120} color="#ccc" />
          <Text style={styles.placeholderText}>Ready to discover art?</Text>
      </View>

      {/* The single primary button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.analyzeButton} 
          onPress={handleAnalyzePress}
        >
          <Text style={styles.analyzeText}>{t('analyzeButton')}</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{t('analyzing')}</Text>
        </View>
      </Modal>
    </View>
  );
}

// --- 7. UPDATE STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 20,
    color: '#aaa',
    fontSize: 18,
    fontWeight: '500'
  },
  bottomContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  analyzeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});