import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const RFID_PATTERN = /^[a-z0-9-]{5,64}$/i;

export default function App() {
  return (
    <SafeAreaProvider>
      <Scanner />
    </SafeAreaProvider>
  );
}

function Scanner() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rfid, setRfid] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const requestRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  async function request(path, options = {}) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(API_URL + path, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(session ? { Authorization: "Bearer " + session.token } : {}),
        },
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401 && session) {
        setSession(null);
        setResult(null);
      }
      if (!response.ok)
        throw new Error(
          body.message ||
            (response.status === 404
              ? "This RFID tag is not registered."
              : "PetVet is temporarily unavailable."),
        );
      return body;
    } catch (error) {
      if (error.name === "AbortError")
        throw new Error(
          "Request timed out. Check your connection and try again.",
        );
      if (error instanceof TypeError)
        throw new Error(
          "Cannot reach PetVet. Check the server address and your network.",
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  async function login() {
    if (busy) return;
    if (!API_URL) {
      setError(
        "Set EXPO_PUBLIC_API_URL in AppScanner/.env to your PetVet API address, then restart Expo.",
      );
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await request("/users/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setSession(data);
      setPassword("");
      setRfid("");
      setResult(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function scan() {
    if (busy) return;
    const tag = rfid.trim().toUpperCase();
    if (!RFID_PATTERN.test(tag)) {
      setResult(null);
      setError("Enter 5–64 letters, numbers, or hyphens.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await request("/pets/rfid/" + encodeURIComponent(tag)));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setRfid("");
    setResult(null);
    setError("");
    inputRef.current?.focus();
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          <View style={styles.top}>
            <Text style={styles.brand}>
              PetVet<Text style={styles.dot}> ●</Text>
            </Text>
            <Text style={styles.eyebrow}>CARE, CONNECTED.</Text>
          </View>
          <Text style={styles.title}>
            {session ? "A tag. A connection." : "Welcome to PetVet."}
          </Text>
          <Text style={styles.description}>
            {session
              ? "Scan or enter an RFID number to find a companion and their recovery details."
              : "Sign in to look up registered pets securely. Veterinary staff can access the registry; owners can find their own pets."}
          </Text>
          <View style={styles.card}>
            {!session ? (
              <>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  accessibilityLabel="Email address"
                  editable={!busy}
                />
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  secureTextEntry
                  autoComplete="current-password"
                  placeholder="Your password"
                  accessibilityLabel="Password"
                  editable={!busy}
                  onSubmitEditing={login}
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.button, busy && styles.disabled]}
                  disabled={busy}
                  onPress={login}
                >
                  <Text style={styles.buttonText}>Sign in</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>RFID number</Text>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={rfid}
                  onChangeText={(value) => {
                    setRfid(value);
                    setResult(null);
                    setError("");
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                  maxLength={64}
                  placeholder="Scan or enter tag number"
                  accessibilityLabel="RFID number"
                  editable={!busy}
                  returnKeyType="search"
                  onSubmitEditing={scan}
                />
                <Text style={styles.hint}>
                  Use a keyboard-compatible reader or type the tag number.
                  Leading zeros are preserved.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.button, busy && styles.disabled]}
                  disabled={busy}
                  onPress={scan}
                >
                  <Text style={styles.buttonText}>Look up pet</Text>
                </TouchableOpacity>
              </>
            )}
            {busy && (
              <ActivityIndicator
                style={styles.loading}
                color="#28775a"
                accessibilityLabel="Loading"
              />
            )}
            {Boolean(error) && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
          </View>
          {result && (
            <View style={styles.card}>
              <Text style={styles.eyebrow}>MATCH FOUND · {result.rfid}</Text>
              <Text style={styles.petName}>{result.petName}</Text>
              <Text style={styles.badge}>{result.status}</Text>
              {[
                ["Species", result.petType],
                [
                  "Breed",
                  [result.breed1, result.breed2].filter(Boolean).join(" / "),
                ],
                ["Owner", result.ownerName],
                ["Contact", result.contact],
                ["Recovery address", result.address],
              ].map(([label, value]) => (
                <View key={label} style={styles.detail}>
                  <Text style={styles.label}>{label}</Text>
                  <Text selectable style={styles.value}>
                    {value || "Unavailable"}
                  </Text>
                </View>
              ))}
              <Text style={styles.sectionTitle}>Vaccination history</Text>
              {result.vaccinationHistory?.length ? (
                result.vaccinationHistory.map((vaccine, index) => (
                  <View style={styles.vaccine} key={vaccine._id || index}>
                    <Text style={styles.value}>{vaccine.vaccinationType}</Text>
                    <Text style={styles.hint}>
                      {new Date(
                        vaccine.date.slice(0, 10) + "T12:00:00",
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.hint}>No vaccinations recorded.</Text>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.button}
                disabled={busy}
                onPress={reset}
              >
                <Text style={styles.buttonText}>Scan another pet</Text>
              </TouchableOpacity>
            </View>
          )}
          {session && (
            <View style={styles.footer}>
              <Text style={styles.hint}>
                Signed in as {session.result.name}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  setSession(null);
                  reset();
                }}
              >
                <Text style={styles.signout}>Sign out</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.footnote}>Small tag. Big peace of mind.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f7f0" },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    width: "100%",
    maxWidth: 650,
    alignSelf: "center",
  },
  top: { marginBottom: 45 },
  brand: { fontSize: 30, fontWeight: "800", color: "#274c36" },
  dot: { color: "#82a26a", fontSize: 18 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#859b72",
    marginTop: 5,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#294c32",
    marginBottom: 15,
  },
  description: {
    color: "#819174",
    lineHeight: 23,
    fontSize: 14,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e4eadc",
    padding: 24,
    marginBottom: 20,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#718365", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#dfe7d6",
    borderRadius: 8,
    padding: 14,
    color: "#31512f",
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: "#fdfefb",
  },
  button: {
    backgroundColor: "#28775a",
    padding: 16,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  disabled: { opacity: 0.5 },
  loading: { marginTop: 20 },
  error: {
    color: "#a14839",
    backgroundColor: "#fff1eb",
    padding: 13,
    marginTop: 18,
    lineHeight: 21,
    borderRadius: 8,
  },
  hint: { fontSize: 12, color: "#8a9c7b", lineHeight: 20 },
  petName: { fontSize: 30, fontWeight: "700", marginTop: 13, color: "#31512f" },
  badge: {
    color: "#548148",
    backgroundColor: "#eef4e5",
    alignSelf: "flex-start",
    padding: 7,
    borderRadius: 5,
    fontSize: 11,
    textTransform: "capitalize",
    marginVertical: 14,
  },
  detail: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#edf1e7",
  },
  value: { fontSize: 15, color: "#526948", lineHeight: 23 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#31512f",
    marginTop: 24,
    marginBottom: 12,
  },
  vaccine: { paddingVertical: 10 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  signout: { color: "#28775a", fontSize: 13, fontWeight: "600" },
  footnote: {
    textAlign: "center",
    color: "#9aab88",
    fontSize: 11,
    marginVertical: 30,
  },
});
