import {StyleSheet} from 'react-native';
import * as themes from "../../../shared/styles.constants";

const samplesDetailStyle = StyleSheet.create({
  container:{
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttons: {
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.BLUE
  },
});

export default samplesDetailStyle;
