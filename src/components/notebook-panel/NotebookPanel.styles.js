import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const notebookStyles = StyleSheet.create({
  panel: {
    flex: 1,
    width: 400,
    height: '100%',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    position: 'absolute', //Here is the trick
    right: 0,
    zIndex: 1,
  },
  allSpotsPanel: {
    flex: 1,
    justifyContent: 'center',
    width: 125,
    height: '100%',
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderWidth: 1,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    height: 70,
    padding: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderTopLeftRadius: 30,
  },
  centerContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 60,
    borderTopWidth: 1,
    padding: 10,
    borderBottomLeftRadius: 30,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  noSpotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  collapsibleSectionHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    lineHeight: 30
  },
  collapsibleSectionHeaderText: {
    fontSize: 16,
    lineHeight: 30,
    textTransform: 'uppercase',
    color: themes.SECONDARY_HEADER_TEXT_COLOR
  },
  dialogBox: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20,
    zIndex: 10
  },
  dialogContent: {
    borderBottomWidth: 1
  }
});

export default notebookStyles;
