import React, {Component} from 'react'
import {View, StyleSheet, Text} from 'react-native'
// import {getUserProfile} from '../services/user/UserProfile';
import { Avatar } from 'react-native-elements';
import * as themes from "../../shared/styles.constants";

class UserProfileComponent extends Component {
constructor(props) {
  super(props);
  this.state ={
    username: '',
    userImage: '',
    MB_Token: ''
  }
}

  user = async (username) => {
    const baseUrl = 'https://strabospot.org/db';

    const userProfileBaseUrl = baseUrl + '/profile';
    console.log(userProfileBaseUrl);
    try {
      let response = await fetch(userProfileBaseUrl + '/profile');
      console.log(response);
    }
    catch (e) {
      console.log("Error", e)
    }
  };

  render () {
  return (
    <React.Fragment>
      <View style={styles.container}>

      <View style={styles.avatar}>
        <Avatar
          containerStyle={styles.avatarImage}
          source={require('../../assets/images/Chuck-norris.jpg')}
          showEditButton={false}
          rounded={true}
          size={65}
          onPress={() => console.log('Avatar Pressed')}
        />
        <Text style={styles.avatarLabel}>Chuck Norris</Text>
      </View>
        <View style={styles.projectName}>
            <Text style={styles.projectNameText}>Project</Text>
        </View>
    {/*<Button*/}
      {/*title={"User"}*/}
      {/*onPress={this.user}*/}
    {/*/>*/}
      {/*</View>*/}
      </View>
    </React.Fragment>
  )
}
}

const styles = StyleSheet.create({
  buttons: {
    // alignItems: 'flex-end',

  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'flex-start'
  },
  profileButtons: {
    marginTop: 0
  },
  userButton: {
    alignItems: 'flex-end',
    marginTop: 10,
    paddingLeft: 25
  },
  avatar: {
    // flex:1,
    marginTop: 20,
    marginLeft: 0
  },
  avatarImage: {
    marginLeft: 30,
  },
  avatarLabel: {
    paddingTop: 5,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
    marginLeft: 10
  },
  projectName: {
    paddingTop: 15,
    marginLeft: 30,
    // flex: 2,
    // alignContent: 'center',
    // justifyContent: 'center'
  },
  projectNameText: {
    fontSize: themes.PRIMARY_TEXT_SIZE
  }
});

export default UserProfileComponent;
