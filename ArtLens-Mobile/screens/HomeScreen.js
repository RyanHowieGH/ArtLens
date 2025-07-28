// screens/HomeScreen.js
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
// --- START: THE FIX ---
// The old import was: import { Camera } from 'expo-camera';
// The new way is to import CameraView and the permission hook separately.
import { CameraView, useCameraPermissions } from 'expo-camera';
// --- END: THE FIX ---
import axios from 'axios';

// !!! IMPORTANT: REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS !!!
// const BACKEND_URL = 'http://192.168.50.140:3001'; //
const BACKEND_URL = 'http://10.187.139.224:3001'; //


export default function HomeScreen({ navigation }) {
  // Use the new permission hook
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);

  // If permissions are still loading, show a blank screen
  if (!permission) {
    return <View />;
  }

  // If permissions are not granted, show a button to ask for them
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        uploadImage(photo.uri);
      } catch (error) {
        console.error('Failed to take picture:', error);
        Alert.alert('Error', 'Failed to take picture.');
        setIsLoading(false);
      }
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    try {
      const response = await axios.post(`${BACKEND_URL}/api/identify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        navigation.navigate('Result', { artwork: response.data.data });
      } else {
        Alert.alert('Identification Failed', response.data.error || 'Could not identify the artwork.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Connection Error', 'Could not connect to the server. Make sure it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Use CameraView instead of Camera */}
      <CameraView style={styles.camera} facing={'back'} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}> SNAP </Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Loading Modal */}
      <Modal
        transparent={true}
        animationType="none"
        visible={isLoading}
      >
        <View style={styles.modalBackground}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      </Modal>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' }, // Added justifyContent for permission screen
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  permissionButton: { // Style for the new permission button
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
    alignSelf: 'center',
  },
  text: { fontSize: 18, color: 'white', fontWeight: 'bold' },
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
