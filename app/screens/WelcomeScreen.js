import React from "react";
import {
    Button,
    Dimensions,
    StyleSheet,
    Text,
    SafeAreaView,
    View,
} from "react-native";

function WelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={styles.text}>Corn Disease Recognition</Text>
            </View>

            <View style={{ flex: 1 }}>
                <Button title="start" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    text: {
        fontSize: Dimensions.get("screen").width / 9,
        textAlign: "center",
    },
    button: {},
});

export default WelcomeScreen;
