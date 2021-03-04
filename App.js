import React from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';

import RNLocation from 'react-native-location';

RNLocation.configure({
  distanceFilter: 1,
}).then((r) => console.log('RN Location Configured'));

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
  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Get Location" onPress={permissionHandle} />
      </View>
      <Text>Latitude: </Text>
      <Text>Longitude: </Text>
      <View
        style={{marginTop: 10, padding: 10, borderRadius: 10, width: '40%'}}>
        <Button title="Send Location" />
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
