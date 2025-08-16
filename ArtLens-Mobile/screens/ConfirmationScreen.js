// screens/ConfirmationScreen.js (SIMPLIFIED)
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig.extra.backendUrl;

export default function ConfirmationScreen({ route, navigation }) {
  const { imageUri, location } = route.params;
  const { t, locale } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // The uploadImage function remains exactly the same.
  // It will still receive and use the location and locale data.
  const uploadImage = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });
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
        navigation.replace('Result', { artwork: response.data.data });
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('confirmHeader')}</Text>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={uploadImage}>
          <Text style={styles.buttonText}>{t('confirmButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.buttonText, styles.cancelText]}>{t('alertCancel')}</Text>
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

// --- UPDATED STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'space-between', // Pushes buttons to the bottom
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 20, // Add some space from the top
  },
  imageContainer: {
    flex: 1, // Allow image to take up available space
    justifyContent: 'center', // Center the image vertically
    marginVertical: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    resizeMode: 'contain', // Ensures the whole image is visible
  },
  buttonContainer: {
    paddingBottom: 20, // Add some space from the bottom
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent', // Make cancel less prominent
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#007AFF', // Match the confirm button color
    fontWeight: '600',
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