import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, ImageBackground, Alert } from 'react-native';
import { auth, firestore } from '../firebase'; 
import { doc, setDoc} from 'firebase/firestore'; 
import Button from '../components/button';

const { width, height } = Dimensions.get("window");
const ProfileScreen: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [targetCalories, setTargetCalories] = useState<string>('');

  const handleSaveProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'Please sign in first.');
      return;
    }

    if (!weight || !height || !targetCalories) {
      Alert.alert('Error', 'Please fill in both weight and height.');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);

      await setDoc(userRef, {
        weight: weight,
        height: height,
        targetCalories: targetCalories,
        userId: user.uid, 
      }, { merge: true }); 

      Alert.alert('Success', 'Profile saved successfully!');
      setWeight('');
      setHeight('');
      setTargetCalories('');
    } catch (error) {
      console.error('Error saving profile: ', error);
      Alert.alert('Error', 'There was an error saving your profile.');
    }
  };

  return (
    <ImageBackground
          source={require('../assets/home.jpg')} 
          style={styles.background}
          resizeMode="cover"
        >
    <View style={styles.overlay}>
      <Text style={styles.title}>Profile Setup</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your weight (kg)"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your height (cm)"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your target calories"
        keyboardType="numeric"
        value={targetCalories}
        onChangeText={setTargetCalories}
      />

      <Button title="Save Profile" onPress={handleSaveProfile} style={styles.button} />
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 215, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "#191970",
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#0099cc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 18,
    backgroundColor: '#e6f7ff',
    width: 300,  
  },
  button: {
    width: width * 0.6,
    marginVertical: 10,
  },
});

export default ProfileScreen;
