import React, {useState} from 'react'
import {Animated, Easing, Text, View} from 'react-native'
import {connect} from 'react-redux';
import NotebookHeader from './notebook-header/NotebookHeader';
import NotebookFooter from './notebook-footer/NotebookFooter';
import Overview from './Overview';
import * as SharedUI from '../../shared/ui/index'
import MeasurementsPage from '../measurements/Measurements';
import MeasurementDetailPage from '../measurements/MeasurementDetail';
import NotesPage from '../notes/Notes.view';
import SamplesPage from '../samples/SamplesNotebook.view';
import SampleDetailsPage from '../samples/SampleDetail';
import {notebookReducers, NotebookPages} from "./Notebook.constants";
import {homeReducers, Modals} from "../../views/home/Home.constants";
import {isEmpty} from "../../shared/Helpers";
import {FlingGestureHandler, Directions, State} from 'react-native-gesture-handler'
// import {openAllSpotsPanelFromMenu, closeAllSpotsPanelFromMenu, animatePanels} from '../../shared/Helpers';

// Styles
import notebookStyles from "./NotebookPanel.styles";
import * as themes from '../../shared/styles.constants';
import AllSpotsView from "./AllSpots.view";

const NotebookPanel = props => {

  // const [animation, setAnimation] = useState(new Animated.Value(250));


  const setNotebookPageVisible = page => {
    const pageVisible = props.setNotebookPageVisible(page);
    if (pageVisible.page === NotebookPages.MEASUREMENT || pageVisible === NotebookPages.MEASUREMENTDETAIL) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.COMPASS)
    }
    else if (pageVisible.page === NotebookPages.SAMPLE) {
      props.setModalVisible(Modals.NOTEBOOK_MODALS.SAMPLE)
    }
    else props.setModalVisible(null);
  };

  const _onRightFlingHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      props.setAllSpotsPanelVisible(false);
      // animatePanels(animation, 250)
    }
  };

  const _onLeftFlingHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      props.setAllSpotsPanelVisible(true);
      // animatePanels(animation, 125)
    }
  };

  // const animateAllSpotsMenu = {
  //   transform: [
  //     {translateX: animation}
  //   ],
  // };

  if (!isEmpty(props.spot)) {
    // console.log('Selected Spot:', props.spot);

    const allSpotsPanel = <View style={[notebookStyles.allSpotsPanel,]}>
      <AllSpotsView />
    </View>;

    return (

        <FlingGestureHandler
          direction={Directions.RIGHT}
          numberOfPointers={2}
          onHandlerStateChange={(ev) => _onRightFlingHandlerStateChange(ev)}
        >
          <FlingGestureHandler
            direction={Directions.LEFT}
            numberOfPointers={2}
            onHandlerStateChange={(ev) => _onLeftFlingHandlerStateChange(ev)}
          >
            <Animated.View
              // style={props.isAllSpotsPanelVisible ? [notebookStyles.panel, {marginRight: 125}] : notebookStyles.panel}
              style={notebookStyles.panel}
            >
              <View style={props.isAllSpotsPanelVisible ? [notebookStyles.headerContainer, {marginRight: 125}] : notebookStyles.headerContainer}>
                <NotebookHeader
                  onPress={props.onPress}
                />
              </View>
              <View style={props.isAllSpotsPanelVisible ? [notebookStyles.centerContainer, {paddingRight: 125}] : notebookStyles.centerContainer}>
                {props.notebookPageVisible === NotebookPages.OVERVIEW ||
                  props.notebookPageVisible === undefined ? <Overview/> : null}
                {props.notebookPageVisible === NotebookPages.MEASUREMENT ? <MeasurementsPage/> : null}
                {props.notebookPageVisible === NotebookPages.MEASUREMENTDETAIL ? <MeasurementDetailPage/> : null}
                {props.notebookPageVisible === NotebookPages.NOTE ? <NotesPage/> : null}
                {props.notebookPageVisible === NotebookPages.SAMPLE ? <SamplesPage/> : null}
                {props.notebookPageVisible === NotebookPages.SAMPLE_DETAIL ? <SampleDetailsPage/> : null}
              </View>
              <View  style={props.isAllSpotsPanelVisible ? [notebookStyles.footerContainer, {marginRight: 125}] :
                notebookStyles.footerContainer}>
                <NotebookFooter
                  openPage={(page) => setNotebookPageVisible(page)}
                  onPress={(camera) => props.onPress(camera)}
                />
              </View>
              {/*{props.isAllSpotsPanelVisible ? allSpotsPanel : null}*/}
              {props.isAllSpotsPanelVisible ? allSpotsPanel : null}
            </Animated.View>
          </FlingGestureHandler>
        </FlingGestureHandler>
    )
  }
  else {
    props.setModalVisible(null);
    return (
      <View style={[notebookStyles.panel, notebookStyles.noSpotContent]}>
        <Text style={{fontSize: 30}}>No Spot Selected</Text>
        <SharedUI.ButtonNoBackground
          style={{marginTop: 40}}
          textStyle={{color: themes.PRIMARY_ACCENT_COLOR}}
          onPress={props.closeNotebook}>Close Notebook</SharedUI.ButtonNoBackground>
      </View>
    )
  }
};

function mapStateToProps(state) {
  return {
    spot: state.spot.selectedSpot,
    featuresSelected: state.spot.featuresSelected,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible,
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack) ?
      null : state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  }
}

const mapDispatchToProps = {
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setAllSpotsPanelVisible: (value) => ({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value}),
};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookPanel);
