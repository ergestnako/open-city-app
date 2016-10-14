import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  ProgressBarAndroid,
  ActivityIndicatorIOS,
  AsyncStorage
} from 'react-native';

import splashImage from './../img/splash_image.png';

import showAlert   from '../components/Alert';
import Spinner     from '../components/Spinner';
import makeRequest from '../util/requests';
import Util        from '../util/util';
import Models      from '../util/models';
import Config      from '../config';

import transError from '../translations/errors';

// SplashScreen shown while data is being loaded
class SplashScreen extends Component {

  constructor(props, context) {
    super(props, context);

    this.issues = [];
    this.userSubmittedIssues = Models.fetchAllIssues();

    transError.setLanguage('fi');
  }

  componentWillMount() {
    this.fetchIssues();
  }

  // Fetch a fixed amount of issues from Open311 API
  fetchIssues() {
    var url = Config.OPEN311_SERVICE_REQUESTS_URL;
    var headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};

    makeRequest(url, 'GET', headers, null, null)
    .then(result => {
      this.issues = Util.parseIssues(result, this.userSubmittedIssues);
      this.navToNextView();
    }, error => {

      // If an error occurs, show alert and go to the main view
      if (error.message === Config.TIMEOUT_MESSAGE) {
        showAlert(transError.serviceNotAvailableErrorTitle,
          transError.serviceNotAvailableErrorMessage, transError.serviceNotAvailableErrorButton);
        this.navToNextView();
      } else {
        showAlert(transError.networkErrorTitle, transError.networkErrorMessage,
          transError.networkErrorButton);
        this.navToNextView();
      }
    });
  }

  navToNextView() {
    try {
      AsyncStorage.getItem(Config.STORAGE_IS_FIRST_TIME).then((v) => {
        this.props.navigator.resetTo({
          id: v !== null ? 'MainView' : 'IntroductionView',
          issues: this.issues,
        });
      });
    } catch(error) {

      // If an error occures with AsyncStorage just go to the main view
      this.props.navigator.resetTo({
        id: 'MainView',
        issues: this.issues,
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          source={splashImage}
          style={styles.splashImage}/>
        <View style={styles.spinnerContainer}>
          <Spinner color={'white'} visible={true} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: 50,
    left: Dimensions.get('window').width / 2 - 25,
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

module.exports = SplashScreen
