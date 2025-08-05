// components/CustomTabBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext'; // We need this import

export default function CustomTabBar({ state, navigation }) {
  // --- THE ONLY CHANGE NEEDED ---
  // We call useLanguage() here NOT to get the 't' function, but simply
  // to make this component re-render whenever the 'locale' inside the context changes.
  const { t } = useLanguage(); 

  const { routes, index: activeIndex } = state;

  return (
    <View style={styles.container}>
      {routes.map((route, routeIndex) => {
        const isFocused = activeIndex === routeIndex;
        
        // --- CHANGE #2: Translate the label here directly ---
        // We use the stable English route.name to find the correct translation key.
        let label;
        if (route.name === 'Settings') label = t('settingsTab');
        else if (route.name === 'Home') label = t('homeTab');
        else if (route.name === 'Favorites') label = t('favoritesTab');
        else label = route.name; // Fallback

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        let buttonStyle = styles.tabButton;
        let iconColor = isFocused ? 'white' : '#333';
        
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
          buttonStyle = styles.homeTabButton;
        } else if (route.name === 'Settings') {
          iconName = isFocused ? 'settings' : 'settings-outline';
        } else if (route.name === 'Favorites') {
          iconName = isFocused ? 'heart' : 'heart-outline';
        }
        
        const activeBg = isFocused ? styles.activeBackground : {};

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[buttonStyle, activeBg]}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            <Ionicons name={iconName} size={24} color={iconColor} />
            <Text style={{ color: iconColor }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Styles are the same
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#d3d3d3',
    borderTopWidth: 1,
    borderTopColor: '#c0c0c0',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeTabButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackground: {
    backgroundColor: '#555555',
  },
});