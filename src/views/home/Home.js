import React, {useEffect, useRef, useState} from 'react';
import {Alert, Animated, Dimensions, Easing, Platform, Text, View} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MapView from '../../components/maps/MapView';
import InitialProjectLoadModal from '../../project/InitialProjectLoadModal';
import MapActionsDialog from '../../components/dialog-boxes/map-actions/MapActionsDialogBox';
import MapSymbolsDialog from '../../components/dialog-boxes/map-symbols/MapSymbolsDialogBox';
import BaseMapDialog from '../../components/dialog-boxes/base-maps/BaseMapDialogBox';

// <----- Home screen Panels ----->
import AllSpotsPanel from '../../components/notebook-panel/AllSpots.view';
import NotebookPanel from '../../components/notebook-panel/NotebookPanel';
import SettingsPanel from '../../components/settings-panel/SettingsPanel';
import {MapModes} from '../../components/maps/Map.constants';
import {SettingsMenuItems} from '../../components/settings-panel/SettingsMenu.constants';
import Modal from 'react-native-modal';
import SaveMapModal from '../../components/dialog-boxes/map-actions/SaveMapsModal';
import NotebookPanelMenu from '../../components/notebook-panel/NotebookPanelMenu';
import {connect, useDispatch, useSelector} from 'react-redux';
import {NotebookPages, notebookReducers} from '../../components/notebook-panel/Notebook.constants';
import {settingPanelReducers} from '../../components/settings-panel/settingsPanel.constants';
import {spotReducers} from '../../spots/Spot.constants';
import NotebookCompassModal from '../../components/measurements/compass/NotebookCompassModal';
import ShortcutCompassModal from '../../components/measurements/compass/ShortcutCompassModal';
import NotebookSamplesModal from '../../components/samples/NotebookSamplesModal.view';
import ShortcutSamplesModal from '../../components/samples/ShortcutSamplesModal.view';
import {homeReducers, Modals} from './Home.constants';
import notebookStyles from '../../components/notebook-panel/NotebookPanel.styles';
// import Orientation from "react-native-orientation-locker";
import {Directions, FlingGestureHandler, State} from 'react-native-gesture-handler';
import LoadingSpinner from '../../shared/ui/Loading';
import ToastPopup from '../../shared/ui/Toast';
import {Button, Image} from 'react-native-elements';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import styles from './Styles';
import settingPanelStyles from '../../components/settings-panel/SettingsPanelStyles';
import vectorIcon from 'react-native-vector-icons/Ionicons';
import IconButton from '../../shared/ui/IconButton';
import VertexDrag from '../../components/maps/VertexDrag';
import {animatePanels, isEmpty} from '../../shared/Helpers';

// Hooks
import useImagesHook from '../../components/images/useImages';
import useSpotsHook from '../../spots/useSpots';
import StatusDialogBox from '../../shared/ui/StatusDialogBox';
import sharedDialogStyles from '../../shared/common.styles';
import useProjectHook from '../../project/useProject';
import {BallIndicator} from 'react-native-indicators';

const allSpotsPanelWidth = 125;
const homeMenuPanelWidth = 300;
const notebookPanelWidth = 400;

// const imageOptions = {
//   storageOptions: {
//     skipBackup: true,
//     // path: 'StraboSpot/Images',
//     takePhotoButtonTitle: 'Take Photo Buddy!',
//     chooseFromLibraryButtonTitle: 'choose photo from library'
//   }
// };

