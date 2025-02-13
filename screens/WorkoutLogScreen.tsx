import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Dimensions, ImageBackground, Alert } from "react-native";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore";
import { auth, firestore } from '../firebase';
import Button from '../components/button';

const { width, height } = Dimensions.get("window");
const WorkoutLogScreen = () => {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [newWorkout, setNewWorkout] = useState({
    type: "",
    duration: "",
    calories: "",
  });

  useEffect(() => {
    const fetchWorkouts = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const workoutsRef = collection(firestore, "workouts");
          const q = query(workoutsRef, where("userId", "==", user.uid));
          const workoutsSnapshot = await getDocs(q);
          const fetchedWorkouts = workoutsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setWorkouts(fetchedWorkouts);
        } catch (error) {
          console.error("Error fetching workouts: ", error);
          Alert.alert("Error", "There was an error fetching your workouts.");
        }
      }
    };

    fetchWorkouts();
  }, []);

  const handleAddWorkout = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "Please sign in first.");
      return;
    }

    if (!newWorkout.type || !newWorkout.duration || !newWorkout.calories) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const newWorkoutRef = await addDoc(collection(firestore, "workouts"), {
        type: newWorkout.type,
        duration: newWorkout.duration,
        calories: newWorkout.calories,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });

      setWorkouts((prevWorkouts) => [
        ...prevWorkouts,
        { id: newWorkoutRef.id, ...newWorkout },
      ]);

      setNewWorkout({ type: "", duration: "", calories: "" });
    } catch (error) {
      console.error("Error adding workout: ", error);
      Alert.alert("Error", "There was an error adding your workout.");
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "Please sign in first.");
      return;
    }

    try {
      const workoutDocRef = doc(firestore, "workouts", id);
      await deleteDoc(workoutDocRef);

      setWorkouts(workouts.filter((workout) => workout.id !== id));
    } catch (error) {
      console.error("Error deleting workout: ", error);
      Alert.alert("Error", "There was an error deleting your workout.");
    }
  };

  return (
    <ImageBackground
          source={require('../assets/Work.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
    <View style={styles.overlay}>
      <Text style={styles.title}>Workout Log</Text>

      <TextInput
        style={styles.input}
        placeholder="Workout Type"
        value={newWorkout.type}
        onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, type: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Duration"
        value={newWorkout.duration}
        onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, duration: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Calories"
        value={newWorkout.calories}
        onChangeText={(text) => setNewWorkout((prev) => ({ ...prev, calories: text }))}
      />
      <Button title="Add Workout" onPress={handleAddWorkout} style={styles.button} />

      <FlatList
        data={workouts}
        renderItem={({ item }) => (
          <View style={styles.workoutCard}>
            <Text>Type: {item.type}</Text>
            <Text>Duration: {item.duration}</Text>
            <Text>Calories: {item.calories}</Text>
            <Button title="Delete" onPress={() => handleDeleteWorkout(item.id)} style={styles.button} />
          </View>
        )}
        keyExtractor={(item) => item.id}
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
    backgroundColor: "rgba(255, 215, 0, 0.4)",
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
    borderWidth: 1,
    borderColor: "#0099cc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#e6f7ff',
    width: 300,
    height: 40,
  },
  button: {
    width: width * 0.6,
    marginVertical: 10,
  },
  workoutCard: {
  padding: 15,
  borderWidth: 1,
  marginVertical: 10,
  borderRadius: 10,
  borderColor: '#007BFF',
  backgroundColor: '#fff',
  },
});

export default WorkoutLogScreen;
