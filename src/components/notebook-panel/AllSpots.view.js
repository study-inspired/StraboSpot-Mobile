import React from 'react';
import {connect} from 'react-redux';
import {ScrollView} from 'react-native';

import {ListItem} from 'react-native-elements';
import {spotReducers} from '../../spots/Spot.constants';

import * as themes from '../../shared/styles.constants';

const allSpotsView = (props) => {

  const pressHandler = (id) => {
    const spot = Object.values(props.spots).find(selectedSpot => {
      return selectedSpot.properties.id === id;
    });
    console.log('Switch Selected Spot', spot);
    props.onSetSelectedSpot(spot);
  };

  return (
    <React.Fragment>
      <ScrollView>
        {Object.values(props.spots).map(spot => {
          return (
            <ListItem
              key={spot.properties.id}
              title={spot.properties.name}
              titleStyle={{fontSize: 14}}
              subtitle={spot.geometry.type}
              subtitleStyle={{fontSize: 12}}
              containerStyle={{paddingTop: 5}}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: themes.LIGHTGREY,
                padding: 10,
                paddingTop: 20,
                paddingBottom: 20,
              }}
              onPress={() => pressHandler(spot.properties.id)}
            />
          );
        })}
      </ScrollView>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    spots: state.spot.spots,
  };
};

const mapDispatchToProps = {
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
};

export default connect(mapStateToProps, mapDispatchToProps)(allSpotsView);
