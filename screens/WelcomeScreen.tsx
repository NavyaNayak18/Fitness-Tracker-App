import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import Button from "../components/button";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { RootStackParamList } from "../App";
type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "Welcome">;
};


const { width, height } = Dimensions.get("window");

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user); 
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    navigation.navigate("SignIn"); 
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp"); 
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fit Track</Text>
      <Image
        source={require('../assets/welcome.jpg')} 
        style={styles.image}
        resizeMode="contain" 
      />

      {isSignedIn ? (
        <>
          <Button
            title="Go to Dashboard"
            onPress={() => navigation.navigate("Dashboard")} 
            style={styles.button}
          />
          <Button
            title="Sign Out"
            onPress={handleSignOut} 
            style={styles.button}
          />
        </>
      ) : (
        <>
          <Button
            title="Sign In"
            onPress={handleSignIn}  
            style={styles.button}
          />
          <Button
            title="Sign Up"
            onPress={handleSignUp} 
            style={styles.button}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD700", 
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20, 
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000080",
    textAlign: "center",
  },
  image: {
    width: width * 0.8,
    height: height * 0.4, 
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
    width: width * 0.6, 
  },
});

export default WelcomeScreen;
