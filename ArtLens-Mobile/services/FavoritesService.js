// services/FavoritesService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@ArtLens:Favorites';

// Helper function to get all favorites
const getFavorites = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to fetch favorites.', e);
    return [];
  }
};

// Helper function to save all favorites
const saveFavorites = async (favorites) => {
  try {
    const jsonValue = JSON.stringify(favorites);
    await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save favorites.', e);
  }
};

// --- Public Functions to be used in your components ---

// Add a new artwork to favorites
export const addFavorite = async (artwork) => {
  const favorites = await getFavorites();
  // Check if it already exists to avoid duplicates
  if (!favorites.some(fav => fav.title === artwork.title)) {
    const newFavorites = [...favorites, artwork];
    await saveFavorites(newFavorites);
  }
};

// Remove an artwork from favorites
export const removeFavorite = async (artworkTitle) => {
  const favorites = await getFavorites();
  const newFavorites = favorites.filter(fav => fav.title !== artworkTitle);
  await saveFavorites(newFavorites);
};

// Check if a specific artwork is already a favorite
export const isFavorite = async (artworkTitle) => {
  const favorites = await getFavorites();
  return favorites.some(fav => fav.title === artworkTitle);
};

// Export getFavorites so screens can display the list
export { getFavorites };