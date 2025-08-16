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
    homeReadyPrompt: 'Ready to discover art?',
    alertPermissionRequired: 'Permission required',
    alertCameraPermission: 'Camera permission is needed.',
    alertLibraryPermission: 'Photo library permission is needed.',
    alertSelectSource: 'Select Image Source',
    alertSourcePrompt: 'Choose a photo source:',
    alertTakePhoto: 'Take Photo',
    alertChooseLibrary: 'Choose from Library',
    alertCancel: 'Cancel',
    // ConfirmationScreen
    confirmHeader: 'Analyze this Image?',
    confirmButton: 'Confirm & Analyze',
    // ResultScreen
    historyHeader: 'History',
    triviaHeader: 'Trivia',
    readAloudButton: 'Read Aloud',
    stopReadingButton: 'Stop Reading',
    artistByLine: 'by',
    artworkDetailsHeader: 'Artwork Details',

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
    homeReadyPrompt: '¿Listo para descubrir arte?',
    alertPermissionRequired: 'Permiso requerido',
    alertCameraPermission: 'Se necesita permiso para la cámara.',
    alertLibraryPermission: 'Se necesita permiso para la biblioteca de fotos.',
    alertSelectSource: 'Seleccionar Fuente de Imagen',
    alertSourcePrompt: 'Elige una fuente de fotos:',
    alertTakePhoto: 'Tomar Foto',
    alertChooseLibrary: 'Elegir de la Biblioteca',
    alertCancel: 'Cancelar',
    // ConfirmationScreen
    confirmHeader: '¿Analizar esta Imagen?',
    confirmButton: 'Confirmar y Analizar',
    // ResultScreen
    historyHeader: 'Historia',
    triviaHeader: 'Curiosidades',
    readAloudButton: 'Leer en Voz Alta',
    stopReadingButton: 'Dejar de Leer',
    artistByLine: 'de', // For "de Edvard Munch"
    artworkDetailsHeader: 'Detalles de la Obra',
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
    homeReadyPrompt: 'Prêt à découvrir l\'art ?',
    alertPermissionRequired: 'Permission requise',
    alertCameraPermission: 'La permission de la caméra est nécessaire.',
    alertLibraryPermission: 'La permission de la photothèque est nécessaire.',
    alertSelectSource: 'Sélectionner la source de l\'image',
    alertSourcePrompt: 'Choisissez une source de photo :',
    alertTakePhoto: 'Prendre une photo',
    alertChooseLibrary: 'Choisir dans la bibliothèque',
    alertCancel: 'Annuler',
    // ConfirmationScreen
    confirmHeader: 'Analyser cette Image ?',
    confirmButton: 'Confirmer et Analyser',
    // ResultScreen
    historyHeader: 'Histoire',
    triviaHeader: 'Anecdotes',
    readAloudButton: 'Lire à Haute Voix',
    stopReadingButton: 'Arrêter la Lecture',
    artistByLine: 'par', // For "par Edvard Munch"
    artworkDetailsHeader: 'Détails de l\'œuvre',
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