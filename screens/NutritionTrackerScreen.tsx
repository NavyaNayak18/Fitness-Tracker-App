import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Dimensions, StyleSheet, FlatList, ImageBackground, Alert } from 'react-native';
import { firestore } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Button from '../components/button';

const { width, height } = Dimensions.get("window");

const NutritionTrackerScreen = () => {
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealList, setMealList] = useState<any[]>([]); 

  
  useEffect(() => {
    const fetchMeals = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User is not authenticated");
        return;
      }

      try {
        const mealsRef = collection(firestore, 'meals');
        const q = query(mealsRef, where('userId', '==', userId)); 
        const querySnapshot = await getDocs(q);
        
        const meals = querySnapshot.docs.map((doc) => doc.data());
        setMealList(meals);
      } catch (error) {
        console.error('Error fetching meals from Firestore:', error);
        Alert.alert('Error', 'Failed to fetch meals');
      }
    };

    fetchMeals();
  }, []);

  
  const addMeal = async () => {
    if (!mealName || !mealCalories) {
      Alert.alert('Error', 'Please fill in the meal name and calories');
      return;
    }

    const newMeal = {
      name: mealName,
      description: mealDescription,
      calories: mealCalories,
      timestamp: new Date(),
    };

   
    try {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User is not authenticated");
        return;
      }

      const mealsRef = collection(firestore, 'meals');
      await addDoc(mealsRef, {
        userId,
        ...newMeal,
      });

      console.log('Meal saved to Firestore:', newMeal);
      setMealList((prevMeals) => [...prevMeals, newMeal]);
      setMealName('');
      setMealDescription('');
      setMealCalories('');
    } catch (error) {
      console.error('Error saving meal to Firestore:', error);
      Alert.alert('Error', 'Failed to save meal to Firestore');
    }
  };

  return (
    <ImageBackground
          source={require('../assets/nut.jpg')} 
          style={styles.background}
          resizeMode="cover" 
        >
    <View style={styles.overlay}>
      <Text style={styles.title}>Nutrition Tracker</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Meal Name"
        value={mealName}
        onChangeText={setMealName}
      />
      <TextInput
        style={styles.input}
        placeholder="Meal Description (Optional)"
        value={mealDescription}
        onChangeText={setMealDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Calories"
        keyboardType="numeric"
        value={mealCalories}
        onChangeText={setMealCalories}
      />

      <Button title="Add Meal" onPress={addMeal} style={styles.button}/>

     
      <FlatList
        data={mealList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.mealItem}>
            <Text style={styles.mealTitle}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>Calories: {item.calories}</Text>
          </View>
        )}
      />
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  button: {
    width: width * 0.6,
    marginVertical: 10,
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
  mealItem: {
    padding: 15,
  borderBottomWidth: 1,
  marginBottom: 10,
  width: '100%',
  borderColor: '#007BFF',
  backgroundColor: '#fff', 
  borderRadius: 10,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
});

export default NutritionTrackerScreen;
