import React, {Component} from 'react'
import {View, Text} from 'react-native'
import {Button} from "react-native-elements";
import {connect} from 'react-redux';
// import {getUserProfile} from '../services/user/UserProfile';
import {Avatar} from 'react-native-elements';
import styles from './SettingsPanelStyles';

class UserProfileComponent extends Component {
constructor(props) {
  super(props);
  this.state ={
    username: '',
    userImage: '',
    MB_Token: ''
  }
}

  render() {
  let avatarImage = null;
  if (this.props.userData.image) {
    avatarImage = (
      <Avatar
        // containerStyle={styles.avatarImage}
        source={{uri: this.props.userData.image}}
        showEditButton={false}
        rounded={true}
        size={70}
        onPress={() => console.log(this.props.userData.name)}
      />
    )
  } else {
    avatarImage = (
      <Avatar
        // containerStyle={styles.avatarImage}
        icon={{name: 'user', type: 'font-awesome'}}
        showEditButton={false}
        rounded={true}
        size={70}
        onPress={() => console.log('GUEST')}
      />
    )
  }
    return (
      <React.Fragment>
        <View style={styles.profileContainer}>
          <View style={styles.profileNameAndImageContainer}>
            <View style={styles.avatarImageContainer}>
              {avatarImage}
            </View>
            <View style={styles.avatarLabelContainer}>
              <Text style={styles.avatarLabel}>{this.props.userData.name ? this.props.userData.name
              : 'Guest'}</Text>
            </View>
          </View>
          <View style={styles.projectName}>
            <Text style={styles.projectNameText}>Project</Text>
            <Button
              title={'Switch Projects'}
              type={'clear'}
              titleStyle={{fontSize: 16}}
              onPress={() => console.log('switching projects')}
            />
          </View>
        </View>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userData: state.user.userData
  }
};

export default connect(mapStateToProps)(UserProfileComponent);
