import React, { Component } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import VersionCheck from 'react-native-version-check';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  linkText: {
    color: 'blue',
  },
});

export default class example extends Component {
  state = {
    currentVersion: null,
    latestVersion: null,
    isNeeded: false,
    canSkip: true,
    minimalVersion: null,
    forcedVersion: null,
    blackList: null,
    storeUrl: '',
  };
  componentDidMount() {
    VersionCheck.needUpdate({
      currentVersion:'1.1.8',
      provider: 'jsonFile',
      url: 'https://raw.githubusercontent.com/hosek/react-native-version-check/master/version.json',
      platform: 'android'
    }).then(res => this.setState(res));

    // VersionCheck.getStoreUrl({ appID: '364709193' }).then(res => {
    //   //App Store ID for iBooks.
    //   this.setState({ storeUrl: res });
    // });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Current Version: {this.state.currentVersion}
        </Text>
        <Text style={styles.text}>
          Latest Version: {this.state.latestVersion}
        </Text>
        <Text style={styles.text}>
          Minimal Version: {this.state.minimalVersion}
        </Text>
        <Text style={styles.text}>
          Forced Version: {this.state.forcedVersion}
        </Text>
        <Text style={styles.text}>
          Blacklist: {this.state.blackList}
        </Text>
        <Text style={styles.text}>
          Is update needed?: {String(this.state.isNeeded)}
        </Text>
        <Text style={styles.text}>
          Can skip?: {String(this.state.canSkip)}
        </Text>
        <View>
          <Text style={styles.text}>Store Url:</Text>
          <Text
            style={[styles.text, styles.linkText]}
            onPress={() => Linking.openURL(this.state.storeUrl)}
          >
            {String(this.state.storeUrl)}
          </Text>
        </View>
      </View>
    );
  }
}
