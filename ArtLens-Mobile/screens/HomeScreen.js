// screens/HomeScreen.js (CORRECTED WITH PERMISSIONS & ERROR HANDLING)
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext'; // <-- Import the hook
import * as Location from 'expo-location'; // <-- 1. IMPORT LOCATION


// We need to import the permission request hook along with the main library
import * as ImagePicker from 'expo-image-picker';

// !!! REMEMBER TO USE YOUR COMPUTER'S LOCAL IP ADDRESS !!!
const BACKEND_URL = 'http://10.187.133.96:3001';

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { t, locale } = useLanguage(); // <-- Get t and locale

  
  // --- NEW: State for media library permissions ---
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();

  const pickImage = async () => {
    // 1. Check for permissions before opening the library
    if (!mediaLibraryPermission) {
        // Permissions are still loading
        return;
    }

    if (mediaLibraryPermission.status !== 'granted') {
        const { status } = await requestMediaLibraryPermission();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'You need to grant permission to access the photo library.');
            return;
        }
    }

    // 2. Wrap the picker launch in a try...catch block to see errors
    try {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    } catch (error) {
        console.error("ImagePicker Error:", error); // Log the error to the terminal
        Alert.alert("Error", "Could not open the photo library.");
    }
  };
  
  // The analyzeImage and uploadImage functions remain the same...
  const analyzeImage = async () => { // <-- Make this function async
    if (!selectedImage) {
      Alert.alert(t('noImage'), t('noImagePrompt'));
      return;
    }

    setIsLoading(true); // Start loading indicator early

    // --- 2. GET LOCATION DATA ---
    try {
      // First, request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to improve accuracy for local art.');
        setIsLoading(false);
        return;
      }

      // Then, get the current coordinates
      console.log("Getting user's location...");
      let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High, // You can specify accuracy
          maximumAge: 0 // This forces a new reading, not a cached one
      });
      console.log("Location found:", location.coords);

      // Now, call uploadImage with the location
      await uploadImage(selectedImage, location.coords);

    } catch (error) {
        console.error("Location Error:", error);
        Alert.alert("Location Error", "Could not get your location. Proceeding without it.");
        // If location fails, we can still proceed without it
        await uploadImage(selectedImage, null);
    } finally {
        // We already set isLoading to true, the upload function will set it to false
    }
  };

  const uploadImage = async (uri, location) => { // <-- Accept location as an argument
    // No need to setIsLoading here, it's done in analyzeImage

    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    formData.append('language', locale);

    // --- 4. APPEND LOCATION DATA (if available) ---
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/identify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSelectedImage(null); 
        navigation.navigate('Result', { artwork: response.data.data });
      } else {
        Alert.alert('Identification Failed', response.data.error || 'Could not identify the artwork.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Connection Error', 'Could not connect to the server.');
    } finally {
      setIsLoading(false); // End loading indicator here
    }
  };

  // The UI remains the same...
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={80} color="#ccc" />
          <Text style={styles.placeholderText}>{t('selectImagePrompt')}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.analyzeButton, !selectedImage && styles.disabledButton]} 
          onPress={analyzeImage}
          disabled={!selectedImage}
        >
        <Text style={styles.analyzeText}>{t('analyzeButton')}</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{t('analyzing')}</Text>
        </View>
      </Modal>
    </View>
  );
}

// Styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
  },
  disabledButton: {
    backgroundColor: '#a9a9a9',
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