import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, Alert } from 'react-native';
import Button from '../components/button';
import { collection, getDocs, query, where, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get("window");

interface DashboardScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [targetCalories, setTargetCalories] = useState<number>(0);
  const [totalSteps,setTotalSteps] = useState<number>(0);

  // Fetch total calories from workouts, meals, and activities
  const fetchTotalCalories = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        let totalCalories = 0;
        let totalSteps = 0;

        // Fetch workouts calories
        const workoutsRef = collection(firestore, "workouts");
        const workoutQuery = query(workoutsRef, where("userId", "==", user.uid));
        const workoutSnapshot = await getDocs(workoutQuery);
        workoutSnapshot.docs.forEach((doc) => {
          const workoutData = doc.data();
          if (workoutData.calories) {
            totalCalories += parseInt(workoutData.calories, 10);
          }
        });

        // Fetch activities calories
        const activitiesRef = collection(firestore, "activities");
        const activityQuery = query(activitiesRef, where("userId", "==", user.uid));
        const activitySnapshot = await getDocs(activityQuery);
        activitySnapshot.docs.forEach((doc) => {
          const activityData = doc.data();
          if (activityData.calories) {
            totalCalories += parseInt(activityData.calories, 10);
          }
          if (activityData.stepCount) {
            totalSteps += parseInt(activityData.stepCount, 10);
          }
        });

        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        const userData = userDoc.data();
        if (userData && userData.targetCalories) {
          setTargetCalories(parseInt(userData.targetCalories, 10));
        }

        // Set the total calories
        setTotalCalories(totalCalories);
        setTotalSteps(totalSteps);

      } catch (error) {
        console.error("Error fetching data: ", error);
        Alert.alert("Error", "There was an error fetching your data.");
      }
    }
  };

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Notification Permission", "We need permission to send you notifications.");
      }
    };

    requestPermissions(); 

    fetchTotalCalories();  

    const user = auth.currentUser;
    if (user) {
      const mealsRef = collection(firestore, "meals");
      const activitiesRef = collection(firestore, "activities");
      const workoutsRef = collection(firestore, "workouts");

      
      const unsubscribeMeals = onSnapshot(mealsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            fetchTotalCalories(); 
            sendImmediateReminder(); 
          }
        });
      });

      const unsubscribeActivities = onSnapshot(activitiesRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            fetchTotalCalories(); 
            sendImmediateReminder(); 
          }
        });
      });

      const unsubscribeWorkouts = onSnapshot(workoutsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            fetchTotalCalories(); 
            sendImmediateReminder();
          }
        });
      });

    
      return () => {
        unsubscribeMeals();
        unsubscribeActivities();
        unsubscribeWorkouts();
      };
    }
  }, []); 

  const sendImmediateReminder = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        const userData = userDoc.data();
        const targetCalories = userData?.targetCalories || 0;

        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Meal or Activity Logged!",
            body: "You just logged a meal or activity. Keep it up! Your target is ${targetCalories} calories today.",
          },
          trigger: null, 
        });
      }
    } catch (error) {
      console.error("Error sending immediate reminder: ", error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/home.jpg')} 
      style={styles.background}
      resizeMode="cover" 
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Fit Track Dashboard</Text>
        <Text style={styles.stat}>Steps Today: {totalSteps}</Text>
        <Text style={styles.stat}>Calories Burned: {totalCalories}</Text>

        <Button
          title="Start Activity"
          onPress={() => navigation.navigate('ActivityTracker')}
          style={styles.button}
        />
        <Button
          title="View Workout Log"
          onPress={() => navigation.navigate('WorkoutLog')}
          style={styles.button}
        />
        <Button
          title="Track Nutrition"
          onPress={() => navigation.navigate('NutritionTracker')}
          style={styles.button}
        />
        <Button
          title="Profile"
          onPress={() => navigation.navigate('Profile')}
          style={styles.button}
        />
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
  stat: {
    fontSize: 20,
    marginVertical: 10,
    color: "#000080",
    fontWeight: '500',
  },
  
  button: {
    width: width * 0.6,
    marginVertical: 10,
  },
});

export default DashboardScreen;