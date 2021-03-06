import React from 'react';
import {View} from 'react-native';
import IconButton from '../../../shared/ui/IconButton';
import footerStyle from './NotebookFooter.styles';
import {NotebookPages} from '../Notebook.constants';
import {IconButtons} from '../../../shared/app.constants';
import {connect} from 'react-redux';
import {isEmpty} from '../../../shared/Helpers';

const NotebookFooter = props => {

  const getPageIcon = (page) => {
    switch (page) {
      case NotebookPages.TAG:
        if (props.notebookPageVisible === NotebookPages.TAG) return require('../../../assets/icons/StraboIcons_Oct2019/Tag_pressed.png');
        else return require('../../../assets/icons/StraboIcons_Oct2019/Tag.png');
      case NotebookPages.MEASUREMENT:
        if (props.notebookPageVisible === NotebookPages.MEASUREMENT || props.notebookPageVisible === NotebookPages.MEASUREMENTDETAIL) {
          return require('../../../assets/icons/StraboIcons_Oct2019/Measurement_pressed.png');
        }
        else return require('../../../assets/icons/StraboIcons_Oct2019/Measurement.png');
      case NotebookPages.SAMPLE:
        if (props.notebookPageVisible === NotebookPages.SAMPLE) return require('../../../assets/icons/StraboIcons_Oct2019/Sample_pressed.png');
        else return require('../../../assets/icons/StraboIcons_Oct2019/Sample.png');
      case NotebookPages.NOTE:
        if (props.notebookPageVisible === NotebookPages.NOTE) return require('../../../assets/icons/StraboIcons_Oct2019/Note_pressed.png');
        else return require('../../../assets/icons/StraboIcons_Oct2019/Note.png');
      case NotebookPages.PHOTO:
        if (props.notebookPageVisible === NotebookPages.PHOTO) return require('../../../assets/icons/StraboIcons_Oct2019/Photo_pressed.png');
        else return require('../../../assets/icons/StraboIcons_Oct2019/Photo.png');
      case NotebookPages.SKETCH:
        if (props.notebookPageVisible === NotebookPages.SKETCH) return require('../../../assets/icons/StraboIcons_Oct2019/Sketch_pressed.png');
        else return require('../../../assets/icons/StraboIcons_Oct2019/Sketch.png');
    }
  };

  return (
    <View style={footerStyle.footerIconContainer}>
      <IconButton
        source={getPageIcon(NotebookPages.TAG)}
        style={footerStyle.footerIcon}
      />
      <IconButton
        source={getPageIcon(NotebookPages.MEASUREMENT)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.MEASUREMENT)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.SAMPLE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.SAMPLE)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.NOTE)}
        style={footerStyle.footerIcon}
        onPress={() => props.openPage(NotebookPages.NOTE)}

      />
      <IconButton
        source={getPageIcon(NotebookPages.PHOTO)}
        style={footerStyle.footerIcon}
        onPress={() => props.onPress(IconButtons.CAMERA)}
      />
      <IconButton
        source={getPageIcon(NotebookPages.SKETCH)}
        style={footerStyle.footerIcon}
      />
    </View>
  );
};

function mapStateToProps(state) {
  return {
    notebookPageVisible: isEmpty(state.notebook.visibleNotebookPagesStack) ? null :
      state.notebook.visibleNotebookPagesStack.slice(-1)[0],
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(NotebookFooter);
