import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {ListItem} from 'react-native-elements';
import Divider from '../components/settings-panel/HomePanelDivider';
import styles from './Project.styles';
import DatasetList from './DatasetList';
import ActiveDatasetsList from './ActiveDatasetsList';
import {isEmpty} from '../shared/Helpers';

const ActiveProjectPanel = (props) => {
  const [activeDatasets, setActiveDatasets] = useState(null);
  const project = useSelector(state => state.project.project);
  const projectDatasets = useSelector(state => state.project.projectDatasets);
  const dispatch = useDispatch();

  useEffect(() => {
    const filteredDatasets = projectDatasets.filter(dataset => dataset.active === true);
    setActiveDatasets(filteredDatasets);
  }, [projectDatasets]);

  return (
    <React.Fragment>
      <ListItem
        title={project ? project.description.project_name : 'No Project'}
        containerStyle={styles.activeProjectButton}
        chevron
        onPress={props.onPress}
      />
      <Divider sectionText={'PROJECT DATASETS'}/>
      <View style={styles.datasetsContainer}>
      <DatasetList/>
      </View>
      <Divider sectionText={'CURRENT DATASETS'}/>
      <View style={[styles.datasetsContainer, {height: 200}]}>
        {!isEmpty(activeDatasets) ? <ActiveDatasetsList/> : null}
      </View>
    </React.Fragment>
  );
};

export default ActiveProjectPanel;