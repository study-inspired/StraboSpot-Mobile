import {StyleSheet} from 'react-native';
import * as themes from '../../shared/styles.constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
  },
  navItemStyle: {
    padding: 3,
    marginLeft: 5
  },
  navSectionStyle: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    flex: 1,
  },
  listContainer: {
    flex: 8,
  },
  sectionHeading: {
    alignItems: 'flex-start',
    paddingLeft: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
  },
  sectionHeadingTextStyle: {
    paddingTop: 5,
    paddingBottom: 5,
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_TEXT_SIZE,
  },
  footerContainer: {
    padding: 20,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR
  },
  buttons: {
    paddingLeft: 10,
    paddingRight: 10,
    color: themes.BLUE
  },
  headingText: {
    fontWeight: 'bold',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE,
  },
  profileContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  profileButtons: {
    marginTop: 0
  },
  userButton: {
    alignItems: 'flex-end',
    marginTop: 10,
    paddingLeft: 25
  },
  profileNameAndImageContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 0
  },
  avatarImageContainer: {
    flex:2,
    justifyContent: 'center',
  },
  avatarLabelContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  avatarLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10
  },
  projectName: {
    flex: 2,
    alignContent: 'center',
  },
  projectNameText: {
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE + 5,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default styles;
