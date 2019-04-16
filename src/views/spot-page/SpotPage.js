import React from 'react'
import {
  ActivityIndicator,
  View,
  StyleSheet, Alert,
} from 'react-native'
import {Header} from 'react-native-elements';
import Aux from '../../shared/AuxWrapper';
import {connect} from 'react-redux';
import {Navigation} from 'react-native-navigation/lib/dist/index';
import ButtonNoBackground from '../../ui/ButtonNoBackround';
import Loading from '../../ui/Loading';

class SpotPage extends React.Component {
  _isMounted = false;

  state = {
    selectedSpot: null,
    animating: true
  };

  async componentDidMount() {
    this._isMounted = true;
    console.log('SpotPage Mounted', this.props.featureCollectionSelected)
      const spotData = await this.props.featureCollectionSelected.features.map(spot => {
        return {
          name: spot.properties.name,
          id: spot.properties.id
        };
      })
    this.setState({selectedSpot: spotData}, () => console.log(this.state.selectedSpot))
  }

  componentWillUnmount() {
    console.log('SpotPage Unmounted');
    this._isMounted = false;
  }

  closeLoading = () => setTimeout(() => {
    Alert.alert('Something Went Wrong!', 'Please go back')
    this.setState({animating: false})
  }, 5000);

  render() {
    const animating = this.state.animating;

  let header = (
    <Aux>
      <Header
        backgroundColor={'lightgrey'}
        centerComponent={{text: 'No Spot Found', style: {color: 'black', fontSize: 25}}}
      >
        <ButtonNoBackground onPress={() => Navigation.pop(this.props.componentId)}>Home</ButtonNoBackground>
    </Header>
    <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
      <Loading animating={animating}/>
    </View>
    </Aux>);

  if (this.state.selectedSpot) {
    header = (
      <Header
        backgroundColor={'lightgrey'}
        centerComponent={{text: this.state.selectedSpot ? this.state.selectedSpot[0].name : 'No Spot Found', style: {color: 'black', fontSize: 25}}}
      >
        <ButtonNoBackground onPress={() => Navigation.pop(this.props.componentId)}>Home</ButtonNoBackground>
      </Header>
    )
  }
    return (
      <View style={styles.container}>
        {header}
        {/*<View>*/}
        {/*  <TextInput value={this.state.selectedSpot} onChange={(text) => this.setState({selectedSpot: {name: text}})}/>*/}
        {/*</View>*/}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center'
  }
});

function mapStateToProps(state) {
  return {
    // selectedSpot: state.currentSpot,
    featureCollectionSelected: state.home.featureCollectionSelected
  }
}

export default connect(mapStateToProps)(SpotPage);