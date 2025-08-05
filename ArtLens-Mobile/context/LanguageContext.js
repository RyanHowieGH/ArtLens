// context/LanguageContext.js
import React, { createContext, useState, useContext } from 'react';
import { I18n } from 'i18n-js';

// Define your translations
const translations = {
  en: {
    // HomeScreen
    selectImagePrompt: 'Tap to select an image',
    analyzeButton: 'Analyze Image',
    analyzing: 'Analyzing...', 
    // SettingsScreen
    settingsTitle: 'Settings',
    languageHeader: 'Select Language',
    // Tab Bar
    homeTab: 'Home',
    settingsTab: 'Settings',
    favoritesTab: 'Favorites',
    // Alerts
    noImage: 'No Image',
    noImagePrompt: 'Please select an image first.',
  },
  es: {
    // HomeScreen
    selectImagePrompt: 'Toca para seleccionar una imagen',
    analyzeButton: 'Analizar Imagen',
    analyzing: 'Analizando...',
    // SettingsScreen
    settingsTitle: 'Configuración',
    languageHeader: 'Seleccionar Idioma',
    // Tab Bar
    homeTab: 'Inicio',
    settingsTab: 'Configuración',
    favoritesTab: 'Favoritos',
    // Alerts
    noImage: 'Sin Imagen',
    noImagePrompt: 'Por favor, selecciona una imagen primero.',
  },
  fr: {
    // HomeScreen
    selectImagePrompt: 'Touchez pour sélectionner une image',
    analyzeButton: 'Analyser l\'image',
    analyzing: 'Analyse en cours...',
    // SettingsScreen
    settingsTitle: 'Paramètres',
    languageHeader: 'Sélectionner la langue',
    // Tab Bar
    homeTab: 'Accueil',
    settingsTab: 'Paramètres',
    favoritesTab: 'Favoris',
    // Alerts
    noImage: 'Aucune Image',
    noImagePrompt: 'Veuillez d\'abord sélectionner une image.',
  },
};

// Set up i18n
const i18n = new I18n(translations);
i18n.enableFallback = true; // Fallback to English if a translation is missing

// Create the context
const LanguageContext = createContext();

// Create the provider component
export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en'); // Default language is English
  i18n.locale = locale;

  const setLanguage = (langCode) => {
    setLocale(langCode);
    i18n.locale = langCode;
  };

  const t = (key) => i18n.t(key);

  return (
    <LanguageContext.Provider value={{ locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useLanguage = () => useContext(LanguageContext);