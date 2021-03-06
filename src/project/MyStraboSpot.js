import React, {useState} from 'react';
import {Text, View} from 'react-native';

import ProjectList from './ProjectList';
import ProjectTypesButtons from './ProjectTypesButtons';
import Spacer from '../shared/ui/Spacer';
import UserProfile from '../components/user/UserProfile';
import ActiveProjectList from './ActiveProjectList';
import Divider from '../components/settings-panel/HomePanelDivider';

const MyStraboSpot = props => {
  const [showSection, setShowSection] = useState('none');

  return (
    <React.Fragment>
      {showSection === 'none' ?
        <View style={{padding: 10}}>
          <UserProfile/>
          <Spacer/>
          <ProjectTypesButtons
            onLoadProjectsFromServer={() => setShowSection('serverProjects')}
            onStartNewProject={() => setShowSection('newProject')}/>
        </View> :
        showSection === 'serverProjects' ?
          <View style={{paddingTop: 20, height: 600}}>
            <UserProfile/>

            <Divider sectionText={'Project List'}/>
            <ProjectList/>
          </View>
           : <Text>Need fields for a new project here.</Text>}
      <View>
        <Divider sectionText={'Active project'}/>
        <ActiveProjectList/>
      </View>
    </React.Fragment>
  );
};

export default MyStraboSpot;
