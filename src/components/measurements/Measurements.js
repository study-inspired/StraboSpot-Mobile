import React, {useState} from 'react';
import {FlatList, ScrollView, View} from 'react-native';
import {connect} from 'react-redux';
import {Button} from "react-native-elements";
import {notebookReducers, NotebookPages} from "../notebook-panel/Notebook.constants";
import ReturnToOverviewButton from '../notebook-panel/ui/ReturnToOverviewButton';
import SectionDivider from "../../shared/ui/SectionDivider";
import MeasurementItem from './MeasurementItem';
import {homeReducers, Modals} from "../../views/home/Home.constants";
import {formReducers} from "../form/Form.constant";

// Styles
import styles from './measurements.styles';
import * as themes from '../../shared/styles.constants';

const MeasurementsPage = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isMultiSelectMode, setMultiSelectMode] = useState(false);
  const [multiSelectModeType, setMultiSelectModeType] = useState();
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const sectionTypes = {
    PLANAR: 'Planar Measurements',
    LINEAR: 'Linear Measurements',
    PLANARLINEAR: 'Planar + Linear Measurements'
  };

  const getSectionData = (sectionType) => {
    if (sectionType === sectionTypes.PLANAR) {
      return props.spot.properties.orientation_data.filter(measurement => {
        return (measurement.type === 'planar_orientation' || measurement.type === 'tabular_orientation') && !measurement.associated_orientation
      });
    }
    else if (sectionType === sectionTypes.LINEAR) {
      return props.spot.properties.orientation_data.filter(measurement => {
        return measurement.type === 'linear_orientation' && !measurement.associated_orientation
      });
    }
    else if (sectionType === sectionTypes.PLANARLINEAR) {
      return props.spot.properties.orientation_data.filter(measurement => {
        return (measurement.type === 'planar_orientation' || measurement.type === 'linear_orientation' || measurement.type === 'tabular_orientation') && measurement.associated_orientation
      });
    }
  };

  const getIdsOfSelected = () => {
    return selectedFeatures.map(value => value.id);
  };

  const onMeasurementPressed = (item, type) => {
    if (!isMultiSelectMode) viewMeasurementDetail(item);
    else {
      if (type === multiSelectModeType) {
        const i = selectedFeatures.find(selectedFeature => selectedFeature.id === item.id);
        if (i) setSelectedFeatures(selectedFeatures.filter(selectedFeature => selectedFeature.id !== item.id));
        else setSelectedFeatures([...selectedFeatures, item]);
        console.log('Adding selected feature to identify group ...');
      }
      else {
        console.log('Mismatched type');
      }
    }
  };

  const viewMeasurementDetail = (item) => {
    props.setFormData(item);
    props.setNotebookPanelVisible(true);
    props.setNotebookPageVisible(NotebookPages.MEASUREMENTDETAIL);
  };


  const identifyAll = (type) => {
    const data = getSectionData(type);
    setMultiSelectMode(false);
    console.log(data);
  };

  const startSelecting = (type) => {
    console.log('Start Selecting for', type, ' ...');
    setSelectedFeatures([]);
    setMultiSelectMode(true);
    setMultiSelectModeType(type);
  };

  const cancelSelecting = () => {
    setSelectedFeatures([]);
    setMultiSelectMode(false);
  };

  const endSelecting = () => {
    console.log('Identify Selected:', selectedFeatures);
  };

  const renderMeasurements = (type) => {
    const data = getSectionData(type);
    const selectedIds = getIdsOfSelected();
    return (
      <View>
        <FlatList
          data={data}
          renderItem={item => <MeasurementItem item={item}
                                               selectedIds={selectedIds}
                                               onPress={() => onMeasurementPressed(item.item, type)}/>}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  const renderSectionDivider = (dividerText) => {
    return (
      <View style={((isMultiSelectMode && dividerText === multiSelectModeType) || !isMultiSelectMode) ?
        styles.measurementsSectionDividerWithButtonsContainer : styles.measurementsSectionDividerContainer}>
        <View style={styles.measurementsSectionDividerTextContainer}>
          <SectionDivider dividerText={dividerText}/>
        </View>
        <View style={styles.measurementsSectionDividerButtonContainer}>
          {isMultiSelectMode && dividerText === multiSelectModeType &&
          <Button
            titleStyle={styles.measurementsSectionDividerButtonText}
            title={'Cancel'}
            type={'clear'}
            onPress={() => cancelSelecting()}
          />}
          {isMultiSelectMode && selectedFeatures.length >= 1 && dividerText === multiSelectModeType &&
          <Button
            titleStyle={styles.measurementsSectionDividerButtonText}
            title={'Identify Selected'}
            type={'clear'}
            onPress={() => endSelecting()}
          />}
          {!isMultiSelectMode &&
          <React.Fragment>
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Add'}
              type={'clear'}
              onPress={() => props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)}
            />
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Identify All'}
              type={'clear'}
              onPress={() => identifyAll(dividerText)}
            />
            <Button
              titleStyle={styles.measurementsSectionDividerButtonText}
              title={'Select'}
              type={'clear'}
              onPress={() => startSelecting(dividerText)}
            />
          </React.Fragment>}
        </View>
      </View>
    );
  };

  const renderSectionDividerShortcutView = (dividerText) => {
    return (
      <View style={styles.measurementsSectionDividerContainer}>
        <SectionDivider dividerText={dividerText}/>
      </View>
    )
  };

  const renderMeasurementsNotebookView = () => {
    return (
      <View style={styles.measurementsContentContainer}>
        <ReturnToOverviewButton
          onPress={() => {
            props.setNotebookPageVisible(NotebookPages.OVERVIEW);
            props.setModalVisible(null);
          }}
        />
        <ScrollView>
          {renderSectionDivider(sectionTypes.PLANAR)}
          {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANAR)}
          {renderSectionDivider(sectionTypes.LINEAR)}
          {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.LINEAR)}
          {renderSectionDivider(sectionTypes.PLANARLINEAR)}
          {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANARLINEAR)}
        </ScrollView>
      </View>
    )
  };

  const renderMeasurementsShortcutView = () => {
    return (
      <View style={{backgroundColor: themes.PRIMARY_BACKGROUND_COLOR}}>
        <ScrollView>
          {renderSectionDividerShortcutView(sectionTypes.PLANAR)}
          {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANAR)}
          {renderSectionDividerShortcutView(sectionTypes.LINEAR)}
          {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.LINEAR)}
          {renderSectionDividerShortcutView(sectionTypes.PLANARLINEAR)}
          {props.spot.properties.orientation_data && renderMeasurements(sectionTypes.PLANARLINEAR)}
        </ScrollView>
      </View>
    )
  };

  return (
    <React.Fragment>
      {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? renderMeasurementsShortcutView() : renderMeasurementsNotebookView()}
    </React.Fragment>
  );
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    modalVisible: state.home.modalVisible
  }
}

const mapDispatchToProps = {
  setFormData: (formData) => ({type: formReducers.SET_FORM_DATA, formData: formData}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
};

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementsPage);