const Home = (props) => {
  const [useImages] = useImagesHook();
  const [useProject] = useProjectHook();
  const [useSpots] = useSpotsHook();
  const currentDataset = useProject.getCurrentDataset();

  let imageArr = [];
  const online = require('../../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_connected.png');
  const offline = require('../../assets/icons/StraboIcons_Oct2019/ConnectionStatusButton_offline.png');

  const dispatch = useDispatch();
  const statusMessages = useSelector(state => state.home.statusMessages);
  const isLoading = useSelector(state => state.home.loading);
  const isStatusMessagesModalVisible = useSelector(state => state.home.isStatusMessagesModalVisible);
  const isErrorMessagesModalVisible = useSelector(state => state.home.isErrorMessagesModalVisible);
  const isInfoMessagesModalVisible = useSelector(state => state.home.isInfoModalVisible);

  // const imagesCount = useSelector(state => state.home.imageProgress.imagesDownloadedCount);
  // const imagesNeeded = useSelector(state => state.home.imageProgress.neededImageIds);
  const [dialogs, setDialogs] = useState({
    mapActionsMenuVisible: false,
    mapSymbolsMenuVisible: false,
    baseMapMenuVisible: false,
    notebookPanelMenuVisible: false,
  });
  const [buttons, setButtons] = useState({
    endDrawButtonVisible: false,
    drawButtonOn: undefined,
    drawButtonsVisible: true,
    editButtonsVisible: false,
  });
  const [mapMode, setMapMode] = useState(MapModes.VIEW);
  const [isOfflineMapModalVisible, setIsOfflineMapModalVisible] = useState(false);
  const [isProjectLoadSelectionModalVisible, setIsProjectLoadSelectionModalVisible] = useState(false);
  const [allPhotosSaved, setAllPhotosSaved] = useState([]);
  const [animation, setAnimation] = useState(new Animated.Value(notebookPanelWidth));
  const [settingsPanelAnimation, setSettingsPanelAnimation] = useState(new Animated.Value(-homeMenuPanelWidth));
  const [leftsideIconAnimationValue, setLeftsideIconAnimationValue] = useState(new Animated.Value(0));
  const [rightsideIconAnimationValue, setRightsideIconAnimationValue] = useState(new Animated.Value(0));
  const [toastVisible, setToastVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const mapViewComponent = useRef(null);

  useEffect(() => {
    vectorIcon.getImageSource('pin', 30);
    NetInfo.addEventListener(state => {
      if (state.isConnected) handleConnectivityChange(state.isConnected);
      // else Alert.alert('Not Online!', 'Please check your internet source.');
    });
    // props.setDeviceDims(dimensions);
    // if (props.deviceDimensions.width < 500) {
    //   Orientation.unlockAllOrientations();
    // }
    // else Orientation.lockToLandscapeLeft();
    Dimensions.addEventListener('change', deviceOrientation);
    dispatch({type: homeReducers.SET_STATUS_BOX_LOADING, bool: false});
    props.setNotebookPanelVisible(false);
    props.setAllSpotsPanelVisible(false);
    props.setModalVisible(null);
    props.setHomePanelVisible(false);
    props.setHomePanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
    checkForOpenProject();
    return function cleanup() {
      Dimensions.removeEventListener('change', deviceOrientation);
    };
  }, []);

  const deviceOrientation = () => {
    const dimensions = Dimensions.get('window');
    props.setDeviceDims(dimensions);
    console.log(props.deviceDimensions);
  };

  const checkForOpenProject = () => {
    if (isEmpty(props.getCurrentProject)) {
      setIsProjectLoadSelectionModalVisible(true);
      console.log('Project Select Modal is:', isProjectLoadSelectionModalVisible);
    }
  };

  const cancelEdits = async () => {
    await mapViewComponent.current.cancelEdits();
    setMapMode(MapModes.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
    // toggleButton('editButtonsVisible', false);
    // toggleButton('drawButtonsVisible', true);
  };

  const clickHandler = (name, position) => {
    switch (name) {
      case 'search':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'tag':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'measurement':
       dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        props.setModalVisible(Modals.SHORTCUT_MODALS.COMPASS);
        closeNotebookPanel();
        break;
      case 'sample':
        dispatch({type: spotReducers.CLEAR_SELECTED_SPOTS});
        props.setModalVisible(Modals.SHORTCUT_MODALS.SAMPLE);
        closeNotebookPanel();
        break;
      case 'note':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'photo':
        // useImages.takePicture();
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      case 'sketch':
        Alert.alert('Still in the works',
          `The ${name.toUpperCase()} Shortcut button in the  will be functioning soon!`);
        break;
      // case "notebook":
      //   console.log(`${name}`, " was clicked");
      //   break;
      case 'home':
        toggleHomeDrawerButton();
        break;

      // Notebook Panel three-dot menu
      case 'closeNotebook':
        closeNotebookPanel();
        break;
      case 'copyFeature':
        console.log('Spot Copied!');
        break;
      case 'deleteSpot':
        deleteSpot(props.selectedSpot.properties.id);
        break;
      case 'toggleAllSpotsPanel':
        if (position === 'open') props.setAllSpotsPanelVisible(true);
        else if (position === 'close') props.setAllSpotsPanelVisible(false);
        break;
      // Map Actions
      case MapModes.DRAW.POINT:
      case MapModes.DRAW.LINE:
      case MapModes.DRAW.POLYGON:
        if (!isEmpty(currentDataset)) setDraw(name);
        else Alert.alert('No Current Dataset', 'A current dataset needs to be set before drawing Spots.');
        break;
      case 'endDraw':
        endDraw();
        break;
      case 'cancelEdits':
        cancelEdits();
        break;
      case 'saveEdits':
        saveEdits();
        break;
      case 'currentLocation':
        goToCurrentLocation();
        break;

      // Map Actions
      case 'zoom':
        console.log(`${name}`, ' was clicked');
        break;
      case 'saveMap':
        toggleOfflineMapModal();
        break;
      case 'addTag':
        Alert.alert('Still in the works', `The ${name.toUpperCase()} button in the  will be functioning soon!`);
        break;
      case 'stereonet':
        console.log(`${name}`, ' was clicked');
        break;

      // Map Basemap Layers
      case 'mapboxSatellite':
        newBasemapDisplay(name);
        break;
      case 'mapboxOutdoors':
        newBasemapDisplay(name);
        break;
      case 'osm':
        newBasemapDisplay(name);
        break;
      case 'macrostrat':
        newBasemapDisplay(name);
        break;
      case 'custom':
        newBasemapDisplay(name);
        break;
    }
  };

  const goToCurrentLocation = async () => {
    toggleLoading(true);
    try {
      await mapViewComponent.current.setCurrentLocation();
      toggleLoading(false);
      await mapViewComponent.current.goToCurrentLocation();
    }
    catch {
      toggleLoading(false);
      Alert.alert('Geolocation Error', 'Error getting current location.');
    }
  };

  const flingHandlerSettingsPanel = ({nativeEvent}) => {
    if (props.homePanelVisible) {
      if (nativeEvent.oldState === State.ACTIVE) {
        console.log('FLING TO CLOSE Settings Panel!', nativeEvent);
        animatePanels(settingsPanelAnimation, -homeMenuPanelWidth);
        props.setHomePanelPageVisible(SettingsMenuItems.SETTINGS_MAIN);
        props.setHomePanelVisible(false);
        animatePanels(leftsideIconAnimationValue, 0);
      }
    }
    else props.setHomePanelVisible(true);
  };

  const flingHandlerNotebook = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      console.log('FLING TO CLOSE NOTEBOOK!', nativeEvent);
      animatePanels(animation, notebookPanelWidth);
      animatePanels(rightsideIconAnimationValue, 0);
      props.setNotebookPanelVisible(false);
      props.setAllSpotsPanelVisible(false);
    }
  };

  const closeNotebookPanel = () => {
    console.log('closing notebook');
    animatePanels(animation, notebookPanelWidth);
    animatePanels(rightsideIconAnimationValue, 0);
    props.setNotebookPanelVisible(false);
    props.setAllSpotsPanelVisible(false);
  };

  const deleteSpot = id => {
    const spot = props.spots[id];
    Alert.alert(
      'Delete Spot?',
      'Are you sure you want to delete Spot: ' + spot.properties.name,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            useSpots.deleteSpot(id)
              .then((res) => {
                console.log(res)
                closeNotebookPanel();
              });
          },
        },
      ],
    );
  };

  const dialogClickHandler = (dialog, name, position) => {
    clickHandler(name, position);
    toggleDialog(dialog);
  };

  const endDraw = async () => {
    const newOrEditedSpot = await mapViewComponent.current.endDraw();
    setMapMode(MapModes.VIEW);
    toggleButton('endDrawButtonVisible');
    if (!isEmpty(newOrEditedSpot)) {
      openNotebookPanel(NotebookPages.OVERVIEW);
      props.setModalVisible(null);
    }
  };

  //function for online/offline state change event handler
  const handleConnectivityChange = isConnected => {
    props.setIsOnline(isConnected);
  };

  const newBasemapDisplay = name => {
    mapViewComponent.current.changeMap(name);
  };

  const notebookClickHandler = name => {
    switch (name) {
      case 'menu':
        toggleDialog('notebookPanelMenuVisible');
        break;
      case 'export':
        console.log('Export button was pressed');
        break;
      case 'camera':
        launchCameraFromNotebook();
        break;
    }
  };

  const toggleHomeDrawerButton = () => {
    if (props.homePanelVisible) {
      props.setHomePanelVisible(false);
      animatePanels(settingsPanelAnimation, -homeMenuPanelWidth);
      animatePanels(leftsideIconAnimationValue, 0);
    }
    else {
      props.setHomePanelVisible(true);
      animatePanels(settingsPanelAnimation, 0);
      animatePanels(leftsideIconAnimationValue, homeMenuPanelWidth);
    }
  };

  const openNotebookPanel = pageView => {
    console.log('notebook opening', pageView);
    props.setNotebookPageVisible(pageView);
    animatePanels(animation, 0);
    animatePanels(rightsideIconAnimationValue, -notebookPanelWidth);
    props.setNotebookPanelVisible(true);
  };

  const launchCameraFromNotebook = async () => {
    try {
      const savedPhoto = await useImages.takePicture();
      const photoProperties = {
        id: savedPhoto.id,
        src: savedPhoto.src,
        image_type: 'photo',
        height: savedPhoto.height,
        width: savedPhoto.width,
      };
      toggleLoading(true);
      if (savedPhoto === 'cancelled') {
        if (imageArr.length > 0) {
          console.log('ALL PHOTOS SAVED', imageArr);
          props.onSpotEditImageObj(imageArr);
          toggleLoading(false);
          // toggleToast();
        }
        else {
          toggleLoading(false);
          Alert.alert('No Photos To Save', 'please try again...');
        }
      }
      else {
        // setAllPhotosSaved(oldArray => ([...oldArray, photoProperties]));
        imageArr.push(photoProperties);
        console.log('Photos Saved:', imageArr);
        await launchCameraFromNotebook();
      }
    }
    catch (e) {
      Alert.alert('Error Getting Photo!');
      toggleLoading(false);
    }
  };

  const samplesModalCancel = () => {
    console.log('Samples Modal Cancel Selected');
  };

  const renderAllSpotsPanel = () => {
    return (
      <View style={[notebookStyles.allSpotsPanel,]}>
        <AllSpotsPanel/>
      </View>
    );
  };


  const renderLoadProjectFromModal = () => {
    return (
      <InitialProjectLoadModal
        visible={isProjectLoadSelectionModalVisible}
        closeModal={() => closeInitialProjectLoadModal()}
      />
    );
  };

  const renderInfoDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Whoops...'}
        style={sharedDialogStyles.dialogWarning}
        visible={isInfoMessagesModalVisible}
        onTouchOutside={() => dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, value: false})}
      >
        <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
        <Button
          title={'OK'}
          type={'clear'}
          onPress={() => dispatch({type: homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE, value: false})}
        />
      </StatusDialogBox>
    );
  };

  const renderErrorMessageDialogBox = () => {
      return (
        <StatusDialogBox
          dialogTitle={'Error...'}
          style={sharedDialogStyles.dialogWarning}
          visible={isErrorMessagesModalVisible}
          onTouchOutside={() => dispatch({type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, value: false})}
        >
          <Text style={sharedDialogStyles.dialogStatusMessageText}>{statusMessages.join('\n')}</Text>
          <Button
            title={'OK'}
            type={'clear'}
            onPress={() => dispatch({type: homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE, value: false})}
          />
        </StatusDialogBox>
      )
  };

  const renderStatusDialogBox = () => {
    return (
      <StatusDialogBox
        dialogTitle={'Status'}
        style={sharedDialogStyles.dialogTitleSuccess}
        visible={isStatusMessagesModalVisible}
        onTouchOutside={() => dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: false})}
        // disabled={progress !== 1 && !uploadErrors}
      >
        <View style={{height: 100}}>

            {isLoading ?
              <View style={{flex: 1}}>
              <BallIndicator
                color={'darkgrey'}
                count={8}
                size={30}
              />
              </View>
              : null}
          <View style={{flex: 1, paddingTop: 15}}>
            <Text style={{textAlign: 'center'}}>{statusMessages.join('\n')}</Text>
            {statusMessages.includes('Download Complete!') || statusMessages.includes('Upload Complete!') ? <Button
              title={'OK'}
              type={'clear'}
              onPress={() => dispatch({type: homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE, value: false})}
            /> : null}
          </View>
        </View>
      </StatusDialogBox>
    );
  };

  const setDraw = async mapModeToSet => {
    mapViewComponent.current.cancelDraw();
    if (mapMode === MapModes.VIEW && mapModeToSet !== MapModes.DRAW.POINT) {
      toggleButton('endDrawButtonVisible', true);
    }
    else if (mapMode === mapModeToSet) mapModeToSet = MapModes.VIEW;
    setMapMode(mapModeToSet);
    //props.setMapMode(mapModeToSet);
    if (mapModeToSet === MapModes.DRAW.POINT) {
      toggleLoading(true);
      try {
        await mapViewComponent.current.setPointAtCurrentLocation();
        toggleLoading(false);
        setMapMode(MapModes.VIEW);
        //props.setMapMode(MapModes.VIEW);
        // openNotebookPanel();
        props.setNotebookPanelVisible(true);
        props.setNotebookPageVisible(NotebookPages.OVERVIEW);
        Animated.timing(animation, {
          toValue: wp('0%'),
          duration: 350,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      }
      catch (err) {
        toggleLoading(false);
        Alert.alert('Geolocation Error', 'Error getting current location. Set a point manually.');
        toggleButton('endDrawButtonVisible', true);
      }
    }
    if (mapModeToSet === MapModes.VIEW) {
      toggleButton('endDrawButtonVisible', false);
    }
    //props.setMapMode(mapModeToSet);
  };

  const saveEdits = async () => {
    mapViewComponent.current.saveEdits();
    //cancelEdits();
    setMapMode(MapModes.VIEW);
    setButtons({
      'editButtonsVisible': false,
      'drawButtonsVisible': true,
    });
  };

  const startEdit = () => {
    setMapMode(MapModes.EDIT);
    setButtons({
      editButtonsVisible: true,
      drawButtonsVisible: false,
    });
    //  toggleButton('editButtonsVisible', true);
    //   toggleButton('drawButtonsVisible', false);
  };

  const closeInitialProjectLoadModal = () => {
    console.log('Starting Project...');
    setIsProjectLoadSelectionModalVisible(false);
  };

  // Toggle given button between true (on) and false (off)
  const toggleButton = (button, isVisible) => {
    console.log('Toggle Button', button, isVisible || !buttons[button]);
    setButtons({
      ...buttons,
      [button]: isVisible ? isVisible : !buttons[button],
    });
  };

  // Toggle given dialog between true (visible) and false (hidden)
  const toggleDialog = dialog => {
    console.log('Toggle', dialog);
    setDialogs({
      ...dialogs,
      [dialog]: !dialogs[dialog],
    });
    console.log(dialog, 'is set to', dialogs[dialog]);
  };

  const toggleImageModal = () => {
    props.setIsImageModalVisible(!props.isImageModalVisible);
  };

  const toggleLoading = bool => {
    props.setLoading(bool);
    console.log('Loading', props.loading);
  };

  const toggleOfflineMapModal = () => {
    setIsOfflineMapModalVisible(!isOfflineMapModalVisible);
    console.log('Modal state', isOfflineMapModalVisible);
  };

  const toggleSwitch = switchName => {
    console.log('Switch', switchName);
    props.onShortcutSwitchChange(switchName);
    console.log(props.shortcutSwitchPosition);
  };

  const toggleToast = () => {
    setToastVisible(!toastVisible);
    console.log('Toast state', toastVisible);
  };

  const modalHandler = (page, modalType) => {
    if (props.isNotebookPanelVisible) {
      closeNotebookPanel();
      props.setModalVisible(modalType);
    }
    else {
      openNotebookPanel(page);
      props.setModalVisible(modalType);
    }
  };

  const onToastShow = () => {
    toggleLoading(false);
    setTimeout(() => {
      toggleToast();
      setAllPhotosSaved([]);
    }, 2000);
  };

  const animateNotebookMenu = {transform: [{translateX: animation}]};
  const animateSettingsPanel = {transform: [{translateX: settingsPanelAnimation}]};
  const leftsideIconAnimation = {transform: [{translateX: leftsideIconAnimationValue}]};
  const rightsideIconAnimation = {transform: [{translateX: rightsideIconAnimationValue}]};
  let compassModal = null;
  let samplesModal = null;

  const homeDrawer =
    <FlingGestureHandler
      direction={Directions.LEFT}
      numberOfPointers={1}
      // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
      onHandlerStateChange={(ev) => flingHandlerSettingsPanel(ev)}
    >
      <Animated.View style={[settingPanelStyles.settingsDrawer, animateSettingsPanel]}>
        <SettingsPanel openNotebookPanel={(pageView) => openNotebookPanel(pageView)}/>
      </Animated.View>
    </FlingGestureHandler>;

  const notebookPanel =
    <FlingGestureHandler
      direction={Directions.RIGHT}
      numberOfPointers={1}
      // onHandlerStateChange={ev => _onTwoFingerFlingHandlerStateChange(ev)}
      onHandlerStateChange={ev => flingHandlerNotebook(ev)}>
      <Animated.View style={[notebookStyles.panel, animateNotebookMenu]}>
        <NotebookPanel
          onHandlerStateChange={(ev, name) => flingHandlerNotebook(ev, name)}
          closeNotebook={closeNotebookPanel}
          textStyle={{fontWeight: 'bold', fontSize: 12}}
          onPress={name => notebookClickHandler(name)} />
      </Animated.View>
    </FlingGestureHandler>;

  // Renders Compass modals in either shortcut or notebook view
  if (props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS && props.isNotebookPanelVisible && !isEmpty(props.selectedSpot)) {
    compassModal =
      <NotebookCompassModal
        close={() => props.setModalVisible(null)}
        onPress={page => modalHandler(page, Modals.SHORTCUT_MODALS.COMPASS)}
      />;
  }
  else if (props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) {
      compassModal =
        <ShortcutCompassModal
          close={() => props.setModalVisible(null)}
          onPress={page => modalHandler(page, Modals.NOTEBOOK_MODALS.COMPASS)}
        />;
  }

  // Renders samples modals in either shortcut or notebook view
  if (props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE && props.isNotebookPanelVisible && !isEmpty(props.selectedSpot)) {
    samplesModal =
      <NotebookSamplesModal
        close={() => props.setModalVisible(null)}
        cancel={() => samplesModalCancel()}
        onPress={(page) => modalHandler(page, Modals.SHORTCUT_MODALS.SAMPLE)}
      />;
  }
  else if (props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) {
      samplesModal =
        <ShortcutSamplesModal
          close={() => props.setModalVisible(null)}
          cancel={() => samplesModalCancel()}
          onPress={(page) => modalHandler(page, Modals.NOTEBOOK_MODALS.SAMPLE)}
        />;
  }

  return (
    <View style={styles.container}>
      {/*{props.isNotebookPanelVisible && notebookPanel}*/}
      <MapView
        mapComponentRef={mapViewComponent}
        mapMode={mapMode}
        startEdit={startEdit}
      />
      {props.vertexStartCoords && <VertexDrag/>}
      {loading && <LoadingSpinner/>}

      {/*{toastVisible &&*/}
      {/*<ToastPopup*/}
      {/*  visible={toastVisible}*/}
      {/*  onShow={() => onToastShow()}*/}
      {/*>*/}
      {/*  {allPhotosSaved.length === 1 ?*/}
      {/*    <Text>{allPhotosSaved.length} Picture Saved!</Text> :*/}
      {/*    <Text>{allPhotosSaved.length} Pictures Saved!</Text>}*/}
      {/*</ToastPopup>}*/}
      {Platform.OS === 'ios' &&
      <Animated.View style={leftsideIconAnimation}>
        {(props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
          props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}

        {(props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
          props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
      </Animated.View>}
      {Platform.OS === 'android' &&
      <View>
        {(props.modalVisible === Modals.NOTEBOOK_MODALS.COMPASS ||
          props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS) && compassModal}

        {(props.modalVisible === Modals.NOTEBOOK_MODALS.SAMPLE ||
          props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE) && samplesModal}
      </View>}
      <View style={styles.topCenter}>
        {buttons.endDrawButtonVisible ?
          <Button
            containerStyle={{alignContent: 'center'}}
            buttonStyle={styles.drawToolsButtons}
            titleStyle={{color: 'black'}}
            title={'End Draw'}
            onPress={clickHandler.bind(this, 'endDraw')}
          />
          : null}
        {buttons.editButtonsVisible ?
          <View>
            <Button
              buttonStyle={styles.drawToolsButtons}
              titleStyle={{color: 'black'}}
              title={'Save Edits'}
              onPress={clickHandler.bind(this, 'saveEdits')}
            />
            <Button
              buttonStyle={[styles.drawToolsButtons, {marginTop: 5}]}
              titleStyle={{color: 'black'}}
              title={'Cancel Edits'}
              onPress={clickHandler.bind(this, 'cancelEdits')}
            />
          </View>
          : null}
      </View>
      <Animated.View style={props.isAllSpotsPanelVisible ? [styles.onlineStatus, rightsideIconAnimation, {right: 125}] : [styles.onlineStatus, rightsideIconAnimation]}>
        <IconButton
          source={props.isOnline ? online : offline}
          // onPress={clickHandler.bind(this, "search")}
        />
      </Animated.View>
      <Animated.View style={props.isAllSpotsPanelVisible ? [styles.rightsideIcons, rightsideIconAnimation, {right: 125}] : [styles.rightsideIcons, rightsideIconAnimation]}>
        {props.shortcutSwitchPosition.Tag ?
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/TagButton.png')}
            onPress={() => clickHandler('tag')}
          /> : null}
        {props.shortcutSwitchPosition.Measurement ?
          <IconButton
            source={props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ? require(
              '../../assets/icons/StraboIcons_Oct2019/MeasurementButton_pressed.png')
              : require('../../assets/icons/StraboIcons_Oct2019/MeasurementButton.png')}
            onPress={() => clickHandler('measurement')}
          /> : null}
        {props.shortcutSwitchPosition.Sample ?
          <IconButton
            source={props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? require(
              '../../assets/icons/StraboIcons_Oct2019/SampleButton_pressed.png')
              : require('../../assets/icons/StraboIcons_Oct2019/SampleButton.png')}
            onPress={() => clickHandler('sample')}
          /> : null}
        {props.shortcutSwitchPosition.Note ?
          <IconButton
            name={'Note'}
            source={require('../../assets/icons/StraboIcons_Oct2019/NoteButton.png')}
            onPress={() => clickHandler('note')}
          /> : null}
        {props.shortcutSwitchPosition.Photo ?
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/PhotoButton.png')}
            onPress={() => clickHandler('photo')}
          /> : null}
        {props.shortcutSwitchPosition.Sketch ?
          <IconButton
            source={require('../../assets/icons/StraboIcons_Oct2019/SketchButton.png')}
            onPress={() => clickHandler('sketch')}
          /> : null}
      </Animated.View>
      <View style={styles.notebookViewIcon}>
        {props.modalVisible === Modals.SHORTCUT_MODALS.COMPASS ||
        props.modalVisible === Modals.SHORTCUT_MODALS.SAMPLE ? null : <IconButton
          source={require('../../assets/icons/StraboIcons_Oct2019/NotebookViewButton.png')}
          onPress={() => openNotebookPanel()}
        />}
      </View>
      {/*<View style={props.isNotebookPanelVisible ? styles.bottomRightIconsShortcutModal*/}
      {/*: styles.bottomRightIcons}>*/}
      {/* displays the Online boolean in text*/}
      {/*<View><Text>Online: {props.isOnline.toString()}</Text></View> */}

      {buttons.drawButtonsVisible ?
        <Animated.View style={props.isAllSpotsPanelVisible ? [styles.drawToolsContainer, rightsideIconAnimation, {right: 125}] :  [styles.drawToolsContainer, rightsideIconAnimation]}>
          <IconButton
            style={{top: 5}}
            source={mapMode === MapModes.DRAW.POINT ?
              require('../../assets/icons/StraboIcons_Oct2019/PointButton_pressed.png') : require(
                '../../assets/icons/StraboIcons_Oct2019/PointButton.png')}
            onPress={clickHandler.bind(this, MapModes.DRAW.POINT)}
          />
          <IconButton
            style={{top: 5}}
            source={mapMode === MapModes.DRAW.LINE ?
              require('../../assets/icons/StraboIcons_Oct2019/LineButton_pressed.png') : require(
                '../../assets/icons/StraboIcons_Oct2019/LineButton.png')}
            onPress={clickHandler.bind(this, MapModes.DRAW.LINE)}
          />
          <IconButton
            style={{top: 5}}
            source={mapMode === MapModes.DRAW.POLYGON ?
              require('../../assets/icons/StraboIcons_Oct2019/PolygonButton_pressed.png') :
              require('../../assets/icons/StraboIcons_Oct2019/PolygonButton.png')}
            onPress={clickHandler.bind(this, MapModes.DRAW.POLYGON)}
          />
        </Animated.View>
        : null}
      {/*</View>*/}
      <Animated.View style={[styles.homeIconContainer, leftsideIconAnimation]}>
        <IconButton
          source={require('../../assets/icons/StraboIcons_Oct2019/HomeButton.png')}
          onPress={clickHandler.bind(this, 'home')}
        />
      </Animated.View>
      <Animated.View style={[styles.leftsideIcons, leftsideIconAnimation]}>
        <IconButton
          source={require('../../assets/icons/StraboIcons_Oct2019/MapActionsButton.png')}
          onPress={() => toggleDialog('mapActionsMenuVisible')}
        />
        <IconButton
          source={require('../../assets/icons/StraboIcons_Oct2019/SymbolsButton.png')}
          onPress={() => toggleDialog('mapSymbolsMenuVisible')}
        />
        <IconButton
          source={require('../../assets/icons/StraboIcons_Oct2019/layersButton.png')}
          onPress={() => toggleDialog('baseMapMenuVisible')}
        />
      </Animated.View>
      <Animated.View style={[styles.bottomLeftIcons, leftsideIconAnimation]}>
        <IconButton
          style={{top: 5}}
          source={require('../../assets/icons/StraboIcons_Oct2019/MyLocationButton.png')}
          onPress={clickHandler.bind(this, 'currentLocation')}
        />
      </Animated.View>
      <MapActionsDialog
        visible={dialogs.mapActionsMenuVisible}
        onPress={(name) => dialogClickHandler('mapActionsMenuVisible', name)}
        onTouchOutside={() => toggleDialog('mapActionsMenuVisible')}
      />
      <MapSymbolsDialog
        visible={dialogs.mapSymbolsMenuVisible}
        onPress={(name) => dialogClickHandler('mapSymbolsMenuVisible', name)}
        onTouchOutside={() => toggleDialog('mapSymbolsMenuVisible')}
      />
      <BaseMapDialog
        visible={dialogs.baseMapMenuVisible}
        onPress={(name) => dialogClickHandler('baseMapMenuVisible', name)}
        onTouchOutside={() => toggleDialog('baseMapMenuVisible')}
      />
      <NotebookPanelMenu
        visible={dialogs.notebookPanelMenuVisible}
        onPress={(name, position) => dialogClickHandler('notebookPanelMenuVisible', name, position)}
        onTouchOutside={() => toggleDialog('notebookPanelMenuVisible')}
      />
      {/*{props.isAllSpotsPanelVisible ? <Animated.View style={[notebookStyles.allSpotsPanel, animateAllSpotsMenu]}>*/}
      {/*  <AllSpotsView*/}
      {/*    close={() => closeAllSpotsPanel()}*/}
      {/*  />*/}
      {/*</Animated.View> : null}*/}
      {/*<Animated.View style={[notebookStyles.allSpotsPanel, animateAllSpotsMenu]}>*/}
      {/*  <AllSpotsView*/}
      {/*    close={() => closeAllSpotsPanel()}*/}
      {/*  />*/}
      {/*</Animated.View>*/}
      <Modal
        isVisible={isOfflineMapModalVisible}
        useNativeDriver={true}
      >
        <View style={styles.modal}>
          <SaveMapModal
            close={toggleOfflineMapModal}
            map={mapViewComponent.current}
          />
        </View>
      </Modal>
      <Modal
        isVisible={props.isImageModalVisible}
        useNativeDriver={true}
        style={{flex: 1}}
      >
        <View style={styles.modal}>
          <Button
            type={'clear'}
            titleProps={{color: 'white'}}
            title='Hide modal'
            onPress={() => toggleImageModal()}/>
          <Image
            source={props.selectedImage ? {uri: useImages.getLocalImageSrc(props.selectedImage.id)} :
              {uri: require('../../assets/images/noimage.jpg')}}
            style={{width: wp('90%'), height: hp('90%')}}
          />
        </View>
      </Modal>
      {notebookPanel}
      {props.isAllSpotsPanelVisible && renderAllSpotsPanel()}
      {homeDrawer}
      {renderLoadProjectFromModal()}
      {renderStatusDialogBox()}
      {renderInfoDialogBox()}
      {renderErrorMessageDialogBox()}
      {/*<View style={{position: 'absolute', left: 550, top: 50, backgroundColor: 'white', padding: 20}}>*/}
      {/*  <Text>{imagesCount} of {imagesNeeded}</Text>*/}
      {/*  <ProgressCircle progress={imagesCount / imagesNeeded} />*/}
      {/*</View>*/}
    </View>
  );
};

function mapStateToProps(state) {
  return {
    currentBasemap: state.map.currentBasemap,
    selectedSpot: state.spot.selectedSpot,
    selectedImage: state.spot.selectedAttributes[0],
    isImageModalVisible: state.home.isImageModalVisible,
    isOnline: state.home.isOnline,
    isNotebookPanelVisible: state.notebook.isNotebookPanelVisible,
    isCompassModalVisible: state.notebook.isCompassModalVisible,
    modalVisible: state.home.modalVisible,
    deviceDimensions: state.home.deviceDimensions,
    spots: state.spot.spots,
    getCurrentProject: state.project.project,
    shortcutSwitchPosition: state.home.shortcutSwitchPosition,
    isAllSpotsPanelVisible: state.home.isAllSpotsPanelVisible,
    vertexStartCoords: state.map.vertexStartCoords,
    userData: state.user.userData,
    homePageVisible: state.settingsPanel.settingsPageVisible,
    homePanelVisible: state.home.isSettingsPanelVisible,
  };
}

const mapDispatchToProps = {
  setLoading: (bool) => ({type: homeReducers.SET_STATUS_BOX_LOADING, bool: bool}),
  setIsOnline: (online) => ({type: homeReducers.SET_ISONLINE, online: online}),
  setHomePanelVisible: (value) => ({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: value}),
  setHomePanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setNotebookPageVisible: (page) => ({type: notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE, page: page}),
  setNotebookPanelVisible: (value) => ({type: notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE, value: value}),
  setSettingsPanelVisible: (value) => ({type: homeReducers.SET_SETTINGS_PANEL_VISIBLE, value: value}),
  setSettingsPanelPageVisible: (name) => ({type: settingPanelReducers.SET_MENU_SELECTION_PAGE, name: name}),
  setIsImageModalVisible: (value) => ({type: homeReducers.TOGGLE_IMAGE_MODAL, value: value}),
  setAllSpotsPanelVisible: (value) => ({type: homeReducers.SET_ALLSPOTS_PANEL_VISIBLE, value: value}),
  deleteSpot: (id) => ({type: spotReducers.DELETE_SPOT, id: id}),
  onSpotEdit: (field, value) => ({type: spotReducers.EDIT_SPOT_PROPERTIES, field: field, value: value}),
  setModalVisible: (modal) => ({type: homeReducers.SET_MODAL_VISIBLE, modal: modal}),
  setDeviceDims: (dims) => ({type: homeReducers.DEVICE_DIMENSIONS, dims: dims}),
  onSpotEditImageObj: (images) => ({type: spotReducers.EDIT_SPOT_IMAGES, images: images}),
  onSetSelectedSpot: (spot) => ({type: spotReducers.SET_SELECTED_SPOT, spot: spot}),
  onShortcutSwitchChange: (switchName) => ({type: homeReducers.SHORTCUT_SWITCH_POSITION, switchName: switchName}),
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
