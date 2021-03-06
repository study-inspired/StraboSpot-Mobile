import {PropTypes} from 'prop-types';
import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {isEmpty} from '../../shared/Helpers';

// Styles
import styles from './form.styles';
import stylesCommon from '../../shared/common.styles';

const NumberInputField = ({
                            field: {name, onBlur, onChange, value},
                            form: {errors, touched},
                            ...props
                          }) => {

  const getDisplayValue = value => {
    if (!isEmpty(value)) return value.toString();
    return value;
  };

  return (
    <View style={stylesCommon.rowContainer}>
      <View style={stylesCommon.row}>
        <View style={stylesCommon.fixedWidthSide}>
          <Text style={styles.fieldLabel}>{props.label}</Text>
        </View>
        <View style={stylesCommon.fillWidthSide}>
          <TextInput
            onChangeText={onChange(name)}
            onBlur={onBlur(name)}
            style={styles.fieldValue}
            value={getDisplayValue(value)}
            keyboardType={'numeric'}
          />
        </View>
      </View>
      {errors[name] && <Text style={styles.fieldError}>{errors[name]}</Text>}
    </View>
  );
};

NumberInputField.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    // value: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    errors: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
  }).isRequired,
};

export default NumberInputField;
