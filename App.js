import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    Text,
    SafeAreaView,
    StatusBar,
    Button,
    Image,
    View,
    ScrollView,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";

import { LogBox } from "react-native";
LogBox.ignoreAllLogs();

export default function CDR() {
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
        useState();
    const [photo, setPhoto] = useState();
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState("welcome");

    useEffect(() => {
        (async () => {
            const cameraPermission =
                await Camera.requestCameraPermissionsAsync();
            const mediaLibraryPermission =
                await MediaLibrary.requestPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
            setHasMediaLibraryPermission(mediaLibraryPermission === "granted");
        })();
    }, []);

    if (hasCameraPermission === undefined) {
        return <Text>Requesting permission ...</Text>;
    } else if (!hasCameraPermission) {
        return (
            <Text>
                Permission for camera not granted. Please change this in
                settings.
            </Text>
        );
    }

    const takePic = async () => {
        let options = {
            quality: 1,
            base64: true,
            exif: false,
        };
        let newPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(newPhoto);
    };

    const openImagePickerAsync = async () => {
        let options = {
            quality: 1,
            base64: true,
            exif: false,
        };
        let pickerResult = await ImagePicker.launchImageLibraryAsync(options);
        setPhoto(pickerResult);
    };

    const uploadImage = async (inp) => {
        fetch("https://cdr-api-5ndnckhmeq-as.a.run.app/", {
            method: "POST",
            body: inp,
        })
            .then((response) => response.json())
            .then((json) => setData(json.res))
            .catch((e) => alert(e));
    };

    if (page === "welcome") {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text
                        style={{
                            fontSize: Dimensions.get("screen").width / 9,
                            textAlign: "center",
                        }}
                    >
                        Corn Disease Recognition
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <Button title="start" onPress={() => setPage("cdr")} />
                </View>
            </SafeAreaView>
        );
    } else {
        if (photo) {
            var img = new FormData();
            img.append("file", photo.base64);

            return (
                <SafeAreaView
                    style={{
                        paddingTop:
                            Platform.OS === "android"
                                ? StatusBar.currentHeight
                                : 0,
                        flex: 1,
                        alignItems: "center",
                    }}
                >
                    <Image
                        source={{
                            uri: "data:image/png;base64," + photo.base64,
                        }}
                        style={{
                            flex: 0.8,
                            width: 100,
                            minWidth: Dimensions.get("screen").width,
                        }}
                        resizeMode="contain"
                    />

                    <View
                        style={{
                            flex: 1,
                            flexDirection: "column",
                            // alignItems: "center",
                            // justifyContent: "center",
                            marginTop: 10,
                        }}
                    >
                        {data && (
                            <Text
                                style={{
                                    flex: 0.1,
                                    fontSize: 20,
                                    alignSelf: "center",
                                    color: "blue",
                                }}
                            >
                                Kết quả nhận dạng:
                            </Text>
                        )}

                        <ScrollView
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                // alignItems: "center",
                                // justifyContent: "center",
                                marginTop: 10,
                            }}
                            contentContainerStyle={{
                                flexGrow: 1,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {data &&
                                data.map((res) => (
                                    <View
                                        style={{
                                            // flex: 1,
                                            // flexDirection: "row",
                                            // justifyContent: "center",
                                            marginBottom: 5,
                                        }}
                                    >
                                        <Image
                                            source={{
                                                uri:
                                                    "data:image/jpg;base64," +
                                                    res[0],
                                            }}
                                            style={{
                                                // flex: 1,
                                                // minWidth: 200,
                                                // maxHeight: 200,
                                                width: 200,
                                                height: 200,
                                            }}
                                            // resizeMode="contain"
                                        />

                                        <Text
                                            style={{
                                                // flex: 1,
                                                textAlign: "center",
                                                fontSize: 15,
                                            }}
                                        >
                                            {res[1]}
                                        </Text>
                                    </View>
                                ))}

                            {loading && !data && (
                                <ActivityIndicator size="large" />
                            )}
                        </ScrollView>
                    </View>

                    <View
                        style={{
                            flex: 0.1,
                            flexDirection: "row",
                            paddingVertical: 5,
                        }}
                    >
                        <Button
                            title="Upload"
                            onPress={() => {
                                setData(undefined);
                                setLoading(true);
                                uploadImage(img);
                            }}
                        />
                        <Button
                            title="Cancel"
                            onPress={() => {
                                setPhoto(undefined);
                                setData(undefined);
                                setLoading(false);
                            }}
                            color="red"
                        />
                    </View>
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingTop: StatusBar.currentHeight,
                }}
            >
                <Camera
                    style={{
                        alignSelf: "stretch",
                        flex: 1,
                        resizeMode: "contain",
                    }}
                    ref={cameraRef}
                />

                <View
                    style={{
                        flexDirection: "row",
                        paddingVertical: 5,
                    }}
                >
                    <Button
                        title="Take Picture"
                        onPress={takePic}
                        color="blue"
                    />
                    <Button
                        title="Pick a photo"
                        onPress={openImagePickerAsync}
                        color="green"
                    />
                    <Button
                        title="Exit"
                        color="red"
                        onPress={() => setPage("welcome")}
                    />
                </View>
            </SafeAreaView>
        );
    }
}
