// screens/FavoritesScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Image } from 'expo-image';
// --- 1. IMPORT YOUR SERVICE ---
import { getFavorites } from '../services/FavoritesService';

// You'll need a local placeholder image in your assets folder
const placeholderImage = require('../assets/placeholder.png');

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  // --- 2. USE useFocusEffect TO RELOAD DATA ---
  // This hook runs every time the user navigates TO this screen.
  useFocusEffect(
    React.useCallback(() => {
      const loadFavorites = async () => {
        const favs = await getFavorites();
        setFavorites(favs);
      };
      loadFavorites();
    }, [])
  );

  // --- 3. CREATE THE RENDER ITEM FOR THE LIST ---
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Home', { screen: 'Result', params: { artwork: item } })}
    >
      <Image
        style={styles.thumbnail}
        source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : placeholderImage}
        placeholder={placeholderImage}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites yet.</Text>
          <Text style={styles.emptySubText}>Tap the heart on an artwork's page to add it here.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

// --- 4. ADD STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
  },
  emptySubText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
  },
});