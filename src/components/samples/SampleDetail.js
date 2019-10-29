import React, {useState, useRef} from 'react';
import {connect} from 'react-redux';
import {Text, TextInput, View} from 'react-native';
import {NotebookPages, notebookReducers} from "../notebook-panel/Notebook.constants";
import {Button, Divider, Icon} from "react-native-elements";
import {Formik} from 'formik'
import {setForm} from '../../components/form/form.container';
import * as themes from "../../shared/styles.constants";
import styles from "../settings-panel/SettingsPanelStyles";
import samplesDetailsStyle from './samplesStyles/SamplesDetails.styles';
import TextInputField from "../form/TextInputField";

const SampleDetail = (props) => {

  const [sampleName, setSampleName] = useState(props.selectedSample.sample_id_name);
  const form = useRef(null);

  const renderFormFields = () => {
    console.table(props.selectedSample)
    setForm('sample')
  };

  return (
    <React.Fragment>
      <View style={samplesDetailsStyle.container}>
          <Button
            icon={
              <Icon
                name={'ios-arrow-back'}
                type={'ionicon'}
                color={'black'}
                iconStyle={samplesDetailsStyle.buttons}
                // containerStyle={{paddingRight: 0, paddingLeft: 0}}
                size={25 }
              />
            }
            containerStyle={{flex: 2, alignItems: 'flex-start', }}
            title={'Back'}
            titleStyle={{paddingBottom: 5}}
            type={'clear'}
            onPress={() => props.setNotebookPageVisible(NotebookPages.SAMPLE)}
          />
          <Text style={{flex: 4, fontWeight: 'bold', fontSize: 16}}>SAMPLES DETAIL</Text>
      </View>
      {renderFormFields()}
      {/*<Divider style={{height: 30}}>*/}
      {/*  <Text>Basic Info</Text>*/}
      {/*</Divider>*/}
      {/*<TextInput*/}
      {/*  onChangeText={(text) => setSampleName(text)}*/}
      {/*  value={sampleName}*/}
      {/*/>*/}
      {/*<Text>Sample ID {props.selectedSample.id}</Text>*/}
      {/*<Text>Sample ID {props.selectedSample.label}</Text>*/}
      {/*<Text>Sample ID {props.selectedSample.sample_description}</Text>*/}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    spot: state.spot.selectedSpot.properties,
    selectedSample: state.spot.selectedAttributes[0]
  }
};

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page})
};

export default connect(mapStateToProps, mapDispatchToProps)(SampleDetail);
