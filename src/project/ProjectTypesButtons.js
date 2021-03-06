import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {Button} from 'react-native-elements';

// Styles
import commonStyles from '../shared/common.styles';
import {isEmpty} from '../shared/Helpers';

const ProjectTypesButtons = (props) => {
  const isOnline = useSelector(state => state.home.isOnline);
  const user = useSelector(state => state.user);

  return (
    <View>
      <Button
        title={'Start a New Project'}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onStartNewProject()}
      />
      {isOnline && !isEmpty(user) && <Button
        title={'Load a Project from Server'}
        buttonStyle={commonStyles.standardButton}
        titleStyle={commonStyles.standardButtonText}
        onPress={() => props.onLoadProjectsFromServer()}
      />}
    </View>
  );
};

export default ProjectTypesButtons;
