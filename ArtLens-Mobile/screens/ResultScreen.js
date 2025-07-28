// screens/ResultScreen.js
import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function ResultScreen({ route }) {
  // Get the 'artwork' object passed from the HomeScreen
  const { artwork } = route.params;

  return (
    <ScrollView style={styles.container}>
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

// --- STYLES ---
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
});