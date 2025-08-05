// screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

export default function SettingsScreen() {
  const { locale, setLanguage, t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('languageHeader')}</Text>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            locale === lang.code && styles.selectedButton,
          ]}
          onPress={() => setLanguage(lang.code)}
        >
          <Text
            style={[
              styles.buttonText,
              locale === lang.code && styles.selectedText,
            ]}
          >
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  selectedButton: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f2ff',
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});