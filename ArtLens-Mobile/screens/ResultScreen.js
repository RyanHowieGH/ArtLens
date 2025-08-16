// screens/ResultScreen.js (UPDATED WITH SPEECH)
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech'; // Import the speech library
import { Ionicons } from '@expo/vector-icons'; // Import icons for our button
import { addFavorite, removeFavorite, isFavorite } from '../services/FavoritesService';
import { useLanguage } from '../context/LanguageContext';



export default function ResultScreen({ route, navigation }) {
  const { artwork } = route.params;
    const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const { t, locale } = useLanguage(); // We also get 'locale' to pass to the speech engine


  useEffect(() => {
    const checkStatus = async () => {
      const status = await isFavorite(artwork.title);
      setIsFav(status);
    };
    checkStatus();
  }, [artwork.title]);

  // --- 4. CREATE A TOGGLE FUNCTION ---
  const handleToggleFavorite = async () => {
    if (isFav) {
      await removeFavorite(artwork.title);
      setIsFav(false);
    } else {
      await addFavorite(artwork);
      setIsFav(true);
    }
  };

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
        language: locale, // <-- IMPORTANT FOR ACCURATE SPEECH
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
          {isSpeaking ? t('stopReadingButton') : t('readAloudButton')}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{artwork.title}</Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={32}
              color={isFav ? "red" : "gray"}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.artist}>{t('artistByLine')} {artwork.artist}</Text>
      </View>
      
      

      <View style={styles.section}>
        <Text style={styles.heading}>{t('historyHeader')}</Text>
        <Text style={styles.body}>{artwork.history}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>{t('triviaHeader')}</Text>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allows text to wrap if it's long
    marginRight: 10,
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