import {StyleSheet} from "react-native";
import * as themes from "../../shared/styles.constants";

const imageStyles = StyleSheet.create({
  button: {
    flex: 15,
    alignItems: 'center',
    paddingBottom: 10
  },
  closeInfoView: {
    fontWeight: 'bold',
    position: "absolute",
    right: 20,
    top: 30,
  },
  imageContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  imageInfoButtons: {
    marginTop: 20
  },
  rightsideIcons: {
    position: "absolute",
    right: 10,
    bottom: 50,
  },
  galleryImageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-around'
  },
  galleryImageListContainer: {
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    padding: 5,
    paddingTop: 0,
    justifyContent: 'space-between'
  },
  notebookImage: {
    width: 135,
    height: 100,
  },
  noImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImage: {
    height: 85,
    width: 85,
  },
  headingText: {
    marginLeft: 10,
    fontWeight: '600',
    fontSize: themes.PRIMARY_HEADER_TEXT_SIZE - 2,
  },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flatListStyle: {
    flex: 1
  },
  containerStyle: {
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
  fullImageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: '98%',
    resizeMode: 'contain',
  },
  closeButtonStyle: {
    width: 25,
    height: 25,
    top: 9,
    right: 9,
    position: 'absolute',
  },
  modalPosition: {
    position: 'absolute',
    right: 100,
    bottom: 20,
  },
  modalContainer: {
    flex: 8,
    backgroundColor: themes.SECONDARY_BACKGROUND_COLOR,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10
  },
  inputText: {
    paddingLeft: 10,
    fontSize: 16
  },
  textbox: {
    fontSize: 14,
    paddingLeft: 10,
    height: 75,
    borderRadius: 10,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    marginBottom: 10
  },
  textboxContainer: {
    paddingLeft: 10,
    paddingRight: 10
  },
  switch: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});

export default imageStyles;
