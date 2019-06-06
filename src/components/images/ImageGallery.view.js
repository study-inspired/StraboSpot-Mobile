import React, {useState} from 'react';
import {Alert, Button, Image, ScrollView, Text, View} from 'react-native';
import {Navigation} from "react-native-navigation";
import {pictureSelectDialog, saveFile} from './Images.container';
import {ADD_PHOTOS} from "../../store/Constants";
import {connect} from "react-redux";
import imageStyles from './images.styles'

const imageGallery = (props) => {
let savedArray = [];

  const imageSave = async () => {

    console.log('JJAJAJ', savedArray);

    const savedPhoto = await pictureSelectDialog();
    console.log('imageObj', savedPhoto);

    if (savedPhoto === 'cancelled') {
      console.log('User cancelled image picker', savedArray);
      if (savedArray.length > 0) {
        console.log('ALL PHOTOS SAVED', savedArray);
        props.addPhoto(savedArray);
      }
      else {
        Alert.alert('No Photos To Save', 'please try again...')
      }
    }
    else if (savedPhoto.error) {
      console.log('ImagePicker Error: ', savedPhoto.error);
    }
    else {
      savedArray.push(savedPhoto);
      console.log('AllPhotosSaved', savedArray);
      imageSave();
    }
  };


  return (
    <View style={imageStyles.container}>
      <Text style={{
        margin: 30,
      }}>Images Page</Text>
      <ScrollView contentContainerstyle={imageStyles.imageContainer}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignContent: 'center',
          justifyContent: 'space-around'
        }}>
          {Object.values(props.imagePaths).map(image => {
            return <Image key={image} style={imageStyles.image} source={{uri: image}}/>
          })}
        </View>
      </ScrollView>
      {/*<View style={imageStyles.imageContainer}>*/}
      {/*<ScrollView >*/}
      {/*{   Object.values(this.props.imagePaths).map(image => {*/}
      {/*    return <Image key={image} style={imageStyles.image} source={{uri: image}}/>*/}
      {/*})}*/}
      {/*</ScrollView>*/}
      {/*</View>*/}
      {/*<FlatList*/}
      {/*  data={Object.values(this.props.imagePaths)}*/}
      {/*  renderItem={this.renderImage}*/}
      {/*  style={imageStyles.flatListStyle}*/}
      {/*  numColumns={2}*/}
      {/*  keyExtractor={(item) => item.item}*/}
      {/*/>*/}
      <Button
        onPress={() => Navigation.push(props.componentId, {
          component: {
            name: 'Home'
          }
        })}
        title="Go Back"
      />
      <Button
        onPress={() => imageSave()}
        title="Picture"
      />
    </View>
  );
};

const mapStateToProps = (state) => {
  console.log('MP to P', state);
  return {
    imagePaths: state.images.imagePaths
  }
};

const mapDispatchToProps = {
  addPhoto: (image) => ({type: ADD_PHOTOS, images: image})
};

export default connect(mapStateToProps, mapDispatchToProps)(imageGallery);
