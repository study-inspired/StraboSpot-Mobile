import {StyleSheet} from 'react-native';
import * as themes from '../../../shared/styles.constants';

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 15,
    paddingBottom: 10
  },
  container: {
    flex: 1,
    zIndex: 0
  },
  compassContainer: {
    flex: 8,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    width: '100%',
    // zIndex: 100,
  },
  compassImageContainer: {
    alignItems: 'center',
    // flex: 30,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  renderCompassContainer: {
    flex: 60,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR
  },
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 15
  },
  itemTextStyle: {
    fontSize: 14,
    marginLeft: 10,
  },
  noSpotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 700
  },
  compassContentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  sliderContainer: {
    flex: 30,
    alignItems: 'center'
  },
  switchContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  switch: {
    justifyContent: 'flex-end'
  },
  strikeAndDipLine: {
    zIndex: 10,
    height: 170,
    width: 170,
    position: 'absolute',
    top: 50,
    resizeMode: 'contain',
  },
  toggleButtonsContainer: {
    backgroundColor: 'transparent',
    padding: 10
  },
  toggleButtonsRowContainer: {
    flex: 25,
    flexDirection: 'column',
    paddingTop: 25
  },
  trendLine: {
    height: 150,
    width: 150,
    position: 'absolute',
    top: 60,
    resizeMode: 'contain',
  },
  modalPosition: {
    position: 'absolute',
    left: 70,
    bottom: 10,
  },
  modalPositionShortcutView: {
    position: 'absolute',
    right: 70,
    bottom: 70
  },
});

export default styles;