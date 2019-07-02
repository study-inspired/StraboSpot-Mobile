import React from 'react';
import {StyleSheet} from 'react-native';
import Dialog, {DialogButton, DialogContent, DialogTitle} from "react-native-popup-dialog";
import {ScaleAnimation} from "react-native-popup-dialog/src";

// Styles
import * as themes from '../../../shared/styles.constants';

const scaleAnimation = new ScaleAnimation({
  useNativeDriver: true
});

const MapSymbolsDialog = props => (
  <Dialog
    width={.3}
    dialogAnimation={scaleAnimation}
    dialogStyle={styles.dialogBox}
    visible={props.visible}
    dialogTitle={
      <DialogTitle
        title="Map Symbols"
        style={styles.dialogTitle}
        textStyle={
          {
            color: "white",
            fontSize: themes.PRIMARY_TEXT_SIZE,
            fontWeight: "bold"
          }
        }
      />}
    onTouchOutside={props.onTouchOutside}
  >
    <DialogContent>
      <DialogButton
        style={styles.dialogContent}
        text="Foliations"
        onPress={() => props.onPress("foliations")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Bedding"
        onPress={() => props.onPress("bedding")}
      />
      <DialogButton
        style={styles.dialogContent}
        text="Faults"
        onPress={() => props.onPress("faults")}
      />
      <DialogButton
      style={styles.dialogContent}
      text="Fold Hinges"
      onPress={() => props.onPress("fold-hinges")}
    />
      <DialogButton
        style={styles.dialogContent}
        text="Fractures"
        onPress={() => props.onPress("fractures")}
      />
    </DialogContent>
  </Dialog>
);

const styles = StyleSheet.create({
  dialogBox: {
    position: 'absolute',
    bottom: 70,
    left: 100,
    backgroundColor: themes.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 20
  },
  dialogTitle: {
    backgroundColor: themes.PRIMARY_HEADER_TEXT_COLOR,
  },
  dialogContent: {
    borderBottomWidth: 2
  }
});

export default MapSymbolsDialog;