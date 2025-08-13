// screens/HomeScreen.js (SIMPLIFIED)
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage(); 
  
  const [mediaLibraryPermission, requestMediaLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  // This is the new main function that decides where to go next
  const navigateToConfirmation = async (imageUri) => {
    let locationCoords = null;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ maximumAge: 0 });
        locationCoords = location.coords;
      }
    } catch (error) {
      console.warn("Could not get location:", error.message);
    }
    
    // Navigate to the Confirmation screen with the data
    navigation.navigate('Confirmation', {
      imageUri: imageUri,
      location: locationCoords,
    });
  };

  const takePicture = async () => {
    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is needed.');
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
        Alert.alert('Permission required', 'Photo library permission is needed.');
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
    Alert.alert( "Select Image Source", "Choose a photo source:",
      [
        { text: "Take Photo", onPress: takePicture },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.placeholderContainer}>
          <Ionicons name="scan-outline" size={120} color="#ccc" />
          <Text style={styles.placeholderText}>Ready to discover art?</Text>
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