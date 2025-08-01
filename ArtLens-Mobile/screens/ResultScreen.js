// screens/ResultScreen.js (UPDATED WITH SPEECH)
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech'; // Import the speech library
import { Ionicons } from '@expo/vector-icons'; // Import icons for our button

export default function ResultScreen({ route, navigation }) {
  const { artwork } = route.params;
  
  // --- NEW: State to manage speech ---
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Combine all the text we want to read aloud
  const fullTextToSpeak = `
    Title: ${artwork.title}.
    Artist: ${artwork.artist}.
    History: ${artwork.history}.
    Trivia: ${artwork.trivia.join('. ')}
  `;

  const handleSpeak = () => {
    if (isSpeaking) {
      // If already speaking, stop it
      Speech.stop();
      setIsSpeaking(false);
    } else {
      // If not speaking, start it
      setIsSpeaking(true);
      Speech.speak(fullTextToSpeak, {
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => {
          setIsSpeaking(false);
          alert('An error occurred while reading the text.');
        },
      });
    }
  };

  // --- NEW: Effect to stop speech when the user leaves the screen ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // When the screen loses focus (e.g., user hits 'back'), stop speaking.
      Speech.stop();
      setIsSpeaking(false);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>

      {/* --- NEW: The Speak Button --- */}
      <TouchableOpacity style={styles.speakButton} onPress={handleSpeak}>
        <Ionicons 
          name={isSpeaking ? "volume-off" : "volume-high"} 
          size={24} 
          color="white" 
        />
        <Text style={styles.speakButtonText}>
          {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.title}>{artwork.title}</Text>
        <Text style={styles.artist}>by {artwork.artist}</Text>
      </View>
      
      

      <View style={styles.section}>
        <Text style={styles.heading}>History</Text>
        <Text style={styles.body}>{artwork.history}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Trivia</Text>
        {artwork.trivia.map((fact, index) => (
          <Text key={index} style={styles.listItem}>• {fact}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

// --- UPDATED STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  artist: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 5,
  },
  // --- NEW STYLES for the button ---
  speakButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  speakButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});