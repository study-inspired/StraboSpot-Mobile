import {homeReducers} from "./Home.constants";
import {Dimensions, Platform} from 'react-native';

const initialState = {
  modalVisible: null,
  deviceDimensions: Dimensions.get(Platform.OS === 'ios' ? 'window' : 'screen')
};

export const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    case homeReducers.SET_MODAL_VISIBLE:
      return {
        ...state,
        modalVisible: action.modal
      };
    case homeReducers.DEVICE_DIMENSIONS:
      // console.log('REDUX DEVICE DIMS', state.deviceDimensions);
      // console.log('REDUX DIMS ACTION', action)
      return {
        ...state,
        deviceDimensions: {
          height: action.height,
          width: action.width
        }
      }



  }
  return state;
};
