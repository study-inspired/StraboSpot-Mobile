import React, {Component} from 'react';
import {AsyncStorage, Picker, Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import ButtonWithBackground from '../../../ui/ButtonWithBackground';
import ButtonNoBackground from '../../../ui/ButtonNoBackround';
import {Header} from 'react-native-elements';
import MaterialCommunityIcons from '../../../shared/Icons';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {unzip} from 'react-native-zip-archive'; /*TODO  react-native-zip-archive@3.0.1 requires a peer of react@^15.4.2 || <= 16.3.1 but none is installed */
import ProgressBar from 'react-native-progress/Bar';
import {connect} from 'react-redux';

import {
  CURRENT_BASEMAP,
  OFFLINE_MAPS
} from '../../../store/Constants';

var RNFS = require('react-native-fs');


class SaveMapModal extends Component {
  _isMounted = false;

  constructor(props, context) {
    super(props, context);

    this.tilehost = 'http://tiles.strabospot.org';

    let dirs = RNFetchBlob.fs.dirs;
    this.devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
    this.tilesDirectory = '/StraboSpotTiles';
    this.tileZipsDirectory = this.devicePath + this.tilesDirectory + '/TileZips';
    this.tileCacheDirectory = this.devicePath + this.tilesDirectory + '/TileCache';
    this.tileTempDirectory = this.devicePath + this.tilesDirectory + '/TileTemp';
    this.mapID = '2a542a65-ab88-fc7d-c35e-961cd23339d4';
    this.zipError = '';
    this.tryCount = 0;

    this.state = {
      downloadZoom: null,
      tileCount: 0,
      showComplete: false,
      showMainMenu: true,
      showLoadingMenu: false,
      showLoadingBar: false,
      progressMessage: '',
      percentDone: 0,
      downloadZoom: 0
    };

    console.log("Props: ", props);

    //this.currentBasemap = props.map.getCurrentBasemap();
    this.currentBasemap = props.currentBasemap;
    this.saveId = this.currentBasemap.layerSaveId;
    this.currentMapName = this.currentBasemap.layerLabel;
    this.maxZoom = this.currentBasemap.maxZoom;
    this.saveLayerId = this.currentBasemap.layerSaveId;
    this.zoomLevels = [];
    this.offlineMapsData = [];

    props.map.getCurrentZoom().then((zoom) => { //get current zoom and then calculate zoom levels to display

      this.currentZoom = Math.round(zoom);
      this.state.downloadZoom = Math.round(zoom);

      var numZoomLevels = this.maxZoom ? Math.min(this.maxZoom - this.currentZoom + 1, 5) : 5;

      for(let i = 0; i < numZoomLevels; i++){
        this.zoomLevels.push(this.currentZoom + i);
      }

      this.updateCount();
    })

    props.map.getExtentString().then((ex) => {
      console.log("Got extent String: ",ex);
      this.extentString = ex;
    })

  }

  saveMap = () => {
    this.setState({showMainMenu: false});
    this.setState({showLoadingMenu: true});
    this.setState({showLoadingBar: true});
    this.getMapTiles(this.extentString, this.saveLayerId, this.state.downloadZoom).then(() => {
      this.setState({showMainMenu: false});
      this.setState({showLoadingMenu: false});
      this.setState({showLoadingBar: false});
      this.setState({showComplete: true});
    });
  }

  updateCount = async () => {
    this.props.map.getTileCount(this.state.downloadZoom).then((tileCount) => {
      console.log("downloadZoom: ",this.state.downloadZoom);
      this.setState({tileCount: tileCount})
      console.log("return_from_mapview_getTileCount: ", tileCount);
  	})
  }

  updatePicker = async (itemValue) => {
    await this.setState({downloadZoom: itemValue});
    this.updateCount();
  }

  async componentDidMount() {
    this._isMounted = true;

  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Start getting the tiles to download by creating a zip url
  getMapTiles = async (extentString, layerID, zoomLevel) => {
    this.setState({progressMessage: 'Starting Download...'});
    let startZipURL = this.tilehost + '/asynczip?mapid=' + this.mapID + '&layer=' + layerID + '&extent=' + extentString + '&zoom=' + zoomLevel;
    await this.saveZipMap(startZipURL);
    return Promise.resolve();
  };

  saveZipMap = async (startZipURL) => {
    let response = await fetch(startZipURL);
    let responseJson = await response.json();
    const zipUID = responseJson.id;
    if (zipUID) {
      await this.checkStatus(zipUID);
    }
    return Promise.resolve();
  };

  delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  checkStatus = async (zipUID) => {
    const checkZipURL = this.tilehost + '/asyncstatus/' + zipUID;
    try {
      let response = await fetch(checkZipURL);
      let responseJson = await response.json();
      if (responseJson.error) {
        this.zipError = responseJson.error;
        this.setState({progressMessage: responseJson.error});
        this.setState({percentDone: 1});
      }
      else {
        this.setState({progressMessage: responseJson.status});
        this.setState({percentDone: responseJson.percent / 100});
      }
    } catch {
      console.log('Network Error');
    }
    this.tryCount++;

    if (this.tryCount <= 200 && this.state.progressMessage !== 'Zip File Ready.' && this.zipError === '') {
      await this.delay(1000);
      await this.checkStatus(zipUID);
    }
    else {
      this.setState({progressMessage: 'Downloading Tiles...'});
      await this.downloadZip(zipUID);
      await this.delay(3000);
      await this.doUnzip(zipUID);
    }
  };

  downloadZip = async (zipUID) => {
    try {
      const downloadZipURL = this.tilehost + '/ziptemp/' + zipUID + '/' + zipUID + '.zip';

      //first try to delete from temp directories
      let fileExists = await RNFS.exists(this.tileZipsDirectory + '/' + zipUID + '.zip');
      if(fileExists){
        //delete
        await RNFS.unlink(this.tileZipsDirectory + '/' + zipUID + '.zip');
      }

      let folderExists = await RNFS.exists(this.tileTempDirectory + '/' + zipUID);
      if(folderExists){
        //delete
        await RNFS.unlink(this.tileTempDirectory + '/' + zipUID);
      }

      let res = await RNFetchBlob
        .config({path: this.tileZipsDirectory + '/' + zipUID + '.zip'})
        .fetch('GET', downloadZipURL, {})
        .progress((received, total) => {
        console.log('progress', received / total);
        this.setState({percentDone: received / total});
        });
      console.log('Zip file saved to', res.path());
      this.setState({percentDone: 1});
    } catch (err) {
      console.log('Download Tile Zip Error :', err);
    }
  };

  tileMove = async (tilearray,zipUID) => {
      for (const tile of tilearray) {
        let fileExists = await RNFS.exists(this.tileCacheDirectory + '/' + this.saveId + '/tiles/' + tile.name);
        console.log("foo exists: ", tile.name + ' ' + fileExists);
        if(!fileExists){
          await RNFS.moveFile(this.tileTempDirectory + '/' + zipUID + '/tiles/' + tile.name, this.tileCacheDirectory + '/'+this.saveId + '/tiles/' + tile.name);
          console.log(tile);
        }
      }
  }

  moveFiles = async (zipUID) => {
    let folderexists = await RNFS.exists(this.tileCacheDirectory+'/'+this.saveId);
    if(!folderexists){
      console.log("FOLDER DOESN'T EXIST! "+this.saveId);
      await RNFS.mkdir(this.tileCacheDirectory+'/'+this.saveId);
      await RNFS.mkdir(this.tileCacheDirectory+'/'+this.saveId+'/tiles');
    }

    //now move files to correct location
    let result = await RNFS.readDir(this.tileTempDirectory + '/' + zipUID + '/tiles') //MainBundlePath // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)

    await this.tileMove(result,zipUID);

    let tileCount = await RNFS.readDir(this.tileCacheDirectory+'/'+this.saveId+'/tiles');
    tileCount = tileCount.length;

    currentOfflineMaps = this.props.offlineMaps;

    //now check for existence of AsyncStorage offlineMapsData and store new count
    if(!currentOfflineMaps){
      currentOfflineMaps=[];
    }

    let newOfflineMapsData = [];
    let thisMap = {};
    thisMap.name = this.saveId;
    thisMap.count = tileCount;
    newOfflineMapsData.push(thisMap);

    //loop over offlineMapsData and add any other maps (not current)
    for(let i = 0; i < currentOfflineMaps.length; i++){
      if(currentOfflineMaps[i].name){
        if(currentOfflineMaps[i].name != this.saveId){
          //Add it to new array for Redux Storage
          newOfflineMapsData.push(currentOfflineMaps[i]);
        }
      }
    }

    await this.props.onOfflineMaps(newOfflineMapsData);
    console.log("Saved offlineMaps to Redux.");

  }

  doUnzip = async (zipUID) => {
    // hide progress bar
    this.setState({showLoadingBar: false});
    this.setState({percentDone: 0});
    this.setState({progressMessage: 'Installing Tiles in StraboSpot...'});

    const sourcePath = this.tileZipsDirectory + '/' + zipUID + '.zip';
    const targetPath = this.tileTempDirectory;

    try {

      await unzip(sourcePath, targetPath);
      console.log('unzip completed')

      await this.moveFiles(zipUID); //move files to the correct folder based on saveId
      console.log('move done.');

    } catch (err) {
      console.log('Unzip Error:', err);
    }

    return Promise.resolve();
  };

  render() { //return whole modal here
    return (

      <View style={styles.modalContainer}>
        <Header
          backgroundColor={'lightgrey'}
          containerStyle={{height: 50}}
          leftComponent={<ButtonNoBackground
            onPress={this.props.close}>
            <MaterialCommunityIcons.FontAwesome5
              name={'times'}
              size={20}
            />
          </ButtonNoBackground>}
        />
        <View style={{height: 40, justifyContent: 'center'}}>
        <Text style={{fontSize: 20}}>{this.currentMapName}</Text>
        </View>

        { this.state.showMainMenu &&
          <View style={{height: 20, width: '100%', paddingLeft: 5}}>
            <Text>
            Select max zoom level to download:
            </Text>
          </View>
        }

        { this.state.showMainMenu &&
          <Picker
            selectedValue={this.state.downloadZoom}
            onValueChange={(itemValue) => this.updatePicker(itemValue)}
            style={styles.picker}>
        		{
          		this.zoomLevels.map(function(i){
          		return     <Picker.Item
                                label={i.toString()}
                                value={i}
                                key={i}
                            />
          		})
        		}
          </Picker>
        }

        { this.state.showMainMenu &&
          <ButtonWithBackground
            onPress={this.saveMap} //pass in zoom
            style={styles.buttonText}
            color={'blue'}
          >Download {this.state.tileCount} Tiles</ButtonWithBackground>
        }

        { this.state.showLoadingMenu &&
          <View style={{height: 40, justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>{this.state.progressMessage}</Text>
          </View>
        }

        { this.state.showLoadingBar &&
          <View style={{height: 40, justifyContent: 'center'}}>
            <ProgressBar progress={this.state.percentDone} width={200} />
          </View>
        }

        { this.state.showComplete &&
          <View style={{height: 40, justifyContent: 'center'}}>
            <Text style={{fontSize: 20}}>Success!</Text>
          </View>
        }

        { this.state.showComplete &&
          <View style={{height: 40, justifyContent: 'center'}}>
            <Text>Your map has been successfully downloaded to this device.</Text>
          </View>
        }

        { this.state.showComplete &&
          <ButtonWithBackground
            onPress={this.props.close}
            style={styles.buttonText}
            color={'blue'}
          >Continue</ButtonWithBackground>
        }

      </View>

    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: 400,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  buttonText: {
    paddingLeft: 10,
    paddingRight: 15
  },
  picker: {
    left: 0,
    right: 0,
    width: '100%'
  }
});

const mapStateToProps = (state) => {
  return {
    currentBasemap: state.map.currentBasemap,
    offlineMaps: state.home.offlineMaps
  }
};

const mapDispatchToProps = {
  onOfflineMaps: (offlineMaps) => ({type: OFFLINE_MAPS, offlineMaps: offlineMaps})
};

export default connect(mapStateToProps, mapDispatchToProps)(SaveMapModal);
