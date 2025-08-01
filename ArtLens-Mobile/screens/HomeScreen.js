// screens/HomeScreen.js (CORRECTED WITH PERMISSIONS & ERROR HANDLING)
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
// --- START: THE FIX ---
// We need to import the permission request hook along with the main library
import * as ImagePicker from 'expo-image-picker';
// --- END: THE FIX ---

// !!! REMEMBER TO USE YOUR COMPUTER'S LOCAL IP ADDRESS !!!
const BACKEND_URL = 'http://10.189.152.79:3001';

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
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
  const analyzeImage = () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first.");
      return;
    }
    uploadImage(selectedImage);
  };

  const uploadImage = async (uri) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

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
      setIsLoading(false);
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
            <Text style={styles.placeholderText}>Tap to select an image</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.analyzeButton, !selectedImage && styles.disabledButton]} 
          onPress={analyzeImage}
          disabled={!selectedImage}
        >
          <Text style={styles.analyzeText}>Analyze Image</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Analyzing...</Text>
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