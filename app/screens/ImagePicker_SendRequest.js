import React from "react";
import {
    ActivityIndicator,
    Text,
    SafeAreaView,
    StatusBar,
    Button,
    Image,
    View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";

export default function App() {
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
        useState();
    const [photo, setPhoto] = useState();
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);

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
        fetch("http://192.168.1.3:5000", {
            method: "POST",
            body: inp,
        })
            .then((response) => response.json())
            .then((json) => setData(json.res))
            .catch((e) => alert(e));
    };

    if (photo) {
        var img = new FormData();
        img.append("file", photo.base64);

        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingTop: StatusBar.currentHeight,
                }}
            >
                <Image
                    style={{
                        alignSelf: "stretch",
                        flex: 0.8,
                        resizeMode: "contain",
                    }}
                    source={{
                        uri: "data:image/png;base64," + photo.base64,
                    }}
                />

                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        flexWrap: "wrap",
                        flexWrap: "wrap",
                        justifyContent: "space-evenly",
                        paddingVertical: 5,
                    }}
                >
                    {data &&
                        data.map((res) => (
                            <View
                                style={{
                                    flex: 1,
                                    flexWrap: "wrap",
                                    flexDirection: "column",
                                    height: 90,
                                    width: 90,
                                    paddingHorizontal: 40,
                                }}
                            >
                                <Image
                                    style={{
                                        flex: 1,
                                        resizeMode: "contain",
                                    }}
                                    source={{
                                        uri: "data:image/jpg;base64," + res[0],
                                    }}
                                />
                                <Text style={{ flex: 1 }}>{res[1]}</Text>
                            </View>
                        ))}

                    {loading && !data && <ActivityIndicator size="large" />}
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        paddingVertical: 5,
                    }}
                >
                    <Button
                        title="Upload"
                        onPress={() => {
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
                style={{ alignSelf: "stretch", flex: 1, resizeMode: "contain" }}
                ref={cameraRef}
            />

            <View
                style={{
                    flexDirection: "row",
                    paddingVertical: 5,
                }}
            >
                <Button title="Take Picture" onPress={takePic} color="blue" />
                <Button
                    title="Pick a photo"
                    onPress={openImagePickerAsync}
                    color="green"
                />
            </View>
        </SafeAreaView>
    );
}
