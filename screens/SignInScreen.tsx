import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert, ImageBackground, Dimensions } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; 

const { width, height } = Dimensions.get("window");

const SignInScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "You have signed in!");
      navigation.navigate("Dashboard"); 
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
      <View style={styles.overlay}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Sign In" onPress={handleSignIn} />
        <Text
          style={styles.link}
          onPress={() => navigation.navigate("SignUp")}
        >
          Don't have an account? Sign Up
        </Text>
      </View>
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
    backgroundColor: "#FFD700", 
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    width: width * 0.8, 
  },
  link: {
    color: "#1E90FF",
    marginTop: 15,
    textAlign: "center",
  },
});

export default SignInScreen;
