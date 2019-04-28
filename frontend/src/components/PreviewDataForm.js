import React, {Component} from 'react';
import { Button, InputGroup, InputGroupAddon, InputGroupText, Input} from 'reactstrap';

/**
 * Form used by user to preview the most recent n data points
 * in the main chart.
 */
export default class PreviewDataForm extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div>
            <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                <InputGroupText>Host</InputGroupText>
                </InputGroupAddon>
                <Input type="datetime" name="host" defaultValue="TBD" />
            </InputGroup>

        </div>
        )
    }
}