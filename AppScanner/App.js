import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ScanRFID = () => {
    const [rfidNumber, setRfidNumber] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Function to fetch pet data when the RFID number changes
    useEffect(() => {
        if (!rfidNumber) {
            setData(null); // Reset data when RFID number is empty
            return;
        }

        const fetchPetData = async () => {
            // Check if RFID number is exactly 5 digits
            if (rfidNumber.length !== 5 || isNaN(rfidNumber)) {
                setError('RFID is incorrect (should be 5 digits)');
                setData(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://192.168.0.138:5000/api/pets/rfid/${rfidNumber}`);
                
                if (!response.ok) {
                    setError('RFID number is not registered');
                    setData(null);
                    return;
                }

                const result = await response.json();

                // Log the result for debugging
                console.log('API Response:', result);

                // Check if pet data is found
                if (!result || !result.petName) {
                    setError('RFID number is not registered');
                    setData(null);
                    return;
                }

                setData(result);
            } catch (err) {
                setError('Error fetching data');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPetData();
    }, [rfidNumber]); // Effect runs when rfidNumber changes

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const refreshScan = () => {
        setRfidNumber('');
        setData(null);
        setError(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pet Information</Text>
            <Text style={styles.time}>
                {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Scan RFID tag"
                value={rfidNumber}
                onChangeText={setRfidNumber}
            />
            
            {loading && <Text>Loading...</Text>}

            {error && <Text style={styles.error}>{error}</Text>}

            {data && (
                <View style={styles.dataContainer}>
                    <Text style={{ fontSize: 20 }}>Pet Name: {data.petName}</Text>
                    <Text style={{ fontSize: 20 }}>Owner: {data.ownerName}</Text>
                    <Text style={{ fontSize: 20 }}>Contact: {data.contact}</Text>
                    <Text style={{ fontSize: 20 }}>Address: {data.address}</Text>
                    <Text style={{ fontSize: 20 }}>Pet Type: {data.petType}</Text>
                    <Text style={{ fontSize: 20 }}>Breed: {data.breed1} / {data.breed2}</Text>

                    {data.vaccinationHistory && Array.isArray(data.vaccinationHistory) && data.vaccinationHistory.length > 0 ? (
                        <View style={styles.vaccinationHistory}>
                            <Text style={styles.historyHeader}>Vaccination History:</Text>
                            {data.vaccinationHistory
                                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date in descending order
                                .map((vaccination, index) => (
                                    <View key={index} style={styles.historyItem}>
                                        <Text style={{ fontSize: 18 }}>
                                            {`Date: ${new Date(vaccination.date).toLocaleDateString()} - Type: ${vaccination.vaccinationType}`}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    ) : (
                        <Text>No vaccination history available.</Text>
                    )}
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={refreshScan}>
                <Text style={styles.buttonText}>Scan Another</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 40,
        marginBottom: 20
    },
    time: {
        fontSize: 20,
        marginBottom: 20
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        width: '80%',
        paddingHorizontal: 10,
    },
    dataContainer: {
        marginTop: 20,
        fontSize: 30
    },
    error: {
        color: 'red',
    },
    vaccinationHistory: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        width: '100%',
    },
    historyHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    historyItem: {
        marginBottom: 5,
    },
    button: {
        borderRadius: 15,
        marginTop: 10,
        backgroundColor: 'green',
        padding: 15
    },
    buttonText: {
        color: 'white'
    }
});

export default ScanRFID;
