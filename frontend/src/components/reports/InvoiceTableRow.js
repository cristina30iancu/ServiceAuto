import React, {Fragment} from 'react';
import {Text, View, StyleSheet } from '@react-pdf/renderer';

const borderColor = '#90e5fc'
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomColor: '#bff0fd',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
    },
    description: {
        width: '60%',
        textAlign: 'left',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        paddingLeft: 8,
    },
    qty: {
        width: '40%',
        borderRightColor: borderColor,
        borderRightWidth: 1,
        textAlign: 'right',
        paddingRight: 8,
    }
  });


const InvoiceTableRow = ({items}) => {
    const rows = items ? items.map( item => 
        <View style={styles.row} key={item.ServiceID.toString()}>
            <Text style={styles.description}>{item.Name}</Text>
            <Text style={styles.qty}>{item.Price}</Text>
        </View>
    ) : (<div></div>)
    return (<Fragment>{rows}</Fragment> )
};
  
  export default InvoiceTableRow