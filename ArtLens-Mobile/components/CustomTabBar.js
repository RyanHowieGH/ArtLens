// components/CustomTabBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// This component receives 'state' and 'navigation' props from the navigator
export default function CustomTabBar({ state, navigation }) {
  // 'state.routes' is an array of all your tabs (Settings, Home, Favorites)
  // 'state.index' is the index of the currently active tab
  const { routes, index: activeIndex } = state;

  return (
    <View style={styles.container}>
      {routes.map((route, routeIndex) => {
        const isFocused = activeIndex === routeIndex;

        // Function to handle press events
        const onPress = () => {
          // 'navigate' will jump to the screen if it exists
          // 'emit' is used to handle standard tab press behavior (like 'tabPress')
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,

          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Determine icon and style based on the route name and focus state
        let iconName;
        let buttonStyle = styles.tabButton; // Default style (25%)
        let iconColor = isFocused ? 'white' : '#333';
        
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
          buttonStyle = styles.homeTabButton; // Special style for Home (50%)
        } else if (route.name === 'Settings') {
          iconName = isFocused ? 'settings' : 'settings-outline';
        } else if (route.name === 'Favorites') {
          iconName = isFocused ? 'heart' : 'heart-outline';
        }
        
        // Apply active background color if focused
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
            <Text style={{ color: iconColor }}>{route.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80, // You can adjust the height
    backgroundColor: '#d3d3d3',
    borderTopWidth: 1,
    borderTopColor: '#c0c0c0',
  },
  tabButton: {
    flex: 1, // This will take up 25% because Home is flex: 2
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeTabButton: {
    flex: 2, // This makes it take up twice the space of the others (50%)
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackground: {
    backgroundColor: '#555555',
  },
});