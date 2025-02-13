import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { firestore } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Button from '../components/button';
import { getDistance } from 'geolib'; 

const { width } = Dimensions.get("window");

const ActivityTrackerScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
  const [calories, setCalories] = useState(0);
  const [userWeight, setUserWeight] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const accelerometerSubscription = useRef<any | null>(null);

  const stepThreshold = 1.2; 

  const stepCounter = useRef(0); 

  useEffect(() => {
    const fetchUserWeight = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (userId) {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const weight = userSnap.data().weight;
          console.log('Fetched user weight:', weight);
          setUserWeight(weight);
        } else {
          console.error('User data not found');
        }
      }
    };

    fetchUserWeight();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isTracking]);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 }, 
      (newLocation) => {
        console.log('New location:', newLocation);
        setLocation(newLocation);

        if (lastLocation) {
          
          const distanceInMeters = getDistance(
            { latitude: lastLocation.coords.latitude, longitude: lastLocation.coords.longitude },
            { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude }
          );

          
          if (distanceInMeters > 1) {
            const distanceInKm = distanceInMeters / 1000;
            setDistance((prev) => prev + distanceInKm); 
            console.log(`Distance calculated: ${distanceInKm} km`);
          }
        }

        setLastLocation(newLocation);
      }
    );

    Accelerometer.setUpdateInterval(100);
    accelerometerSubscription.current = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
      if (totalAcceleration > stepThreshold) {
        stepCounter.current++;
        setStepCount(stepCounter.current);
      }
    });

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
      calculateCalories();
    }, 1000);
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
    }
  };

  const handleStartPause = () => {
    setIsTracking(!isTracking);
  };

  const handleEnd = async () => {
    setIsTracking(false);
    setTimeElapsed(0);
    setDistance(0);
    setStepCount(0);
    setCalories(0);

    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.error("User is not authenticated");
      return;
    }
  
    try {
      const activityData = {
        userId,
        workoutType: 'walking',
        timeElapsed,
        stepCount,
        distance,
        calories,
        timestamp: new Date(),
      };

      const activitiesRef = collection(firestore, 'activities');
      await addDoc(activitiesRef, activityData);
      console.log('Activity saved successfully');
    } catch (error) {
      console.error('Error saving activity to Firestore: ', error);
    }
  };

  
  const calculateCalories = () => {
    if (userWeight && stepCount > 0) {
      
      const caloriesPerStep = 0.04;  
      const totalCalories = caloriesPerStep * stepCount * (userWeight / 70);  
      console.log(`Calories burned: ${totalCalories}`);  
      setCalories(totalCalories);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/Acti.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Activity Tracker</Text>

        <Text style={styles.stat}>Time: {timeElapsed}s</Text>
        <Text style={styles.stat}>Steps: {stepCount}</Text>
        
        {location && (
          <Text style={styles.stat}>
            Latitude: {location.coords.latitude.toFixed(4)}, Longitude: {location.coords.longitude.toFixed(4)}
          </Text>
        )}

        <Button
          title={isTracking ? 'Pause Activity' : 'Start Activity'}
          onPress={handleStartPause}
        />
        <Button title="End Activity" onPress={handleEnd} style={styles.button}/>
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
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 20,
    textAlign: "center",
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

export default ActivityTrackerScreen;
