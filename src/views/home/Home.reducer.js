import {homeReducers} from './Home.constants';
import {Dimensions} from 'react-native';

const initialState = {
  statusMessages: [],
  imageProgress: {
    imagesDownloadedCount: 0,
    neededImageIds: 0,
  },
  isOnline: null,
  loading: false,
  modalVisible: null,
  isStatusMessagesModalVisible: false,
  isErrorMessagesModalVisible: false,
  isInfoModalVisible: false,
  isImageModalVisible: false,
  isAllSpotsPanelVisible: false,
  isSettingsPanelVisible: false,
  deviceDimensions: Dimensions.get('window'),
  shortcutSwitchPosition: {
    Tag: false,
    Measurement: false,
    Sample: false,
    Note: false,
    Photo: false,
    Sketch: false,
  },
};

export const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case homeReducers.SET_MODAL_VISIBLE:
      return {
        ...state,
        modalVisible: action.modal,
      };
    case homeReducers.SET_STATUS_MESSAGES_MODAL_VISIBLE:
      return {
        ...state,
        isStatusMessagesModalVisible: action.value,
      };
    case homeReducers.SET_ERROR_MESSAGES_MODAL_VISIBLE:
      return {
        ...state,
        isErrorMessagesModalVisible: action.value,
      };
    case homeReducers.SET_INFO_MESSAGES_MODAL_VISIBLE:
      return {
        ...state,
        isInfoModalVisible: action.value,
      };
    case homeReducers.DEVICE_DIMENSIONS:
      // console.log('REDUX DEVICE DIMS', state.deviceDimensions);
      // console.log('REDUX DIMS ACTION', action)
      return {
        ...state,
        deviceDimensions: action.dims,
      };
    case homeReducers.SHORTCUT_SWITCH_POSITION:
      return {
        ...state,
        shortcutSwitchPosition: {
          ...state.shortcutSwitchPosition,
          [action.switchName]: !state.shortcutSwitchPosition[action.switchName],
        },
      };
    case homeReducers.SET_ALLSPOTS_PANEL_VISIBLE:
      return {
        ...state,
        isAllSpotsPanelVisible: action.value,
      };
    case homeReducers.SET_SETTINGS_PANEL_VISIBLE:
      return {
        ...state,
        isSettingsPanelVisible: action.value,
      };
    case homeReducers.TOGGLE_IMAGE_MODAL:
      return {
        ...state,
        isImageModalVisible: action.value,
      };
    case homeReducers.SET_ISONLINE:
      return {
        ...state,
        isOnline: action.online,
      };
    case homeReducers.SET_STATUS_BOX_LOADING:
      return {
        ...state,
        loading: action.value,
      };
    case homeReducers.ADD_STATUS_MESSAGE:
      return {
        ...state,
        statusMessages: [...state.statusMessages, action.statusMessage],
      };
    case homeReducers.REMOVE_LAST_STATUS_MESSAGE:
      return {
        ...state,
        statusMessages: state.statusMessages.slice(0, -1),
      };
    case homeReducers.CLEAR_STATUS_MESSAGES:
      return {
        ...state,
        statusMessages: [],
      };
  }
  return state;
};
