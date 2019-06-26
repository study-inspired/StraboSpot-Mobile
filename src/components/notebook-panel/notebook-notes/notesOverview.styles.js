import {StyleSheet} from 'react-native'
import * as themes from '../../../themes/ColorThemes';

const noteStyles = StyleSheet.create({
  noteBox: {
    margin: 10,
    backgroundColor: 'white',
    padding: 10
  },
  timestampText: {
    color: themes.MEDIUMGREY
  }
});

export default noteStyles;