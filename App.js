import React, {useEffect} from 'react';
import {StyleSheet, View, Text, Button, Platform, PermissionsAndroid, ToastAndroid, Alert} from 'react-native';

import RNLocation from 'react-native-location';
import VIForegroundService from '@voximplant/react-native-foreground-service';
import Geolocation from 'react-native-geolocation-service';


RNLocation.configure({
    distanceFilter: 1,
}).then((r) => console.log('RN Location Configured'));

const hasLocationPermission = async () => {
    // if (Platform.OS === 'ios') {
    //   const hasPermission = await this.hasLocationPermissionIOS();
    //   return hasPermission;
    // }

    if (Platform.OS === 'android' && Platform.Version < 23) {
        return true;
    }

    const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
        return true;
    }

    const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
        ToastAndroid.show(
            'Location permission denied by user.',
            ToastAndroid.LONG,
        );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        ToastAndroid.show(
            'Location permission revoked by user.',
            ToastAndroid.LONG,
        );
    }

    return false;
};

const permissionHandle = async () => {
    console.log('here');

    let permission = await RNLocation.checkPermission({
        ios: 'whenInUse', // or 'always'
        android: {
            detail: 'coarse', // or 'fine'
        },
    });

    console.log('here2');
    console.log(permission);

    let location;

    if (!permission) {
        permission = await RNLocation.requestPermission({
            ios: 'whenInUse',
            android: {
                detail: 'coarse',
                rationale: {
                    title: 'We need to access your location',
                    message: 'We use your location to show where you are on the map',
                    buttonPositive: 'OK',
                    buttonNegative: 'Cancel',
                },
            },
        });
        console.log(permission);
        location = await RNLocation.getLatestLocation({timeout: 100});
        console.log(
            location,
            location.longitude,
            location.latitude,
            location.timestamp,
        );
    } else {
        console.log('Here 7');
        location = await RNLocation.getLatestLocation({timeout: 100});
        console.log(
            location,
            location.longitude,
            location.latitude,
            location.timestamp,
        );
    }
};

const App = () => {

    useEffect( () => {
            Geolocation.stopObserving()
        }
    ,[])

    let watchId = null;
    const getLocation = async () => {
        // const hasLocationPermission = await hasLocationPermission();
        //
        // if (!hasLocationPermission) {
        //     return;
        // }

        Geolocation.getCurrentPosition(
            (position) => {
                // this.setState({ location: position, loading: false });
                console.log(position);
            },
            (error) => {
                // this.setState({ loading: false });
                Alert.alert(`Code ${error.code}`, error.message);
                console.log(error);
            },
            {
                accuracy: {
                    android: 'high',
                    ios: 'best',
                },
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                distanceFilter: 0,
                forceRequestLocation: true,
                showLocationDialog: true,
            },
        );

    };

    const getLocationUpdates = async () => {
        // const hasLocationPermission = await this.hasLocationPermission();
        //
        // if (!hasLocationPermission) {
        //     return;
        // }

        if (Platform.OS === 'android' ) {
            await startForegroundService();
        }
         watchId = Geolocation.watchPosition(
                (position) => {
                    // this.setState({ location: position });
                    console.log("Updated positions", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.log(error);
                },
                {
                    accuracy: {
                        android: 'high',
                        ios: 'best',
                    },
                    enableHighAccuracy: true,
                    distanceFilter: 0.1,
                    interval: 20000,
                    fastestInterval: 5000,
                    forceRequestLocation: true,
                    showLocationDialog: true,
                    useSignificantChanges: false,
                },
            );

    };

    const removeLocationUpdates = () => {
        if (watchId !== null) {
            console.log("WatchID ",watchId);
            stopForegroundService();
            Geolocation.clearWatch(watchId);
           watchId = null;
            // this.setState({ updatesEnabled: false });
        }
        Geolocation.stopObserving();
    };

    const startForegroundService = async () => {
        if (Platform.Version >= 26) {
            await VIForegroundService.createNotificationChannel({
                id: 'locationChannel',
                name: 'Location Tracking Channel',
                description: 'Tracks location of user',
                enableVibration: false,
            });
        }

        return VIForegroundService.startService({
            channelId: 'locationChannel',
            id: 420,
            title: 'Appigo-Delivery',
            text: 'Tracking location updates',
            icon: 'ic_launcher',
        });
    };

    const stopForegroundService = () => {
        VIForegroundService.stopService().catch((err) => err);
    };

    // async function startForegroundService() {
    //   const notificationConfig = {
    //     channelId: 'channelId',
    //     id: 3456,
    //     title: 'Title',
    //     text: 'Some text',
    //     icon: 'ic_icon'
    //   };
    //   try {
    //     await VIForegroundService.startService(notificationConfig);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }
    return (
        <View style={styles.container}>
            <Text>Welcome!</Text>
            <View
                style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
                <Button title="Get Location" onPress={permissionHandle}/>
            </View>
            <Text>Latitude: </Text>
            <Text>Longitude: </Text>
            <View
                style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
                <Button title="Send Location" onPress={startForegroundService}/>
            </View>

            <View
                style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
                <Button title="Stop Location" onPress={stopForegroundService}/>
            </View>

            <View
                style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
                <Button title="Get Current Location" onPress={getLocation}/>
            </View>

            <View
                style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
                <Button title="Start Location Update" onPress={getLocationUpdates}/>
            </View>

            <View
                style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
                <Button title="Stop Location Update" onPress={removeLocationUpdates}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default App;
