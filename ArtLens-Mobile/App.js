// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import icons
import  CustomTabBar  from './components/CustomTabBar'; // Import custom tab bar
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import ConfirmationScreen from './screens/ConfirmationScreen';

// Import all screens
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';
import FavoritesScreen from './screens/FavoritesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// This stack contains the flow from the camera to the results
function HomeStack() {
  const { t } = useLanguage(); // <-- 1. Get the t() function
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ArtLensHome" // Use a unique name
        component={HomeScreen} 
        options={{ title: 'ArtLens' }} // This will be the header text
      />
      <Stack.Screen 
        name="Confirmation" 
        component={ConfirmationScreen} 
        options={{ title: t('confirmHeader') }} // Also translate this header
      />
      <Stack.Screen 
        name="Result" 
        component={ResultScreen} 
        options={{ title: t('artworkDetailsHeader') }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  // const { t } = useLanguage(); // Use the hook to get the translation function

  return (
    <Tab.Navigator
      initialRouteName="Home" // Keep this as the stable English key
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Home" component={HomeStack}
            options={{ headerShown: false }} // Hide the header for the tab navigator
            />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

// This is the main component with the bottom tab bar
export default function App() {
  return (
    // --- WRAP EVERYTHING IN THE PROVIDER ---
    <LanguageProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </LanguageProvider>
  );
}