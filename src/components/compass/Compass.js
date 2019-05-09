import RNSimpleCompass from 'react-native-simple-compass';


const degree_update_rate = 2; // Number of degrees changed before the callback is triggered


import React, {Component} from 'react';
import {Image, View, Text, Dimensions} from 'react-native';
import {Grid, Col, Row} from 'react-native-easy-grid';
import {setUpdateIntervalForType, SensorTypes, magnetometer, accelerometer} from 'react-native-sensors';
import {mod, toRadians, toDegrees, roundToDecimalPlaces} from "../../shared/Helpers";
import {CompassToggleButtons} from "./Compass.constants";
import {ListItem} from "react-native-elements";
import {Switch} from "react-native-switch";

import styles from './CompassStyles';

const {height, width} = Dimensions.get('window');

export default class Compass extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    setUpdateIntervalForType(SensorTypes.magnetometer, 100);

    this.state = {
      magnetometer: 0,
      accelerometer: {
        x: 0,
        y: 0,
        z: 0,
        timestamp: null
      },
      subscriptions: {
        accelerometer: null
      },
      compassData: {
        strike: null,
        dip: null,
        dipdir: null,
        trend: null,
        plunge: null,
        rake: null,
        rake_calculated: 'no'
      },
      toggles: [CompassToggleButtons.PLANAR]
    };
  }

  // componentWillMount() {
  //   ScreenOrientation.allow(ScreenOrientation.Orientation.PORTRAIT_UP);
  // };

  componentDidMount() {
    this._isMounted = true;
    this.subscribe();
    RNSimpleCompass.start(degree_update_rate, (degree) => {
      console.log('You are facing', degree);
      this.setState(prevState => {
        return {
          ...prevState,
          magnetometer: degree
        }
      }, /*) => console.log('magnetometer reading:', this.state.magnetometer)*/);
      // RNSimpleCompass.stop();
    });
  };

  componentWillUnmount() {
    this.unsubscribe();
    RNSimpleCompass.stop();
    console.log('Compass unsubscribed');
    this._isMounted = false;
  };

  grabMeasurements = () => {
    let measurements = {};
    if (this.state.toggles.includes(CompassToggleButtons.PLANAR)) {
      measurements.strike = this.state.compassData.strike;
      measurements.dipdir = this.state.compassData.dipdir;
      measurements.dip = this.state.compassData.dip;
    }
    if (this.state.toggles.includes(CompassToggleButtons.LINEAR)) {
      measurements.trend = this.state.compassData.trend;
      measurements.plunge = this.state.compassData.plunge;
      measurements.rake = this.state.compassData.rake;
      measurements.rake_calculated = 'yes';
    }
    this.props.addMeasurement(measurements);
  };

  subscribe = async () => {
    let angle = null;
    this._subscription = accelerometer.subscribe((data) => {
      // console.log(data);
      // angle = this._angle(data);
      this.setState(prevState => {
          return {
            ...prevState,
            accelerometer: {...data}
          }
        },
        () => {
          //console.log('Accelerometer state:', this.state.accelerometer);
          this.calculateOrientation();
        });
    });
  };

  unsubscribe = () => {
    //   this._subscription && this._subscription.remove();
    if (this._subscription) this._subscription.unsubscribe();
    this._subscription = null;
    console.log('Unsubscribed');
  };

  /*  _angle = (magnetometer) => {
      let angle = null;
      if (magnetometer) {
        let {x, y, z} = magnetometer;

        if (Math.atan2(y, x) >= 0) {
          angle = Math.atan2(y, x) * (180 / Math.PI);
        }
        else {
          angle = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
        }
      }

      return Math.round(angle);
    };*/

  _direction = (degree) => {
    if (degree >= 22.5 && degree < 67.5) {
      return 'NE';
    }
    else if (degree >= 67.5 && degree < 112.5) {
      return 'E';
    }
    else if (degree >= 112.5 && degree < 157.5) {
      return 'SE';
    }
    else if (degree >= 157.5 && degree < 202.5) {
      return 'S';
    }
    else if (degree >= 202.5 && degree < 247.5) {
      return 'SW';
    }
    else if (degree >= 247.5 && degree < 292.5) {
      return 'W';
    }
    else if (degree >= 292.5 && degree < 337.5) {
      return 'NW';
    }
    else {
      return 'N';
    }
  };

  // Match the device top with pointer 0° degree. (By default 0° starts from the right of the device.)
  _degree = (magnetometer) => {
    return magnetometer - 90 >= 0 ? magnetometer - 90 : magnetometer + 271;
  };

  calculateOrientation = () => {
    const x = this.state.accelerometer.x;
    const y = this.state.accelerometer.y;
    const z = this.state.accelerometer.z;
    //let actualHeading = mod(vm.result.magneticHeading + vm.magneticDeclination, 360);
    let actualHeading = mod(this.state.magnetometer, 360);  // ToDo: adjust for declination

    // Calculate base values given the x, y, and z from the device. The x-axis runs side-to-side across
    // the mobile phone screen, or the laptop keyboard, and is positive towards the right side. The y-axis
    // runs front-to-back across the mobile phone screen, or the laptop keyboard, and is positive towards as
    // it moves away from you. The z-axis comes straight up out of the mobile phone screen, or the laptop
    // keyboard, and is positive as it moves up.
    // All results in this section are in radians
    let g = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    let s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    let B = Math.acos(Math.abs(y) / s);
    let R = toRadians(90 - toDegrees(B));
    let d = Math.acos(Math.abs(z) / g);
    let b = Math.atan(Math.tan(R) * Math.cos(d));

    // Calculate dip direction, strike and dip (in degrees)
    let dipdir, strike, dip;
    let diry = actualHeading;
    if (x === 0 && y === 0) {
      d = 0;
      dipdir = 180;
    }
    else if (x >= 0 && y >= 0) dipdir = diry - 90 - toDegrees(b);
    else if (y <= 0 && x >= 0) dipdir = diry - 90 + toDegrees(b);
    else if (y <= 0 && x <= 0) dipdir = diry + 90 - toDegrees(b);
    else if (x <= 0 && y >= 0) dipdir = diry + 90 + toDegrees(b);
    dipdir = mod(dipdir, 360);
    strike = mod(dipdir - 90, 360);
    dip = toDegrees(d);

    // Calculate trend, plunge and rake (in degrees)
    let trend, plunge, rake;
    if (y > 0) trend = mod(diry + 180, 360);
    if (y <= 0) trend = diry;
    plunge = toDegrees(Math.asin(Math.abs(y) / g));
    rake = toDegrees(R);

    this.setState(prevState => {
        return {
          ...prevState,
          compassData: {
            strike: roundToDecimalPlaces(strike, 0),
            dipdir: roundToDecimalPlaces(dipdir, 0),
            dip: roundToDecimalPlaces(dip, 0),
            trend: roundToDecimalPlaces(trend, 0),
            plunge: roundToDecimalPlaces(plunge, 0),
            rake: roundToDecimalPlaces(rake, 0),
            rake_calculated: 'yes'
          }
        }
      },
      /*() => console.log('Calculated Data:', this.state.compassData)*/);
  };

  // Render the compass
  renderCompass = () => {
    return (
      <View style={{alignItems: 'center', flex: 1, paddingTop: 70}}>
        <Image source={require("../../assets/images/compass/compass.png")} style={{
          height: 250,
          justifyContent: 'center',
          alignItems: 'center',
          resizeMode: 'contain',
          transform: [{rotate: -this.state.magnetometer + 'deg'}]
        }}/>
        {'dip' in this.state.compassData ? this.renderStrikeDipSymbol() : null}
      </View>
    );
  };

  // Render magnetometer heading, x, y, z from accelerometer and calculated measurements
  renderMeasurements = () => {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <Text>heading: {this.state.magnetometer}</Text>
        <Text>x: {this.state.accelerometer.x}</Text>
        <Text>y: {this.state.accelerometer.y}</Text>
        <Text>z: {this.state.accelerometer.z}</Text>{
        Object.keys(this.state.compassData).map((key) => (
          <Text>{key}: {this.state.compassData[key]}</Text>
        ))}
      </View>
    );
  };

  // Render the strike and dip symbol inside the compass
  renderStrikeDipSymbol = () => {
    return (
      <Image source={require("../../assets/images/compass/StrikeDip.png")} style={{
        height: 150,
        position: 'absolute',
        top: 120,
        // justifyContent: 'center',
        // alignItems: 'center',
        resizeMode: 'contain',
        transform: [{rotate: 90 - this.state.compassData.dip + 'deg'}]
      }}/>
    );
  };

  renderToggles = () => {
    return (
      Object.keys(CompassToggleButtons).map((key, i) => (
        <ListItem
          containerStyle={{backgroundColor: 'transparent', padding: 0}}
          key={key}
          title={
            <View style={styles.itemContainer}>
              <Text style={styles.itemTextStyle}>{CompassToggleButtons[key]}</Text>
              <View style={styles.switch}>
                <Switch
                  style={{justifyContent: 'flex-end'}}
                  value={this.state.toggles.includes(CompassToggleButtons[key])}
                  onValueChange={(val) => this.toggleSwitch(CompassToggleButtons[key])}
                  circleSize={25}
                  barHeight={20}
                  circleBorderWidth={3}
                  backgroundActive={'#407ad9'}
                  backgroundInactive={'gray'}
                  circleActiveColor={'#000000'}
                  circleInActiveColor={'#000000'}
                  changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                  innerCircleStyle={{
                    alignItems: "center",
                    justifyContent: "center"
                  }} // style for inner animated circle for what you (may) be rendering inside the circle
                />
              </View>
            </View>}
        />
      ))
    );
  };

  toggleSwitch = (switchType) => {
    const has = this.state.toggles.includes(switchType);
    this.setState(prevState => {
      return {
        ...prevState,
        toggles: has ? prevState.toggles.filter(i => i !== switchType) : prevState.toggles.concat(switchType)
      }
    }, () => console.log('toggles', this.state.toggles));
  };

  render() {

    return (

      <View style={{zIndex: 0}}>
        <View>
          <Text style={{
            color: '#fff',
            fontSize: height / 29,
            width: width,
            position: 'absolute',
            textAlign: 'center',
            paddingRight: 200
          }}>
            {this._degree(this.state.magnetometer).toFixed(2)}°
          </Text>
        </View>
        <Grid style={{backgroundColor: 'transparent', width: 500, height: 300}}>

          <Col>
            <Row style={{alignItems: 'center', flex: 0}} size={.5}>
              <Col style={{alignItems: 'center'}}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: height / 26,
                    fontWeight: 'bold'
                  }}>{this._direction(this._degree(this.state.magnetometer))}
                </Text>
              </Col>
            </Row>

            <Row style={{alignItems: 'center'}} size={.1}>
              <Col style={{alignItems: 'center'}}>
                <View style={{position: 'absolute', width: width, alignItems: 'center', top: 0}}>
                  <Image source={require('../../assets/images/compass/compass_pointer.png')} style={{
                    height: height / 26,
                    resizeMode: 'contain'
                  }}/>
                </View>
              </Col>
            </Row>

            <Row style={{alignItems: 'center'}} size={4} onPress={() => this.grabMeasurements()}>
              {this.renderCompass()}
            </Row>
          </Col>
          <Col>
            <Row style={{flexDirection: 'column'}}>
              {this.renderToggles()}
            </Row>
            <Row style={{flexDirection: 'column'}}>
              {this.renderMeasurements()}
            </Row>
          </Col>

        </Grid>
      </View>
    );
  };
}
