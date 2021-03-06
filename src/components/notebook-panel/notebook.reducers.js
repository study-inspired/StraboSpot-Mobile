import {notebookReducers} from './Notebook.constants';
import {isEmpty} from '../../shared/Helpers';

const initialState = {
  visibleNotebookPagesStack: [],
  isNotebookPanelVisible: false,
  isSamplesModalVisible: false,
};

export const notebookReducer = (state = initialState, action) => {
  switch (action.type) {
    case notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE: {
      let visibleNotebookPagesStack = state.visibleNotebookPagesStack;
      if (isEmpty(visibleNotebookPagesStack)) visibleNotebookPagesStack = [action.page];
      else if (visibleNotebookPagesStack.length > 1 && state.visibleNotebookPagesStack.slice(-2)[0] === action.page) {
        visibleNotebookPagesStack = state.visibleNotebookPagesStack.slice(0, -1);
      }
      else if (state.visibleNotebookPagesStack.slice(-1)[0] !== action.page) {
        visibleNotebookPagesStack = [...visibleNotebookPagesStack, action.page];
      }
      return {
        ...state,
        visibleNotebookPagesStack: visibleNotebookPagesStack,
      };
    }
    case notebookReducers.SET_NOTEBOOK_PAGE_VISIBLE_TO_PREV: {
      return {
        ...state,
        visibleNotebookPagesStack: state.visibleNotebookPagesStack.slice(0, -1),
      };
    }
    case notebookReducers.SET_NOTEBOOK_PANEL_VISIBLE:
      return {
        ...state,
        isNotebookPanelVisible: action.value,
      };
  }
  return state;
};
